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
  const personal = await readOutput("me/index.html");
  const artwork = await stat(new URL("../out/entrance/winter-path.webp", import.meta.url));

  assert.match(home, /data-extra-gate="hidden"/);
  assert.match(home, new RegExp(`href="${basePath}/me/"`));
  assert.match(personal, /<title>Me \| RIN III<\/title>/i);
  assert.match(personal, /THE QUIET WORK OF BECOMING/);
  assert.doesNotMatch(home, /<button/i);
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

test("renders the RIN component guide as a complete Markdown article", async () => {
  const html = await readOutput("me/component-guide/index.html");

  assert.match(html, /RIN III Slides 组件使用说明/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /<table>/);
  assert.match(html, /:::slide/);
  assert.match(html, /Markdown 内容块怎样变成 Slides 组件/);
  assert.match(html, /Markdown item 怎样获得自动编号/);
  assert.match(html, /编译器自动生成 01、02、03/);
  assert.match(html, /三层模型怎样协作/);
  assert.match(html, /这段说明故意作为 detail/);
  assert.match(html, /<article class="article-shell" lang="zh-CN">/);
  assert.match(html, /ON THIS PAGE/);
  assert.match(html, /href="#先判断内容关系再选择布局"/);
  assert.match(html, /ALL BECOMING NOTES/);
  assert.match(html, /VIEW SLIDES/);
  assert.match(html, new RegExp(`href="${basePath}/slides/component-guide/"`));
  assert.doesNotMatch(html, /:::slide \{&quot;kind&quot;[^<]*\}[\s\S]*^:::$/m);
});

// 富内容示例必须保留惰性 Mermaid 节点、部署安全图片和两类语义列表。
test("exports rich document media and editorial lists with deploy-safe markup", async () => {
  const article = await readOutput("me/component-guide/index.html");
  const deck = await readOutput("slides/component-guide/index.html");

  for (const html of [article, deck]) {
    assert.match(html, /<pre class="mermaid" data-mermaid-diagram="">/);
    assert.match(html, new RegExp(`src="${basePath}/entrance/computer-lotus\\.webp"`));
    assert.match(html, /<ol class="rin-list rin-list-ordered">/);
    assert.match(html, /<ul class="rin-list rin-list-unordered">/);
  }
});

// 模型论笔记迁移后必须保留原 Slides 地址，同时新增默认文章入口和双向切换。
test("publishes model theory as one dual-view RIN document", async () => {
  const article = await readOutput("mathematics/model-theory-for-software-engineering/index.html");
  const deck = await readOutput("slides/model-theory-for-software-engineering/index.html");
  const index = await readOutput("mathematics/index.html");

  assert.match(article, /模型论中的可定义性/);
  assert.match(article, /可定义性的明确含义：公式的满足者必须与目标完全相同/);
  assert.match(article, /需要修正的一点/);
  assert.match(article, /纯序一阶语言无法定义这些算术关系/);
  assert.match(article, /先分清“5 这个对象”与“公式能不能直接写 5”/);
  assert.match(article, /公式、性质、集合和关系是同一条链上的不同视角/);
  assert.match(article, /class="katex"/);
  assert.match(article, /<table>/);
  assert.match(article, /VIEW SLIDES/);
  assert.match(article, new RegExp(`href="${basePath}/slides/model-theory-for-software-engineering/"`));

  assert.match(index, /ARTICLE \+ SLIDES/);
  assert.match(index, new RegExp(`href="${basePath}/mathematics/model-theory-for-software-engineering/"`));
  assert.equal(index.match(/<li lang="zh-CN">/g)?.length, 1);

  assert.match(deck, /View document/);
  assert.match(deck, new RegExp(`href="${basePath}/mathematics/model-theory-for-software-engineering/"`));
  assert.match(deck, /FORMULA → SATISFACTION → DEFINABLE SET/);
  assert.doesNotMatch(deck, /需要修正的一点/);
});

test("lists the dual-view component guide once under me and defaults to the article", async () => {
  const index = await readOutput("me/index.html");
  const softwareEngineering = await readOutput("software-engineering/index.html");

  assert.match(index, /RIN III Slides 组件使用说明/);
  assert.match(index, /ARTICLE \+ SLIDES/);
  assert.match(index, new RegExp(`href="${basePath}/me/component-guide/"`));
  assert.equal(index.match(/<li lang="zh-CN">/g)?.length, 1);
  assert.doesNotMatch(softwareEngineering, /RIN III Slides 组件使用说明/);
});

test("exports the component guide deck with a document switch", async () => {
  const deck = await readOutput("slides/component-guide/index.html");

  await assert.rejects(readOutput("slides/index.html"), { code: "ENOENT" });
  await assert.rejects(readOutput("slides/interface-contracts/index.html"), { code: "ENOENT" });
  assert.match(deck, /<main class="rin-slides-shell" lang="zh-CN">/);
  assert.match(deck, /aria-label="Presentation chapters"/);
  assert.match(deck, /内容、编译和播放各自只有一个职责/);
  assert.doesNotMatch(deck, /三层模型怎样协作/);
  assert.doesNotMatch(deck, /这段说明故意作为 detail/);
  assert.match(deck, /公式在文章和 Slides 中使用同一段 LaTeX/);
  assert.match(deck, /指令只描述分页和布局/);
  assert.match(deck, /class="katex"/);
  assert.match(deck, /data-rehype-pretty-code-figure/);
  assert.match(deck, /ONE RIN DOCUMENT \/ ARTICLE \+ SLIDES/);
  assert.match(deck, /ARROW KEYS \/ SWIPE \/ CLICK/);
  assert.match(deck, /Back to Me/);
  assert.match(deck, new RegExp(`href="${basePath}/me/"`));
  assert.match(deck, /View document/);
  assert.match(deck, /DOCUMENT/);
  assert.match(deck, new RegExp(`href="${basePath}/me/component-guide/"`));
});

test("removes Eigenvalues from the mathematics section and static export", async () => {
  const index = await readOutput("mathematics/index.html");

  assert.doesNotMatch(index, /Eigenvalues: Scale Along Stable Directions/);
  await assert.rejects(readOutput("mathematics/eigenvalues/index.html"), { code: "ENOENT" });
});

test("keeps the entrance copy English-only", async () => {
  const html = await readOutput("index.html");
  assert.doesNotMatch(html, /\p{Script=Han}/u);
});
