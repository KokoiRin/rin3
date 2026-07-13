# RIN III 双视图内容作者说明

## 默认方式：一份 RIN 文档生成文章和 Slides

双视图学习笔记放在 `content/<section>/<slug>.md`，使用 `format: rin-note`。它仍然是可线性阅读的 Markdown，但通过显式指令补充 Slide 的分页和布局信息。

```md
---
format: rin-note
lang: zh-CN
title: 示例笔记
summary: 一句话摘要
date: 2026-07-12
topic: Authoring
tags: [RIN, Slides]
order: 10
slides:
  series: RIN III / ME
  coverImage: /entrance/winter-path.webp
  chapters:
    - id: opening
      label: "00"
      title: Opening
      summary: 开始
---

:::slide {"kind":"prose","chapter":"opening","eyebrow":"OPENING / IDEA"}
## 一页的标题

这里是文章和 Slides 共同使用的正文。
:::
```

构建时会自动生成：

- 文章：`/<section>/<slug>/`
- Slides：`/slides/<slug>/`
- 分区列表：只显示一个条目，默认进入文章，并标记它带有 Slides
- 两个页面：分别提供 `VIEW SLIDES` 与 `VIEW DOCUMENT` 切换

`:::slide` 属性必须是 JSON。每条指令明确生成一页，系统不会按内容长度自动分页。文章渲染时只移除指令外壳，内部 Markdown 全部保留。

## 内容角色、投影视图和 Slides 表现

RIN 把三个概念分开管理：

- 内容角色：普通内容是 `core`，长篇解释可以显式标记为 `detail`。
- 投影视图：`core` 同时进入文章和 Slides；`detail` 只进入文章。
- Slides 表现：`kind` 继续选择 prose、cards、flow 等页面布局。

不要根据文字长度自动隐藏内容。作者先写两种视图都需要的简短核心，再把只适合连续阅读的解释放进 `:::detail`：

```md
:::slide {"kind":"prose","chapter":"opening","eyebrow":"OPENING / IDEA"}
## 模块边界应该围绕变化方向划分

这一句核心判断会同时进入文章和 Slides。

:::detail
这里可以继续写背景、推导、例子和限制条件。它保持在文章的原始位置，但不会进入 Slides。
:::
:::
```

`detail` 必须位于一条 Slide 指令内部并正确闭合。代码围栏中的 `:::detail` 只是示例文本，不会改变投影。

## 布局与 Markdown 映射

| `kind` | 适合内容 | 正文约定 |
| --- | --- | --- |
| `prose` | 连续叙述 | 标题后使用普通 Markdown |
| `cards` | 2-3 个并列观点 | 无序列表，项目写成“标题：说明” |
| `contract` | 稳定接口或维度 | 无序列表，项目写成“标题：说明” |
| `matrix` | 三列对照 | 三列 GFM 表格 |
| `flow` | 有顺序的步骤 | 有序列表，项目写成“标题 — 说明” |
| `checklist` | 检查项 | 有序列表 |
| `formula` | 核心公式及解释 | `$$...$$`，可附带“标题：说明”列表 |
| `code` | 一段源码 | 带语言的 fenced code，可用引用块作 caption |
| `closing` | 收束判断 | 引用块写核心句，末段写短标记 |

每页以二级标题开始，并让一页只表达一个主要判断。若内容过多，增加新的显式指令，不要依赖缩小字号。

完整范例见 [`content/me/component-guide.md`](../content/me/component-guide.md)。它本身会同时发布为文章和 Slides。

## 保留方式：独立 deck

只有纯演示、没有文章阅读需求的内容，才直接注册到 `lib/content/slides.ts`：

- 提供 `listing` 后，deck 会直接进入所属分区。
- 不配置 `articleHref` 时，播放器不显示文档切换按钮。
- 现有播放器、路由和 CSS 不要为新内容复制。

## 架构归属

- `packages/rin-document/`：可移植的 RIN 解析、校验、文章渲染和 Slides 编译；不依赖网站路由或 React。
- `packages/rin-document/src/domain.ts`：内容角色、视图投影和 Slides presentation 的领域模型。
- `lib/content/`：RIN III 的文件发现与站点适配，负责栏目、URL 和 deploy-safe 资源路径。
- `components/slides/`：Reveal 播放器与网站视觉交互，只消费构建后的 deck。
- `app/`：静态路由和页面组装，不直接解析 Markdown。

其他项目复用文档链路时应通过 `@rin/document` 公共入口传入源字符串，不复制本网站的 content catalog 或播放器。

## 发布检查

运行：

```bash
GITHUB_ACTIONS=true NEXT_PUBLIC_BASE_PATH=/rin3 npm test
```

并检查文章、Slides、双向切换、最长页面、手机竖屏和 GitHub Pages base path。未知 kind、未知章节、未闭合指令，以及缺失布局必需结构时，构建必须失败。
