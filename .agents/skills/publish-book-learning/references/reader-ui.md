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
- 移动正文：`16px`
- 一级标题：`clamp(34px, 6vw, 46px)`，紧凑行高与轻微负字距。
- 二级标题：约 `27px`；三级标题：约 `20px`。
- 正文段落保持舒展，但不要用过大的页边距营造“正式文档感”。

### Reading geometry

桌面端：

```css
.reader {
  width: min(1160px, calc(100% - 32px));
  margin: 40px auto 72px;
  padding: 52px 360px 64px 64px;
}

.margin-note {
  float: right;
  clear: right;
  width: 286px;
  margin: .15em -330px 20px 32px;
}
```

这个结构让正文保持适合连续阅读的行长，同时给侧栏足够空间。不要通过扩大整页留白来缩窄正文。

中等宽度（约 `1040px` 以下）：

- 阅读器收窄到约 `820px`；
- 侧栏回到正文流中；
- 隐藏侧栏连接线。

移动端（约 `680px` 以下）：

- 阅读器占满宽度，去掉卡片阴影和圆角；
- 页面内边距约 `32px 22px 48px`；
- 图框允许横向滚动，不压缩图中文字；
- 侧栏紧跟相关段落出现。

## Side-note behavior

默认不提供分类工具栏。使用少量、稳定的标签即可：

- `本段主旨`
- `回到主线`
- `读图提示`
- `别跳太快`

标签表达阅读功能，不表达内容部门。

一条侧栏建议包含：

1. 短标签；
2. 一句可独立理解的标题；
3. 一段 2～4 句的解释。

侧栏不要重复正文，也不要连续引入更多新概念。项目建议更适合放在整书学习记录；确实能消除当前概念歧义时，才放入阅读器。

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

- 单文件 HTML 默认不依赖 CDN、远程字体或运行时接口。
- 相对链接适配本地打开和带 base path 的静态站点。
- 打印时去掉站点导航、阴影和交互控件；侧栏进入正文流；图和标题尽量避免跨页断裂。

## What may vary

以下内容不要求统一：

- 图表内部的颜色和布局；
- 是否存在代码、公式或练习；
- 侧栏数量；
- 是否需要筛选控件；
- 是否添加项目案例；
- 是否发布到 RIN III。

一致 UI 的目标是让读者无需重新学习页面，而不是让不同书籍看起来完全相同。
