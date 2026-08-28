import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, readFile, stat } from "node:fs/promises";
import { extname, join, resolve } from "node:path";
import { after, before, test } from "node:test";
import { chromium } from "playwright-chromium";

const outputRoot = resolve(import.meta.dirname, "../../out");
const gateArtifactRoot = resolve(
  import.meta.dirname,
  "../output/artifacts/HOME-GATE-001",
);
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

async function withGateEvidence(name, contextOptions, verify) {
  await mkdir(gateArtifactRoot, { recursive: true });
  const context = await browser.newContext(contextOptions);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const page = await context.newPage();
  let traceStopped = false;

  try {
    await verify(page);
    await page.screenshot({
      path: join(gateArtifactRoot, `${name}-revealed.png`),
      fullPage: false,
    });
    await context.tracing.stop();
    traceStopped = true;
  } catch (error) {
    await page.screenshot({
      path: join(gateArtifactRoot, `${name}-failure.png`),
      fullPage: false,
    }).catch(() => {});
    await context.tracing.stop({
      path: join(gateArtifactRoot, `${name}-trace.zip`),
    }).catch(() => {});
    traceStopped = true;
    throw error;
  } finally {
    if (!traceStopped) await context.tracing.stop().catch(() => {});
    await context.close();
  }
}

function outputPath(requestUrl, root = outputRoot) {
  let pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname);
  if (basePath && pathname.startsWith(`${basePath}/`)) {
    pathname = pathname.slice(basePath.length);
  }
  const relativePath = pathname.replace(/^\/+/, "");
  const candidate = join(root, relativePath);
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
  browser = await chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  });
});

after(async () => {
  await browser?.close();
  await new Promise((resolveClose, reject) => {
    server?.close((error) => error ? reject(error) : resolveClose());
  });
});

// 直接打开生产静态导出，守住 Reveal ready、唯一活动页和播放器计数同步。
test("[SLIDES-RUNTIME-001] 导出的 Slides 初始化单一活动页并同步下一页页码", async () => {
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

// 手机正文直接进入文章内容，桌面仍保留适合宽屏快速跳转的章节目录。
test("[ARTICLE-MOBILE-TOC-001] 手机文章隐藏目录而桌面文章保留目录", async () => {
  const articlePath = `${origin}${basePath}/software-engineering/why-client-automation-is-harder-than-web/`;
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true });

  try {
    await desktop.goto(articlePath);
    await mobile.goto(articlePath);
    assert.equal(await desktop.locator(".article-toc").isVisible(), true);
    assert.equal(await mobile.locator(".article-toc").isVisible(), false);
  } finally {
    await desktop.close();
    await mobile.close();
  }
});

// 真实 wheel 事件必须忽略纵向滚动，并在第三次独立横向手势后才解锁第四入口。
test("[HOME-GATE-001] 真实桌面浏览器在第三次横滑后显示第四入口", async () => {
  await withGateEvidence("desktop", { viewport: { width: 1440, height: 900 } }, async (page) => {
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
  });
});

// 手机浏览器必须真实经过“滚到末端 → 三次触摸滑动”，而不是只验证手势计算函数。
test("[HOME-GATE-001] 真实手机浏览器到达末端并三次滑动后显示第四入口", async () => {
  await withGateEvidence("mobile", {
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    reducedMotion: "reduce",
  }, async (page) => {
    await page.goto(`${origin}${basePath}/`);
    const gates = page.locator(".gates");
    const extraGate = page.locator('[data-extra-gate]');
    await gates.evaluate((element) => {
      element.scrollLeft = element.scrollWidth;
    });

    for (let index = 0; index < 3; index += 1) {
      await gates.evaluate((element) => {
        const start = new Touch({
          identifier: 1,
          target: element,
          clientX: 330,
          clientY: 420,
        });
        const end = new Touch({
          identifier: 1,
          target: element,
          clientX: 220,
          clientY: 420,
        });
        element.dispatchEvent(new TouchEvent("touchstart", {
          bubbles: true,
          cancelable: true,
          changedTouches: [start],
          targetTouches: [start],
          touches: [start],
        }));
        element.dispatchEvent(new TouchEvent("touchend", {
          bubbles: true,
          cancelable: true,
          changedTouches: [end],
          targetTouches: [],
          touches: [],
        }));
      });
      await page.waitForTimeout(80);
      if (index < 2) {
        assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden");
      }
    }

    await page.waitForFunction(() => document.querySelector('[data-extra-gate]')?.getAttribute("data-extra-gate") === "revealed");
    assert.equal(await extraGate.getAttribute("aria-hidden"), null);
    assert.equal(await extraGate.isVisible(), true);
  });
});
