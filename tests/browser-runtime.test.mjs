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
