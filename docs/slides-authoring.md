# RIN III Slides 作者说明

## 目标与边界

Slides 是学习内容的主要浏览形式。独立 deck 通过自己的 `listing` 元数据进入所属分区，不需要创建占位 Markdown 文章。只有确实存在补充长文时，才配置可选的 `articleHref`。

模板采用三层结构：

- `app/slides/decks.ts`：内容模型和全部 deck 数据，是唯一内容来源。
- `app/slides/render-deck.ts`：构建时把 LaTeX 与代码转换为静态 HTML。
- `app/slides/slide-deck.tsx`：通用播放器，负责章节、翻页、进度、全屏和移动端菜单。

新增普通 deck 时不要复制播放器、路由或 CSS。只有出现第二种真实视觉需求时，才新增布局类型。

## 新增一份 Deck

1. 在 `app/slides/decks.ts` 的 `slideDecks` 数组中增加一项。
2. 填写 `listing`，让独立 deck 出现在所属分区列表。
3. 确认 `section`、`sectionTitle`、`sectionHref` 指向同一个父分区。
4. 运行 `GITHUB_ACTIONS=true NEXT_PUBLIC_BASE_PATH=/rin3 npm test`。
5. 在桌面和手机尺寸至少各检查一次首屏、最长标题和内容最多的一页。

最小结构：

```ts
{
  slug: "example-deck",
  lang: "zh-CN",
  series: "RIN III / MATHEMATICS / 01",
  title: "演示标题",
  description: "一句话摘要",
  date: "2026 / 07 / 10",
  coverImage: assetPath("/entrance/math-sakura.webp"),
  section: "mathematics",
  sectionTitle: "Mathematics",
  sectionHref: "/mathematics",
  listing: {
    topic: "Linear Algebra",
    date: "2026-07-10",
    order: 10,
  },
  // articleHref: "/mathematics/example-article",
  chapters: [
    { id: "opening", label: "00", title: "Opening", summary: "章节摘要" },
  ],
  slides: [
    {
      kind: "cover",
      chapter: "opening",
      eyebrow: "MATHEMATICS / NOTE 01",
      title: "演示标题",
      summary: "首屏摘要",
      tags: ["LINEAR ALGEBRA", "GEOMETRY"],
    },
  ],
}
```

`chapter` 必须引用 `chapters` 中已经存在的 `id`。`slug` 决定公开 URL，例如 `example-deck` 对应 `/slides/example-deck/`。

`sectionHref` 是播放器的稳定父级，不要用 `history.back()` 替代。用户可能通过收藏夹或分享链接直接进入 deck，仍然必须能回到所属分区。

## 布局选择

| `kind` | 适合内容 | 主要字段 |
| --- | --- | --- |
| `cover` | 封面和主题定位 | `summary`, `tags` |
| `cards` | 2-3 个并列观点 | `intro`, `items` |
| `matrix` | 三列对照 | `columns`, `rows` |
| `flow` | 有顺序的 3-4 个步骤 | `intro`, `items` |
| `contract` | 四个稳定接口或维度 | `intro`, `items` |
| `checklist` | 3-5 条检查项 | `intro`, `items` |
| `formula` | 一条核心展示公式及解释 | `intro`, `formula`, `items` |
| `code` | 一段需要讲解的代码 | `intro`, `language`, `code`, `caption` |
| `closing` | 结论和可记忆句子 | `statement`, `note` |

一页只表达一个主要判断。不要通过缩小字号容纳过多内容；优先拆成两页。

## LaTeX 公式

公式页使用 KaTeX，在构建阶段渲染。`formula` 填写 LaTeX 本体，不需要 `$` 或 `$$`：

```ts
{
  kind: "formula",
  chapter: "model",
  eyebrow: "PART 02 / MODEL",
  title: "特征向量保持方向",
  intro: "矩阵只改变这个方向上的尺度。",
  formula: String.raw`A\mathbf{v}=\lambda\mathbf{v}`,
  items: [
    { label: "VECTOR", title: "方向", body: "v 不发生旋转" },
    { label: "SCALAR", title: "尺度", body: "lambda 决定伸缩" },
  ],
}
```

使用 `String.raw` 可以避免 JavaScript 把 LaTeX 反斜杠当成转义字符。无效公式会让构建失败，而不是静默发布错误内容。

## 代码块

代码页使用 Shiki，在构建阶段按 `language` 高亮：

```ts
{
  kind: "code",
  chapter: "implementation",
  eyebrow: "PART 03 / IMPLEMENTATION",
  title: "把契约写成类型",
  intro: "类型约束比调用方记忆更可靠。",
  language: "typescript",
  code: `type Result = {
  decision: string;
  nextStep: string;
};`,
  caption: "Keep examples short enough to read without scrolling.",
}
```

`language` 使用 Shiki 支持的语言名，例如 `typescript`、`python`、`yaml`、`json`、`bash`。代码应控制在约 12 行以内；更长的实现放在仓库源码或独立文档里。

## 内容入口

独立 deck 使用 `listing` 进入分区：

```ts
listing: {
  topic: "Linear Algebra",
  date: "2026-07-10",
  order: 10,
}
```

存在 `listing` 时：

- 分区列表直接链接到 deck。
- 列表显示 `INTERACTIVE DECK`。
- 不需要创建 Markdown 文章。

如果 deck 确实有一篇补充文章，则省略 deck 的 `listing`，配置 `articleHref`，并在文章 frontmatter 中增加 `slides: "/slides/example-deck"`。文章负责分区列表摘要，播放器只会在 `articleHref` 存在时显示书本图标；两侧不要同时提供列表元数据，避免重复入口。
