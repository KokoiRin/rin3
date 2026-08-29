# RIN III 架构边界

本文保存长期有效的架构约束。业务行为、关键函数与验收测试的结构化事实，以 `harness/behaviors/registry.json` 为准；已经完成的实施过程由 Git 历史保存。

## 两条内容生产链

RIN III 目前有两条明确分开的内容生产链：

1. `content/**/*.md` 是站点文章与 Slides 的结构化内容源。
2. `public/reading/**/*.html` 是独立章节阅读器的发布产物，目前多数仍直接维护 HTML。

两者可以共享视觉原则，但不能假定拥有相同的生成方式。阅读器的现状与样式归属见 [`reader-inventory.md`](reader-inventory.md)。

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
- 站点已有的独立 deck 和公开 URL 兼容入口，在行为数据库或测试仍声明它们时必须保留。

具体写作格式和布局规则见 [`slides-authoring.md`](slides-authoring.md)。

## 验证归属

- 可观察业务行为：`harness/behaviors/registry.json`
- 可移植文档编译：`packages/rin-document/tests/`
- 站点静态输出：`tests/`
- 浏览器运行时与公开发布：`harness/`

不再使用 OpenSpec 维护需求或架构。新的长期设计决策写入本文件或后续 ADR；新的可观察行为进入行为数据库。
