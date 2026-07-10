import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";

async function readOutput(relativePath) {
  return readFile(new URL(`../out/${relativePath}`, import.meta.url), "utf8");
}

test("exports the three learning gates with deploy-safe paths", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /<title>RIN III<\/title>/i);
  assert.match(html, /Mathematics/);
  assert.match(html, /Computer Science/);
  assert.match(html, /Software Engineering/);
  assert.match(html, new RegExp(`href="${basePath}/mathematics/"`));
  assert.match(html, new RegExp(`src="${basePath}/entrance/math-sakura\\.webp"`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("exports optimized entrance artwork", async () => {
  for (const fileName of [
    "math-sakura.webp",
    "computer-lotus.webp",
    "engineering-maple.webp",
  ]) {
    const asset = await stat(new URL(`../out/entrance/${fileName}`, import.meta.url));
    assert.ok(asset.size < 500_000, `${fileName} should remain below 500 KB`);
  }
});

// 额外分区必须随静态站点完整导出，且主图继续满足体积约束。
test("exports the fourth seasonal destination", async () => {
  const home = await readOutput("index.html");
  const winter = await readOutput("winter/index.html");
  const artwork = await stat(new URL("../out/entrance/winter-path.webp", import.meta.url));

  assert.match(home, /data-winter-gate="hidden"/);
  assert.match(home, new RegExp(`href="${basePath}/winter/"`));
  assert.match(winter, /<title>Winter \| RIN III<\/title>/i);
  assert.match(winter, /THE QUIET WORK OF BECOMING/);
  assert.ok(artwork.size < 500_000, "winter-path.webp should remain below 500 KB");
});

test("exports each section index", async () => {
  for (const [directory, title] of [
    ["mathematics", "Mathematics"],
    ["computer-science", "Computer Science"],
    ["software-engineering", "Software Engineering"],
  ]) {
    const html = await readOutput(`${directory}/index.html`);
    assert.match(html, new RegExp(`<title>${title} \\| RIN III<\\/title>`, "i"));
    assert.match(html, /Notes/);
  }
});

test("renders Markdown, LaTeX, tables, and highlighted code", async () => {
  const html = await readOutput("mathematics/eigenvalues/index.html");

  assert.match(html, /Eigenvalues: Scale Along Stable Directions/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /<table>/);
  assert.match(html, /np\.linalg\.eig/);
  assert.match(html, /<article class="article-shell" lang="en">/);
  assert.match(html, /ON THIS PAGE/);
  assert.match(html, /href="#a-two-dimensional-example"/);
  assert.match(html, /ALL MATHEMATICS NOTES/);
});

test("lists the standalone component guide under software engineering", async () => {
  const index = await readOutput("software-engineering/index.html");

  assert.match(index, /RIN III Slides 组件使用说明/);
  assert.match(index, /INTERACTIVE DECK/);
  assert.match(index, new RegExp(`href="${basePath}/slides/component-guide/"`));
  await assert.rejects(
    readOutput("software-engineering/when-workflows-are-clear-but-interfaces-are-not/index.html"),
    { code: "ENOENT" },
  );
});

test("exports the component guide without article or slides-index dependencies", async () => {
  const deck = await readOutput("slides/component-guide/index.html");

  await assert.rejects(readOutput("slides/index.html"), { code: "ENOENT" });
  await assert.rejects(readOutput("slides/interface-contracts/index.html"), { code: "ENOENT" });
  assert.match(deck, /<main class="rin-slides-shell" lang="zh-CN">/);
  assert.match(deck, /aria-label="Presentation chapters"/);
  assert.match(deck, /内容、构建和播放各自只有一个职责/);
  assert.match(deck, /公式页直接填写 LaTeX 本体/);
  assert.match(deck, /代码页声明语言和源码即可/);
  assert.match(deck, /class="katex"/);
  assert.match(deck, /data-rehype-pretty-code-figure/);
  assert.match(deck, /satisfies SlideDeckData/);
  assert.match(deck, /ARROW KEYS \/ SWIPE \/ CLICK/);
  assert.match(deck, /Back to Software Engineering/);
  assert.match(deck, new RegExp(`href="${basePath}/software-engineering/"`));
  assert.doesNotMatch(deck, /Read the full article/);
});

test("keeps the entrance copy English-only", async () => {
  const html = await readOutput("index.html");
  assert.doesNotMatch(html, /\p{Script=Han}/u);
});
