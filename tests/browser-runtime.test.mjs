import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { chromium } from "playwright-chromium";

const outputRoot = resolve(import.meta.dirname, "../out");
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
  [".woff2", "font/woff2"],
]);

let browser;
let server;
let origin;

function outputPath(requestUrl) {
  let pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    pathname = pathname.slice(basePath.length);
  }
  const relativePath = pathname.replace(/^\/+/, "");
  const candidate = join(outputRoot, relativePath);
  return pathname.endsWith("/") ? join(candidate, "index.html") : candidate;
}

before(async () => {
  server = createServer(async (request, response) => {
    try {
      let filePath = outputPath(request.url || "/");
      const fileStat = await stat(filePath);
      if (fileStat.isDirectory()) filePath = join(filePath, "index.html");
      const body = await readFile(filePath);
      response.writeHead(200, {
        "cache-control": "no-store",
        "content-type": mimeTypes.get(extname(filePath)) || "application/octet-stream",
      });
      response.end(body);
    } catch {
      response.writeHead(404);
      response.end("Not found");
    }
  });
  await new Promise((resolveListen) => server.listen(0, "127.0.0.1", resolveListen));
  const address = server.address();
  assert.ok(address && typeof address === "object");
  origin = `http://127.0.0.1:${address.port}`;
  browser = await chromium.launch({ headless: true });
});

after(async () => {
  await browser?.close();
  await new Promise((resolveClose, reject) => {
    server?.close((error) => error ? reject(error) : resolveClose());
  });
});

// 直接打开生产静态导出，守住 Reveal ready、唯一活动页和播放器计数同步。
test("initializes the exported Slides player and advances from the cover", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const runtimeErrors = [];
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().includes("/_next/")) {
      runtimeErrors.push(`${response.status()} ${response.url()}`);
    }
  });
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto(`${origin}${basePath}/slides/component-guide/`);
  await page.locator(".reveal.ready").waitFor();
  assert.equal(await page.locator(".slides > section.present").count(), 1);
  await page.getByRole("button", { name: "Next slide" }).click();
  await page.locator(".slides-counter span").first().waitFor();
  await assert.doesNotReject(async () => {
    await page.waitForFunction(() => document.querySelector(".slides-counter span")?.textContent === "02");
  });
  assert.equal(await page.locator(".slides > section.present").count(), 1);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
});

