## Why

RIN III 的文章与 Slides 目前使用两份独立正文，导致同一学习内容需要重复维护，文章和演示容易发生语义漂移。站点需要一种比标准 Markdown 更丰富、但仍可线性阅读的 RIN 文档格式，在构建期从同一来源派生文章与 Slides。

## What Changes

- 引入 RIN 文档格式：保留 Markdown 正文，并通过显式 Slide 指令声明分页和布局类型。
- 从同一 RIN 文档分别生成文章 HTML 与 `SlideDeckData`，共享标题、摘要、日期、语言、分区和正文内容。
- 文章页与 Slides 页提供双向视图切换，分区列表仅显示一个默认进入文章的内容条目。
- 保留现有独立 deck 注册方式，不在本次变更中迁移其他独立 deck。
- 将《RIN III Slides 组件使用说明》迁移为 `me` 分区下的首个双视图 RIN 文档。
- 删除《Eigenvalues: Scale Along Stable Directions》及其静态文章入口。

## Capabilities

### New Capabilities

- `rin-document-dual-view`: 定义 RIN 文档格式、构建期双视图派生、路由注册、视图切换和失败校验。

### Modified Capabilities

<!-- 当前仓库尚无既有 OpenSpec capability。 -->

## Impact

- 内容协议：`content/**/*.md` frontmatter 与正文指令。
- 文章管线：`lib/articles.ts` 及文章页面、分区列表。
- Slides 管线：deck 类型、派生编译器、静态路由、播放器和样式。
- 内容迁移：组件说明迁入 `content/me/`，删除 Eigenvalues Markdown，并移除组件说明的手写 deck 正文。
- 构建与测试：增加解析/编译行为测试及双路由静态 HTML 断言；新增 Markdown 指令解析依赖。
