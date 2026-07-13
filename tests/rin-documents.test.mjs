import assert from "node:assert/strict";
import test from "node:test";

const { parseRinDocument, projectRinContent } = await import("@rin/document");

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
  assert.deepEqual(document.slides.map((slide) => slide.presentation), ["prose", "checklist"]);
  assert.match(document.articleMarkdown, /## 普通内容/);
  assert.match(document.articleMarkdown, /这段文字在两种视图中都应该存在/);
  assert.doesNotMatch(document.articleMarkdown, /:::slide|^:::$/m);
  assert.equal("slides" in document.summary, false);
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

  assert.match(projectRinContent(document.slides[0].blocks, "slides"), /## 示例\n:::/);
  assert.equal(document.slides.length, 1);
});

// detail 在文档结束前没有闭合时，解析必须指出来源和起始行，不能静默吞掉后续内容。
test("rejects an unclosed detail block with source context", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"prose","chapter":"basics","eyebrow":"BAD"}
## 核心判断

:::detail
没有结束的详细解释`, "/tmp/unclosed-detail.md", "me", "unclosed-detail"),
    /\/tmp\/unclosed-detail\.md: unclosed detail block at line \d+/,
  );
});

// fenced code 中出现 detail 标记只是示例文本，文章与 Slides 都必须完整保留它。
test("keeps detail marker examples inside fenced code as core content", () => {
  const document = parseRinDocument(`${frontmatter}

:::slide {"kind":"code","chapter":"basics","eyebrow":"EXAMPLE"}
## Detail 写法

\`\`\`markdown
:::detail
详细解释
:::
\`\`\`
:::`, "/tmp/detail-fence.md", "me", "detail-fence");
  const slidesMarkdown = projectRinContent(document.slides[0].blocks, "slides");

  assert.match(slidesMarkdown, /:::detail\n详细解释\n:::/);
  assert.match(document.articleMarkdown, /:::detail\n详细解释\n:::/);
});

// 章节 id 是所有页面引用的稳定键，重复定义会让目录跳转产生歧义。
test("rejects duplicate chapter identifiers", () => {
  const source = frontmatter.replace(
    "      summary: 基础组件",
    `      summary: 基础组件
    - id: basics
      label: "02"
      title: Duplicate
      summary: 重复章节`,
  );

  assert.throws(
    () => parseRinDocument(source, "/tmp/duplicate-chapter.md", "me", "duplicate-chapter"),
    /\/tmp\/duplicate-chapter\.md: duplicate chapter id "basics"/,
  );
});

// 每页只能引用 frontmatter 已声明的章节，否则播放器目录无法定位它。
test("rejects slides that reference an undeclared chapter", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"prose","chapter":"missing","eyebrow":"BAD"}
## 未声明章节
:::`, "/tmp/unknown-chapter.md", "me", "unknown-chapter"),
    /\/tmp\/unknown-chapter\.md: slide at line \d+ references unknown chapter "missing"/,
  );
});

// code 布局依赖围栏代码块提供语言和源码，行内代码不能替代。
test("rejects code slides without a fenced code block", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"code","chapter":"basics","eyebrow":"BAD"}
## 代码页

只有行内 \`code\`。
:::`, "/tmp/code.md", "me", "code"),
    /\/tmp\/code\.md: code slide .*fenced code block/,
  );
});

// 顺序型布局必须从 Markdown 列表获得稳定 item 边界。
test("rejects flow and checklist slides without a list", () => {
  for (const kind of ["flow", "checklist"]) {
    assert.throws(
      () => parseRinDocument(`${frontmatter}

:::slide {"kind":"${kind}","chapter":"basics","eyebrow":"BAD"}
## 列表页

没有列表。
:::`, `/tmp/${kind}.md`, "me", kind),
      new RegExp(`/tmp/${kind}\\.md: ${kind} slide .*must contain a list`),
    );
  }
});

// closing 的核心陈述来自引用块，普通段落不能被猜测为收束语。
test("rejects closing slides without a blockquote", () => {
  assert.throws(
    () => parseRinDocument(`${frontmatter}

:::slide {"kind":"closing","chapter":"basics","eyebrow":"BAD"}
## 收束页

这不是引用。
:::`, "/tmp/closing.md", "me", "closing"),
    /\/tmp\/closing\.md: closing slide .*blockquote/,
  );
});