// 富内容页必须渲染图表和图片，并让有序/无序列表显示舒适的黑色数字与圆点。
test("renders Mermaid and deploy-safe images in the exported component guide", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));

  await page.goto(`${origin}${basePath}/me/component-guide/`);
  const articleOrderedItem = page.locator(".prose .rin-list-ordered li").first();
  const articleBulletItem = page.locator(".prose .rin-list-unordered li").first();
  await articleOrderedItem.waitFor();
  assert.deepEqual(await articleOrderedItem.evaluate((item) => ({
    color: getComputedStyle(item, "::marker").color,
    type: getComputedStyle(item).listStyleType,
  })), { color: "rgb(37, 38, 33)", type: "decimal" });
  assert.deepEqual(await articleBulletItem.evaluate((item) => ({
    color: getComputedStyle(item, "::marker").color,
    type: getComputedStyle(item).listStyleType,
  })), { color: "rgb(37, 38, 33)", type: "disc" });

  await page.goto(`${origin}${basePath}/slides/component-guide/`);
  await page.locator(".reveal.ready").waitFor();
  const targetIndex = await page.locator(".slides > section").evaluateAll((slides) =>
    slides.findIndex((slide) => slide.querySelector("[data-mermaid-diagram]")),
  );
  assert.ok(targetIndex > 0);
  for (let index = 0; index < targetIndex; index += 1) {
    await page.getByRole("button", { name: "Next slide" }).click();
    const expected = (index + 2).toString().padStart(2, "0");
    await page.waitForFunction(
      (value) => document.querySelector(".slides-counter span")?.textContent === value,
      expected,
    );
  }
  const diagram = page.locator(".slides > section.present [data-mermaid-diagram] svg");
  await diagram.waitFor();
  await page.waitForFunction(() => {
    const svg = document.querySelector(".slides > section.present [data-mermaid-diagram] svg");
    if (!(svg instanceof SVGElement)) return false;
    const bounds = svg.getBoundingClientRect();
    return bounds.width > 200 && bounds.height > 100;
  });
  assert.equal(await diagram.count(), 1);
  // Mermaid 使用原生 SVG 文本，避免 Reveal 缩放时 HTML label 超出 foreignObject 被裁切。
  assert.equal(await diagram.locator("foreignObject").count(), 0);

  await page.getByRole("button", { name: "Next slide" }).click();
  await page.waitForFunction(
    (value) => document.querySelector(".slides-counter span")?.textContent === value,
    (targetIndex + 2).toString().padStart(2, "0"),
  );
  const image = page.locator(
    `.slides > section.present img[src="${basePath}/entrance/computer-lotus.webp"]`,
  );
  await image.waitFor();
  await page.waitForFunction(() => {
    const currentImage = document.querySelector(".slides > section.present .slide-prose-content img");
    return currentImage instanceof HTMLImageElement
      && currentImage.complete
      && currentImage.naturalWidth > 0;
  });
  const imageMetrics = await image.evaluate((currentImage) => {
    const bounds = currentImage.getBoundingClientRect();
    const containerBounds = currentImage.parentElement?.getBoundingClientRect();
    return {
      height: bounds.height,
      maxHeight: getComputedStyle(currentImage).maxHeight,
      naturalWidth: currentImage.naturalWidth,
      width: bounds.width,
      containerWidth: containerBounds?.width ?? 0,
    };
  });
  assert.ok(imageMetrics.naturalWidth > 0 && imageMetrics.width > 100 && imageMetrics.height > 100);
  assert.ok(imageMetrics.width <= imageMetrics.containerWidth);
  assert.equal(imageMetrics.maxHeight, "330px");

  await page.getByRole("button", { name: "Next slide" }).click();
  await page.waitForFunction(
    (value) => document.querySelector(".slides-counter span")?.textContent === value,
    (targetIndex + 3).toString().padStart(2, "0"),
  );
  const orderedItem = page.locator(".slides > section.present .rin-list-ordered li").first();
  const bulletItem = page.locator(".slides > section.present .rin-list-unordered li").first();
  await orderedItem.waitFor();
  assert.deepEqual(await orderedItem.evaluate((item) => ({
    color: getComputedStyle(item, "::marker").color,
    type: getComputedStyle(item).listStyleType,
  })), { color: "rgb(32, 33, 29)", type: "decimal" });
  assert.deepEqual(await bulletItem.evaluate((item) => ({
    color: getComputedStyle(item, "::marker").color,
    type: getComputedStyle(item).listStyleType,
  })), { color: "rgb(32, 33, 29)", type: "disc" });
  assert.equal(await page.locator(".slides > section.present .slide-prose-content").evaluate(
    (content) => content.scrollWidth <= content.clientWidth,
  ), true);
  assert.deepEqual(runtimeErrors, []);
  await page.close();
});

// 真实 wheel 事件必须忽略纵向滚动，并在第三次独立横向手势后才解锁第四入口。
test("reveals the fourth entrance only after three horizontal wheel gestures", async () => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${origin}${basePath}/`);
  const extraGate = page.locator('[data-extra-gate]');

  await page.mouse.wheel(0, 180);
  assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden");

  for (let index = 0; index < 2; index += 1) {
    await page.mouse.wheel(180, 0);
    await page.waitForTimeout(100);
    assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden");
  }
  await page.mouse.wheel(180, 0);
  await page.waitForFunction(() => document.querySelector('[data-extra-gate]')?.getAttribute("data-extra-gate") === "revealed");
  assert.equal(await extraGate.getAttribute("aria-hidden"), null);
  await page.close();
});
