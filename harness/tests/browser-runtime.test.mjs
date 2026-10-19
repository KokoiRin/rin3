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
const recentArtifactRoot = resolve(
  import.meta.dirname,
  "../output/artifacts/RECENT-UPDATES-001",
);
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".png", "image/png"],
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

test("[PWA-INSTALL-001] Chrome 从首页和独立阅读器识别同一个可安装的应用清单", async () => {
  // 普通 Playwright context 是隐身模式，Chrome 会因此拒绝安装。
  const context = await chromium.launchPersistentContext("", {
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
  });
  const page = await context.newPage();
  const session = await page.context().newCDPSession(page);
  try {
    for (const route of ["/", "/reading/android-foundations/", "/reading/android-foundations/fundamentals/index.html"]) {
      await page.goto(`${origin}${basePath}${route}`);
      const result = await session.send("Page.getAppManifest");
      assert.equal(result.url, `${origin}${basePath}/manifest.webmanifest`);
      assert.deepEqual(result.errors, []);
      const manifest = JSON.parse(result.data);
      assert.equal(manifest.display, "standalone");
      assert.equal(new URL(manifest.start_url, result.url).href, `${origin}${basePath}/`);
      const { installabilityErrors } = await session.send("Page.getInstallabilityErrors");
      assert.deepEqual(installabilityErrors, []);
      for (const icon of manifest.icons) {
        const dimensions = await page.evaluate(async (src) => {
          const image = new Image();
          image.src = src;
          await image.decode();
          return `${image.naturalWidth}x${image.naturalHeight}`;
        }, new URL(icon.src, result.url).href);
        assert.equal(dimensions, icon.sizes);
      }
    }
  } finally {
    await context.close();
  }
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

// 富内容页必须渲染图表和图片；文章列表使用绿色标记，Slides 列表使用深色标记。
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
  })), { color: "rgb(27, 114, 88)", type: "decimal" });
  assert.deepEqual(await articleBulletItem.evaluate((item) => ({
    color: getComputedStyle(item, "::marker").color,
    type: getComputedStyle(item).listStyleType,
  })), { color: "rgb(27, 114, 88)", type: "disc" });

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


// 对静态导出的实际目录和文字执行交互，不把最近更新的标题写死在验收代码中。
function recentLayout(dialog) {
  const firstLink = dialog.querySelector(".recent-link");
  let scroller = firstLink?.parentElement;
  while (scroller && scroller !== dialog) {
    const overflow = getComputedStyle(scroller).overflowY;
    if ((overflow === "auto" || overflow === "scroll")
      && scroller.scrollHeight > scroller.clientHeight + 1) break;
    scroller = scroller.parentElement;
  }
  const bounds = dialog.getBoundingClientRect();
  const scrollBounds = scroller && scroller !== dialog ? scroller.getBoundingClientRect() : null;
  return {
    dialog: { left: bounds.left, right: bounds.right, top: bounds.top, bottom: bounds.bottom },
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    scroller: scrollBounds ? {
      left: scrollBounds.left, top: scrollBounds.top,
      width: scrollBounds.width, height: scrollBounds.height,
      clientWidth: scroller.clientWidth, scrollWidth: scroller.scrollWidth,
      clientHeight: scroller.clientHeight, scrollHeight: scroller.scrollHeight,
      scrollTop: scroller.scrollTop,
    } : null,
  };
}

async function withRecentEvidence(name, contextOptions, verify) {
  await mkdir(recentArtifactRoot, { recursive: true });
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    // 独立阅读器未声明 favicon 时，桌面 Chrome 会探测域名根目录；
    // /favicon.ico 不属于部署在 /rin3/ 的应用，临时服务器也不托管它。
    const isOriginFaviconProbe = basePath && message.location().url === `${origin}/favicon.ico`
      && message.text().includes("404 (Not Found)");
    if (message.type() === "error" && !isOriginFaviconProbe) {
      errors.push(`${message.text()} ${message.location().url}`);
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400 && response.url().startsWith(origin)) {
      errors.push(`${response.status()} ${response.url()}`);
    }
  });
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  try {
    await verify(page);
    assert.deepEqual(errors, [], "home, dialog and reader navigation have no console errors or HTTP failures");
    await context.tracing.stop();
  } catch (error) {
    await page.screenshot({ path: join(recentArtifactRoot, `${name}-failure.png`), fullPage: false }).catch(() => {});
    await context.tracing.stop({ path: join(recentArtifactRoot, `${name}-trace.zip`) }).catch(() => {});
    throw error;
  } finally {
    await context.close();
  }
}

