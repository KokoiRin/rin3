## Context

当前 RIN 双视图已经以单一 Markdown 文件作为事实源，但实现分散在 `lib/rin-documents.ts`、`lib/articles.ts` 和 `app/slides/`。解析器与 Slides 类型依赖 `app/sections.ts`，Slides 编译器还直接补充站点标题、URL 和 base path；因此构建期核心不能离开 RIN III 网站独立使用。

这次重构必须保持现有 Markdown 协议、公开路由、静态导出和播放器行为不变。当前只有网站一个播放器消费者，所以文档编译能力需要形成真实 package seam，而 Reveal 播放器仍作为站点 UI。

## Goals / Non-Goals

**Goals:**

- 建立无 Next.js、React、Reveal、文件系统和站点配置依赖的 `@rin/document` workspace package。
- 让 package 集中拥有 RIN 模型、解析校验、文章渲染、Slides 编译和富内容渲染。
- 让网站 catalog 负责本地文件发现、draft、栏目、URL、asset base path 与静态页面适配。
- 通过 package 公共入口和行为测试保护可移植 interface。
- 保持当前页面输出和用户交互不变。

**Non-Goals:**

- 本轮不发布 npm package，也不新增独立构建产物。
- 不把 Reveal 播放器公共化，不重写播放器状态或 CSS。
- 不改变 `format: rin-note`、Slide 指令或布局语义。
- 不把整个 Next.js 网站移动到 `apps/web`。

## Decisions

### 使用根 workspace 下的 source package

新增 `packages/rin-document`，根项目通过 npm workspace 使用 `@rin/document`。package 只通过 `src/index.ts` 暴露稳定 interface，内部文件可以按解析、投影和渲染职责组织。

备选是继续放在根 `lib/`，但目录约定无法阻止反向导入，也不能真实验证 package 可独立消费。现在建立 workspace seam 更符合明确的跨项目复用目标。

### package 输入字符串，网站拥有文件系统

`@rin/document` 接收 Markdown 字符串、source path 与中立 identity。它不扫描 `content/`，不理解 draft 或 GitHub Pages。网站的 content catalog 是本地 filesystem adapter，并把编译结果映射到网站栏目和路由。

依赖属于 in-process 与 local-substitutable；不引入 ports-and-adapters 框架。文件系统 seam 留在网站内部，package 测试直接使用字符串 fixture。

### 中立 deck 与站点导航分离

package 的 `SlideDeckData` 只保存内容身份、metadata、章节和页面，不保存 `sectionTitle`、`sectionHref`、`articleHref` 或 base path。网站 adapter 在交给播放器前补充这些字段。`renderSlideDeck` 使用泛型保留调用方附加字段，但只处理 package 拥有的 slides。

备选是向 package 注入 URL resolver；这会把站点导航知识变成公共 interface，降低 package 的 depth 和可移植性。

### 保留构建期与运行期接缝

package 在构建期完成 Markdown、KaTeX 和 Shiki 处理。网站播放器只消费 `RenderedSlideDeckData`，不解析源文档。播放器移动到 `components/slides`，但 Reveal 生命周期和交互实现不在本轮拆分。

### 网站 catalog 是唯一站点内容入口

把现有 `lib/articles.ts` 重构为 `lib/content/catalog.ts`，统一普通文章与 RIN 文档的读取、排序和查询。Next.js routes 不直接访问文件系统或 package parser。

## Risks / Trade-offs

- [文件移动较多导致遗漏导入] → 按解析器、catalog、Slides adapter、UI 的顺序迁移，每步运行针对性测试和 TypeScript/build。
- [workspace source package 暂时不能直接发布 npm] → 本轮以真实 package seam 和公共入口为目标；以后发布时再增加 dist 构建，不提前扩大范围。
- [中立类型拆分可能改变页面数据] → 保留静态 HTML 回归测试，验证标题、公式、代码、双向链接和 GitHub Pages base path。
- [Markdown 渲染配置出现行为漂移] → 直接迁移现有 remark/rehype 配置，不在本轮合并网站视觉主题或改变输出。

## Migration Plan

1. 建立 workspace package，迁移 RIN 模型、解析、Slide 类型、编译和富内容渲染，并为公共 interface 增加 package 行为测试。
2. 建立网站 `lib/site` 配置与 `lib/content/catalog`，移除 package 对网站 section、URL 和 filesystem 的依赖。
3. 网站增加 deck adapter，补充导航和资源字段；更新静态路由使用新的 catalog。
4. 把播放器移动到 `components/slides`，保持 Reveal 行为与 CSS 不变。
5. 运行 package 测试、完整构建测试、lint、OpenSpec validate 与 diff 检查；启动本地预览并确认可访问。

回滚时可恢复原文件位置和导入，不涉及内容格式、持久化数据或公开 URL 迁移。

## Open Questions

无。npm 发布和公共播放器拆分明确留给后续真实需求。
