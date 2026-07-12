import assert from "node:assert/strict";
import test from "node:test";

const {
  compileRinDeck,
  parseRinDocument,
  renderArticleMarkdown,
  renderSlideDeck,
} = await import("@rin/document");

const source = `---
format: rin-note
lang: zh-CN
title: 可移植文档
summary: 同一份源内容生成两个中立投影
date: 2026-07-12
topic: Architecture
tags: [RIN, Package]
slides:
  series: RIN / PORTABLE
  coverImage: /cover.webp
  chapters:
    - id: main
      label: "01"
      title: Main
      summary: 主体
---

:::slide {"kind":"prose","chapter":"main","eyebrow":"PORTABLE / PROSE"}
## 中立内容

这个 package 不知道网站路由。
:::
`;

// 公共入口应从一个字符串生成文章和 Slides 投影，并保留宿主尚未适配的中立 identity 与资源路径。
test("compiles portable article and slides projections through the package entrypoint", async () => {
  const document = parseRinDocument(source, "/virtual/portable.md", "notes", "portable");
  const article = await renderArticleMarkdown(document.articleMarkdown);
  const deck = compileRinDeck(document);
  const renderedDeck = await renderSlideDeck(deck);

  assert.equal(document.summary.section, "notes");
  assert.equal(deck.coverImage, "/cover.webp");
  assert.equal("sectionHref" in deck, false);
  assert.match(article.html, /这个 package 不知道网站路由/);
  assert.match(renderedDeck.slides[1].html, /这个 package 不知道网站路由/);
});

// 高语义布局的 Markdown 约定必须稳定编译为播放器消费的中立数据。
test("compiles ordered, code, and closing layout semantics", () => {
  const richSource = source.replace(
    /:::slide[\s\S]*:::\n$/,
    `:::slide {"kind":"flow","chapter":"main","eyebrow":"FLOW"}
## 执行顺序

按稳定顺序推进：

1. Parse — 读取内容
2. Render — 生成投影
:::

:::slide {"kind":"checklist","chapter":"main","eyebrow":"CHECK"}
## 验收

逐项确认：

1. 文章可读
2. Slides 可播
:::

:::slide {"kind":"code","chapter":"main","eyebrow":"CODE"}
## 公共入口

只依赖 package：

\`\`\`ts
compileRinDeck(document);
\`\`\`

> 网站负责路由适配。
:::

:::slide {"kind":"closing","chapter":"main","eyebrow":"END"}
## 收束

> 内容只有一个事实源。

布局和播放各自演化。
:::
`,
  );
  const document = parseRinDocument(richSource, "/virtual/layouts.md", "notes", "layouts");
  const deck = compileRinDeck(document);

  assert.deepEqual(deck.slides.map((slide) => slide.kind), [
    "cover",
    "flow",
    "checklist",
    "code",
    "closing",
  ]);
  assert.deepEqual(deck.slides[1].items, [
    { label: "01", title: "Parse", body: "读取内容" },
    { label: "02", title: "Render", body: "生成投影" },
  ]);
  assert.deepEqual(deck.slides[2].items, ["文章可读", "Slides 可播"]);
  assert.equal(deck.slides[3].language, "ts");
  assert.equal(deck.slides[3].caption, "网站负责路由适配。");
  assert.equal(deck.slides[4].statement, "内容只有一个事实源。");
});