for (const [name, viewport, mobile] of [
  ["desktop", { width: 1440, height: 900 }, false],
  ["mobile", { width: 390, height: 844 }, true],
  ["narrow", { width: 320, height: 568 }, true],
]) {
  test(`[RECENT-UPDATES-001] ${name} 最近更新可滚动、关闭并直接进入阅读器`, async () => {
    await withRecentEvidence(name, {
      viewport, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce",
    }, async (page) => {
      const response = await page.goto(`${origin}${basePath}/`, { waitUntil: "networkidle" });
      assert.equal(response?.status(), 200);
      const trigger = page.getByRole("button", { name: "最近更新", exact: true });
      const dialog = page.locator("dialog.recent-dialog");
      const extraGate = page.locator("[data-extra-gate]");
      const close = page.getByRole("button", { name: "关闭最近更新", exact: true });
      assert.equal(await trigger.getAttribute("aria-expanded"), "false");
      assert.equal(await dialog.isVisible(), false);
      assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
      await page.screenshot({ path: join(recentArtifactRoot, `${name}-home.png`), fullPage: false });

      const open = async () => {
        await trigger.click();
        await page.getByRole("dialog", { name: "最近更新", exact: true }).waitFor();
        await page.waitForFunction((element) => element.getAttribute("aria-expanded") === "true", await trigger.elementHandle());
        assert.equal(await dialog.evaluate((element) => element.matches(":modal")), true);
        assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true);
      };
      const expectClosed = async () => {
        await dialog.waitFor({ state: "hidden" });
        await page.waitForFunction((element) => element.getAttribute("aria-expanded") === "false", await trigger.elementHandle());
        assert.equal(await trigger.evaluate((element) => document.activeElement === element), true);
      };
      await open();
      const links = dialog.locator("a.recent-link");
      assert.equal(await links.count(), 12);
      const updates = await links.evaluateAll((elements) => elements.map((element) => ({
        href: element.getAttribute("href"),
        title: element.textContent?.trim(),
        date: element.querySelector("time")?.getAttribute("datetime"),
      })));
      assert.ok(updates.every((entry) => entry.title && entry.href?.startsWith(`${basePath}/`)));
      assert.deepEqual(updates.map((entry) => entry.date), updates.map((entry) => entry.date).sort().reverse());
      const reader = updates.find((entry) => entry.href.startsWith(`${basePath}/reading/`));
      assert.ok(reader, "the exported recent list includes a standalone reader");
      assert.ok(reader.href.endsWith("/index.html"));
      const layout = await dialog.evaluate(recentLayout);
      assert.ok(layout.pageWidth <= layout.viewportWidth + 1, "page has no horizontal overflow");
      assert.ok(layout.dialog.left >= 0 && layout.dialog.right <= layout.viewportWidth + 1);
      assert.ok(layout.dialog.top >= 0 && layout.dialog.bottom <= layout.viewportHeight + 1);
      assert.ok(layout.scroller, "the update list scrolls inside the dialog");
      assert.ok(layout.scroller.scrollWidth <= layout.scroller.clientWidth + 1, "list has no horizontal overflow");
      await page.screenshot({ path: join(recentArtifactRoot, `${name}-dialog.png`), fullPage: false });

      // 原生模态框必须将键盘导航留在框内，两个方向都能回环。
      const focusables = dialog.locator('a[href], button:not([disabled]), [tabindex="0"]');
      await focusables.last().focus();
      await page.keyboard.press("Tab");
      assert.equal(await focusables.first().evaluate((element) => document.activeElement === element), true);
      await page.keyboard.press("Shift+Tab");
      assert.equal(await focusables.last().evaluate((element) => document.activeElement === element), true);
      await focusables.first().focus();

      // 对真正的滚动区域发送滚轮，末项应进入可见范围，标题/关闭按钮仍留在视口。
      const scroll = (await dialog.evaluate(recentLayout)).scroller;
      await page.mouse.move(scroll.left + scroll.width / 2, scroll.top + scroll.height / 2);
      await page.mouse.wheel(0, 10_000);
      await page.waitForFunction(() => {
        const dialogElement = document.querySelector("dialog.recent-dialog");
        const lastLink = dialogElement?.querySelectorAll(".recent-link").item(11);
        if (!dialogElement || !lastLink) return false;
        const bounds = lastLink.getBoundingClientRect();
        const dialogBounds = dialogElement.getBoundingClientRect();
        return bounds.top >= dialogBounds.top && bounds.bottom <= dialogBounds.bottom + 1
          && bounds.bottom <= window.innerHeight + 1;
      });
      assert.ok((await dialog.evaluate(recentLayout)).scroller.scrollTop > 0);
      const closeBounds = await close.boundingBox();
      assert.ok(closeBounds && closeBounds.y >= 0 && closeBounds.y + closeBounds.height <= viewport.height + 1);
      if (!mobile) {
        for (let gesture = 0; gesture < 3; gesture += 1) {
          await page.mouse.wheel(180, 0);
          await page.waitForTimeout(100);
        }
        assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden", "dialog scrolling must not reveal Me");
      }

      await page.keyboard.press("Escape");
      await expectClosed();
      await open();
      await close.click();
      await expectClosed();
      await open();
      const bounds = (await dialog.evaluate(recentLayout)).dialog;
      const backdrop = [
        { x: 2, y: 2 }, { x: viewport.width - 2, y: 2 },
        { x: 2, y: viewport.height - 2 }, { x: viewport.width - 2, y: viewport.height - 2 },
      ].find((point) => point.x < bounds.left || point.x > bounds.right
        || point.y < bounds.top || point.y > bounds.bottom);
      assert.ok(backdrop, "dialog leaves a clickable backdrop");
      await page.mouse.click(backdrop.x, backdrop.y);
      await expectClosed();
      assert.equal(await extraGate.getAttribute("data-extra-gate"), "hidden");

      // 阅读器必须完整导航到公开 HTML，避免被 Next 路由当成不存在的站内页面。
      await open();
      const readerUrl = `${origin}${reader.href}`;
      const navigation = page.waitForResponse((result) =>
        result.url() === readerUrl && result.request().resourceType() === "document");
      await links.nth(updates.findIndex((entry) => entry.href === reader.href)).click();
      assert.equal((await navigation).status(), 200);
      await page.waitForURL(readerUrl);
      await page.waitForLoadState("networkidle");
      assert.ok(await page.locator("h1").first().textContent(), "reader has a visible document heading");
    });
  });
}


