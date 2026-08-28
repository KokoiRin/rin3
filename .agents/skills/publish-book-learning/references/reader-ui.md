# Reader UI contract

这份契约用于让同一本书、以及相近的技术书籍保持一致的阅读气质。它描述稳定关系，不限制章节自己的图表语言。

## Visual invariants

### Palette

```css
:root {
  --paper: #fffefa;
  --canvas: #ecebe7;
  --ink: #26343b;
  --muted: #65757d;
  --accent: #39728d;
  --accent-soft: #e7f1f5;
  --line: #d9e2e6;
  --figure-bg: #f8fafb;
  --shadow: 0 18px 48px rgba(40, 50, 56, .10);
}
```

新章节优先复用这些 token。章节图示可以增加局部颜色，例如 EventStorming 便签色，但不要改变正文主色和页面层次。

### Typography

- 正文字体：系统中文无衬线栈，避免远程字体依赖。
- 推荐字体栈：`-apple-system, BlinkMacSystemFont, "SF Pro Text", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif`
- 桌面正文：`17px / 1.78`
- 移动正文：`19px / 1.75`
- 一级标题：`clamp(34px, 6vw, 48px)`，紧凑行高与轻微负字距。
- 二级标题：约 `27px`；三级标题：约 `20px`。
- 正文段落保持舒展，但不要用过大的页边距营造“正式文档感”。

### Reading geometry

桌面端：

```css
.reader {
  width: min(960px, calc(100% - 32px));
  margin: 40px auto 72px;
  padding: 58px 72px 64px;
}
```

这个结构来自已验证的 Kotlin Tour 阅读器。正文保持单栏，不为可选讲解预留永久侧栏。

中等宽度（约 `760px` 以下）：

- 阅读器收窄到约 `680px`；
- 页面内边距缩至约 `42px 30px 50px`；
- 多列概念卡片变为单列。

移动端（约 `520px` 以下）：

- 阅读器占满宽度，去掉卡片阴影和圆角；
- 页面内边距约 `32px 22px 46px`；
- 图框允许横向滚动，不压缩图中文字；
- 正文采用经过验证的较大字号。

## Optional guidance behavior

默认不提供讲解层或分类工具栏。用户明确需要时，使用少量、稳定的标签即可：

- `本段主旨`
- `回到主线`
- `读图提示`
- `别跳太快`

标签表达阅读功能，不表达内容部门。

一条行内提示建议包含：

1. 短标签；
2. 一句可独立理解的标题；
3. 一段 2～4 句的解释。

提示不要重复正文，也不要连续引入更多新概念。项目建议更适合放在整书学习记录；确实能消除当前概念歧义时，才放入阅读器。

## Formulas

- 简单符号也放入统一 `.math-display`，避免公式与正文节奏混在一起。
- 分数、上下标、矩阵和多行公式使用项目已安装的 KaTeX 在生成时预渲染，不依赖 CDN 或浏览器运行时脚本。
- KaTeX 输出放入 `.math-display`；旧材料中的 MathJax SVG 继续兼容，但不作为新内容格式。
- 公式容器必须允许横向滚动，复杂公式不得撑宽整页。

## Figures

- 所有图放入统一 `.figure-frame`，使用浅灰背景、细边框和 12～14px 圆角。
- 图注位于图后，使用 muted 色和较小字号。
- `图 N-M` 使用 accent 色与粗体。
- 结构图优先 HTML/CSS，保证中文清晰并可响应；复杂连线可使用 SVG，但文字仍需可读。
- 每张图必须有可访问的 `role="img"` 与 `aria-label`，或保留有意义的 `alt`。
- 图形本身可以随章节变化；外层框、图注和间距保持一致。

## Navigation and chapter identity

每章顶部保持：

- 返回整本书学习记录；
- 返回站点首页；
- 章节编号胶囊；
- 章节标题、短引导和本章锚点导航。

学习记录按整本书聚合；后续章节继续追加阅读器链接和跨章节总结。

## Offline and print

- 位于 `public/reading/<book>/<chapter>/index.html` 的章节通常把 `{{READER_STYLES_HREF}}` 设为 `../../reader.css`。
- HTML 与 `/reading/reader.css`、本地 KaTeX 字体共同组成可离线复制的阅读器，不依赖 CDN、远程字体或运行时接口。
- 相对链接适配本地打开和带 base path 的静态站点。
- 打印时去掉站点导航、阴影和交互控件；图和标题尽量避免跨页断裂。

## What may vary

以下内容不要求统一：

- 图表内部的颜色和布局；
- 是否存在代码、公式或练习；
- 是否存在明确标记的行内讲解；
- 是否需要筛选控件；
- 是否添加项目案例；
- 是否发布到 RIN III。

一致 UI 的目标是让读者无需重新学习页面，而不是让不同书籍看起来完全相同。
