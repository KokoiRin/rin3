import assert from "node:assert/strict";
import test from "node:test";

const { parseRinDocument } = await import("../lib/rin-documents.ts");

const frontmatter = `---
format: rin-note
lang: zh-CN
title: 双视图笔记
summary: 同一份内容生成文章和演示
date: 2026-07-12
topic: Authoring
tags: [RIN, Slides]
slides:
  series: RIN III / ME
  coverImage: /entrance/winter-path.webp
  chapters:
    - id: basics
      label: "01"
      title: Basics
      summary: 基础组件
---`;

// 显式分页必须保持作者顺序，同时文章投影只能去掉指令外壳。
test("parses explicit slide boundaries in source order and keeps readable article Markdown", () => {
  const document = parseRinDocument(`${frontmatter}

:::slide {"kind":"prose","chapter":"basics","eyebrow":"BASICS / PROSE"}
## 普通内容

这段文字在两种视图中都应该存在。
:::

:::slide {"kind":"checklist","chapter":"basics","eyebrow":"BASICS / CHECKLIST"}
## 检查清单

逐项确认：

1. 第一项
2. 第二项
:::
`, "/tmp/example.md", "me", "example");

  assert.equal(document.slides.length, 2);
  assert.deepEqual(document.slides.map((slide) => slide.kind), ["prose", "checklist"]);
  assert.match(document.articleMarkdown, /## 普通内容/);
  assert.match(document.articleMarkdown, /这段文字在两种视图中都应该存在/);
  assert.doesNotMatch(document.articleMarkdown, /:::slide|^:::$/m);
  assert.equal(document.summary.slides, "/slides/example");
});

// 未知布局必须在构建前暴露，并指明问题文件。
test("rejects unknown layout kinds with the source path", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"carousel","chapter":"basics","eyebrow":"BAD"}
## 不支持
:::`, "/tmp/unknown.md", "me", "unknown"),
    /\/tmp\/unknown\.md: unknown slide kind "carousel"/,
  );
});

// 未闭合指令不能静默吞掉后续正文。
test("rejects an unclosed slide directive", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"prose","chapter":"basics","eyebrow":"BAD"}
## 没有结束`, "/tmp/unclosed.md", "me", "unclosed"),
    /\/tmp\/unclosed\.md: unclosed slide directive/,
  );
});

// 组件缺少其必需结构时，应给出布局相关错误。
test("validates component-specific required Markdown", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"formula","chapter":"basics","eyebrow":"BAD"}
## 缺少公式

只有说明，没有展示公式。
:::`, "/tmp/formula.md", "me", "formula"),
    /\/tmp\/formula\.md: formula slide .*display formula/,
  );

  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"matrix","chapter":"basics","eyebrow":"BAD"}
## 缺少矩阵

只有说明，没有三列表格。
:::`, "/tmp/matrix.md", "me", "matrix"),
    /\/tmp\/matrix\.md: matrix slide .*three-column table/,
  );
});

// 代码示例中的结束标记只是正文，不能提前结束外层 Slide。
test("does not treat directive examples inside fenced code as the slide closing marker", () => {
  const document = parseRinDocument(`${frontmatter}

:::slide {"kind":"code","chapter":"basics","eyebrow":"BASICS / CODE"}
## 指令示例

\`\`\`markdown
:::slide {"kind":"prose","chapter":"basics","eyebrow":"EXAMPLE"}
## 示例
:::
\`\`\`
:::
`, "/tmp/fenced.md", "me", "fenced");

  assert.match(document.slides[0].markdown, /## 示例\n:::/);
  assert.equal(document.slides.length, 1);
});