// 阅读器走静态 HTML 的真实链接；两种设备都能切换语言，并沿同语言前后导航。
test("[ANDROID-BUILD-READER-001] 桌面和手机可以切换构建课程中英文并前后阅读", async () => {
  const { documents } = JSON.parse(await readFile(join(outputRoot, "reading/android-build-system/coverage.json"), "utf8"));
  const [first, second] = documents;
  assert.ok(first && second);
  const artifactRoot = resolve(import.meta.dirname, "../output/artifacts/ANDROID-BUILD-READER-001");
  await mkdir(artifactRoot, { recursive: true });
  for (const [name, viewport, mobile] of [
    ["desktop", { width: 1440, height: 900 }, false],
    ["mobile", { width: 390, height: 844 }, true],
  ]) {
    const page = await browser.newPage({ viewport, isMobile: mobile, hasTouch: mobile });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("response", (response) => {
      if (response.status() >= 400 && response.url().startsWith(origin)) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    const seriesUrl = `${origin}${basePath}/reading/android-build-system/`;
    try {
      await page.goto(`${origin}${basePath}/computer-science/android-build-system/`);
      const entry = page.locator("a[href]");
      const entryIndex = await entry.evaluateAll((links, target) =>
        links.findIndex((link) => link.href === target), `${seriesUrl}index.html`);
      assert.ok(entryIndex >= 0, "article contains the direct course reader link");
      await entry.nth(entryIndex).click();
      await page.waitForURL(`${seriesUrl}index.html`);
      assert.equal(await page.locator("a.chapter-card").count(), documents.length);
      await page.locator(`a.chapter-card[href="${first.id}/index.html"]`).click();
      await page.waitForURL(`${seriesUrl}${first.id}/index.html`);
      await page.locator("article.translated-article").waitFor();
      assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), true);
      await page.screenshot({ path: join(artifactRoot, `${name}-reader.png`), fullPage: false });

      await page.locator(".edition-nav").getByRole("link", { name: "英文对照", exact: true }).click();
      await page.waitForURL(`${seriesUrl}${first.id}/english.html`);
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      assert.equal(await page.locator("article [data-unit]").first().getAttribute("data-unit"), first.unitIds[0]);
      await page.locator(".chapter-switcher").first().locator(`a[href="../${second.id}/english.html"]`).click();
      await page.waitForURL(`${seriesUrl}${second.id}/english.html`);
      assert.equal(await page.locator("html").getAttribute("lang"), "en");
      await page.locator(".chapter-switcher").first().locator(`a[href="../${first.id}/english.html"]`).click();
      await page.waitForURL(`${seriesUrl}${first.id}/english.html`);
      await page.locator(".edition-nav").getByRole("link", { name: "中文阅读版", exact: true }).click();
      await page.waitForURL(`${seriesUrl}${first.id}/index.html`);
      assert.equal(await page.locator("html").getAttribute("lang"), "zh-CN");
      await page.waitForLoadState("networkidle");
      assert.deepEqual(errors, [], `${name}: no reader navigation or resource errors`);
    } finally {
      await page.close();
    }
  }
});
