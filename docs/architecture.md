# RIN III 架构边界

本文保存长期有效的架构约束。可观察行为由对应测试说明和验证；已经完成的实施过程由 Git 历史保存。

## 两条内容生产链

RIN III 目前有两条明确分开的内容生产链：

1. `content/**/*.md` 是站点文章与 Slides 的结构化内容源。
2. `public/reading/**/*.html` 是独立章节阅读器的发布产物，目前多数仍直接维护 HTML。

两者可以共享视觉原则，但不能假定拥有相同的生成方式。阅读器的现状与样式归属见 [`reader-inventory.md`](reader-inventory.md)。

## 首页最近更新

最近更新在构建期读取已发布文章的显式元数据：`date` 保留首次发布日期，`updated` 记录后续正文的实际更新日期，排序采用 `updated ?? date`。正文、示例或教学图解有实质变化时，同步维护对应入口的 `updated`；只调整样式、导航、构建工具或部署，不改这个日期，也不使用文件 mtime 或构建时间推断内容更新。

有独立阅读器的文章用 `reader: /reading/.../index.html` 指定直接阅读入口；没有系列目录时，可以指向正文已链接的首章。该地址须是 `public/` 中现存的中文阅读页。普通 Markdown 与 RIN 双视图文章共用这套宿主元数据，保持 `@rin/document` 的边界。

## RIN 文档模块

```text
content/**/*.md
    ↓ 网站发现与读取
lib/content/                 站点 catalog、栏目、路由和资源适配
    ↓ Markdown 字符串与中立身份
packages/rin-document/       解析、校验、文章渲染与 Slides 编译
    ↓ 构建后的文章和 deck 数据
app/ + components/slides/    静态路由、页面与 Reveal 播放器
```

长期约束：

- `@rin/document` 通过单一公共入口提供能力，不依赖 Next.js、React、Reveal、站点文件系统或部署路径。
- 网站拥有文件发现、draft、栏目、公开 URL、base path 和资源地址；这些站点知识不得进入可移植模块。
- `format: rin-note` 的一份 Markdown 是文章和 Slides 的共同内容源。显式 `:::slide` 决定分页，不按篇幅自动切页。
- `core` 内容进入文章和 Slides，显式 `detail` 内容只进入文章；投影目标与 Slide 布局是两个概念。
- Markdown、KaTeX、Shiki 和富内容在构建期处理；播放器只消费编译后的 deck，不在浏览器中重新解析源文档。
- Markdown 图片通过宿主提供的地址适配器处理；Mermaid 仅在页面实际包含图表时按需加载，原始 HTML 继续禁用。
- 站点已有的独立 deck 和公开 URL 兼容入口，在测试仍声明它们时必须保留。

具体写作格式和布局规则见 [`slides-authoring.md`](slides-authoring.md)。

## 验证归属

- 可移植文档编译：`packages/rin-document/tests/`
- 站点领域、内容、静态输出与公开发布检查：`tests/`
- 浏览器运行时与验证工具自检：`harness/`

不再使用 OpenSpec 维护需求或架构。新的长期设计决策写入本文件或后续 ADR；新的可观察行为通过对应测试验证。
