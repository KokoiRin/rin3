## Why

RIN 文档的解析、文章渲染和 Slides 编译目前分散在 `lib/` 与 `app/slides/`，底层代码还依赖网站分区和路由配置，无法作为独立能力复用。随着文章和 Slides 能力继续增长，现在需要建立稳定的文档编译 module，让网站只负责内容发现、站点适配和 UI。

## What Changes

- 新增本地 workspace package `@rin/document`，集中拥有 RIN 文档模型、解析、校验、文章投影、Slides 投影与富内容渲染。
- 为 package 提供单一公开入口，输入源字符串与中立内容身份，输出文章和 Slides 两种构建期投影。
- 移除文档编译代码对 Next.js、React、Reveal、网站分区类型、路由和资源 base path 的依赖。
- 网站新增内容 catalog / adapter，负责文件系统扫描、栏目归属、站点 URL 和资源路径，并调用 `@rin/document`。
- 将 Slides 播放器移动到网站 UI module；播放器继续只消费构建后的 deck，不解析 Markdown。
- 保持现有 RIN Markdown 格式、静态路由、文章与 Slides 内容及用户交互不变。

## Capabilities

### New Capabilities

- `portable-rin-document-compilation`: RIN 文档可通过无框架的公开 interface 编译成文章和 Slides 投影，并可由当前网站或其他消费者复用。

### Modified Capabilities

- 无。现有 `rin-document-dual-view` 的内容格式和用户可观察行为保持不变。

## Impact

- 影响 `lib/rin-documents.ts`、`lib/articles.ts`、`app/slides/` 下的编译、类型、注册表、渲染与播放器文件。
- 新增 `packages/rin-document/`、`lib/content/`、`lib/site/` 与 `components/slides/`。
- 根 `package.json` 增加 npm workspace 配置，网站改为通过 package 公共入口导入文档能力。
- 不改变已发布内容格式、公开 URL、GitHub Pages 构建方式或 Reveal 播放语义。
