---
format: rin-note
lang: zh-CN
title: RIN III Slides 组件使用说明
summary: 用一份可线性阅读的 RIN 文档，同时生成文章与 Slides，并按内容关系选择展示组件。
date: 2026-07-12
topic: Site Authoring
tags: [RIN Document, Slides, Markdown, Components]
order: 10
slides:
  series: RIN III / ME / COMPONENT GUIDE
  coverImage: /entrance/winter-path.webp
  chapters:
    - id: model
      label: "00"
      title: One Source
      summary: 一份文档，两种视图
    - id: authoring
      label: "01"
      title: Authoring
      summary: 元数据与分页
    - id: layouts
      label: "02"
      title: Layouts
      summary: 内容到组件的映射
    - id: rich-content
      label: "03"
      title: Rich Content
      summary: 公式与代码
    - id: release
      label: "04"
      title: Release
      summary: 检查与发布
---

:::slide {"kind":"prose","chapter":"model","eyebrow":"ONE SOURCE / TWO VIEWS"}
## RIN 文档不是纯 Markdown，也不是 Slide 数据对象

它以 Markdown 作为可阅读的正文，再增加少量确定性的分页与布局信息。构建时，同一份源文件会投影成两种视图：文章保留完整的线性内容，Slides 按作者声明的边界分页。

- 文章视图适合连续阅读、搜索和引用。
- Slides 视图适合讲解、比较和逐步展开。
- 标题、摘要、日期、分区与正文只维护一次。
:::

:::slide {"kind":"cards","chapter":"model","eyebrow":"MODEL / THREE LAYERS"}
## 内容、编译和播放各自只有一个职责

新增笔记时只编写 RIN 文档；构建阶段完成结构转换；浏览器只负责播放已经准备好的页面。

### CONTENT — content/me/*.md

保存共享元数据、普通 Markdown 正文、显式分页边界和布局类型，是内容的唯一来源。

### COMPILER — RinDocument

先解析成中立模型，再分别生成文章 HTML 与 SlideDeckData；非法结构会在构建时失败。

### PLAYER — slide-deck.tsx

负责章节跳转、键盘、触摸、进度、深链接、全屏和响应式展示，不理解源文档语法。
:::

:::slide {"kind":"flow","chapter":"authoring","eyebrow":"AUTHORING / FOUR STEPS"}
## 新增一份双视图笔记只需要四步

页面路由和播放器已经共用，不需要复制组件或维护第二份 deck 正文。

1. 填写共享元数据 — 使用 `format: rin-note`，声明标题、摘要、分区信息和章节。
2. 编写普通 Markdown — 先保证文章按从上到下的顺序可以独立读懂。
3. 声明 Slide 边界 — 用 `:::slide` 明确每页的 kind、chapter 与 eyebrow。
4. 构建并检查 — 同时检查文章、Slides、双向切换和最长内容页。
:::

:::slide {"kind":"contract","chapter":"authoring","eyebrow":"AUTHORING / DOCUMENT CONTRACT"}
## 四组字段决定同一份内容如何进入网站

这些字段属于文档契约。路由和页面不应该根据正文内容自行猜测它们。

### IDENTITY — title / lang / date

决定分享标题、内容语言、发布日期和两个视图共同显示的身份。

### DISCOVERY — topic / tags / order

决定文章在所属分区中的摘要、标签和排序；双视图内容只出现一次。

### PRESENTATION — series / coverImage

只补充 Slides 所需的系列名和封面图，不复制正文语义。

### STRUCTURE — chapters / slide directives

章节定义稳定导航，指令定义页面边界和布局。分页始终由作者控制。
:::

:::slide {"kind":"matrix","chapter":"layouts","eyebrow":"LAYOUTS / CHOOSE BY RELATION"}
## 先判断内容关系，再选择布局

`kind` 表达信息结构，不是装饰风格。内容装不下时应拆成两页，而不是压缩字号。

| 内容关系 | 优先 kind | Markdown 约定 |
| --- | --- | --- |
| 连续叙述 | prose | 标题之后可写段落、列表、链接与行内格式 |
| 并列说明 | cards / contract | 使用 `LABEL — Title` 三级标题组织单元 |
| 比较矩阵 | matrix | 使用恰好三列的 GFM 表格 |
| 顺序过程 | flow / checklist | 使用有序列表；flow 项以“标题 — 说明”书写 |
| 技术表达 | formula / code | 使用展示公式或带语言的 fenced code |
| 收束结论 | closing | 使用引用块写核心判断 |
:::

:::slide {"kind":"formula","chapter":"rich-content","eyebrow":"RICH CONTENT / LATEX"}
## 公式在文章和 Slides 中使用同一段 LaTeX

正文使用标准展示公式。文章管线和 Slide 管线都会在构建期通过 KaTeX 输出静态标记。

$$
\det(A-\lambda I)=0 \quad\Longrightarrow\quad A\mathbf{v}=\lambda\mathbf{v}
$$

### SOURCE — Markdown math

源文件保留可移植的 LaTeX 本体，不保存生成后的 HTML。

### OUTPUT — KaTeX HTML

两个视图分别渲染同一表达式，浏览器不在运行时解析公式。
:::

:::slide {"kind":"code","chapter":"rich-content","eyebrow":"RICH CONTENT / SOURCE"}
## 指令只描述分页和布局，正文仍然是 Markdown

指令属性使用 JSON，避免自定义引号规则。开始和结束标记在文章视图中会被移除。

```markdown
:::slide {"kind":"prose","chapter":"model","eyebrow":"ONE SOURCE"}
## 一页的标题

这里是两个视图共同使用的正文。
:::
```

> 支持的 kind：prose、cards、matrix、flow、contract、checklist、formula、code、closing。
:::

:::slide {"kind":"checklist","chapter":"release","eyebrow":"RELEASE / CHECKLIST"}
## 发布前检查这六件事

结构验证保护内容契约，浏览器检查保护真实阅读体验。

1. 文章从上到下阅读时，概念和步骤仍然完整。
2. 每个 Slide 的 chapter 都引用已声明的章节 id。
3. 每个布局都包含它要求的表格、列表、公式、代码或引用块。
4. 分区列表只有一个入口，并默认进入文章视图。
5. 文章的 VIEW SLIDES 与 Slides 的 VIEW DOCUMENT 可以互相到达。
6. 桌面、手机和 GitHub Pages base path 下的生产构建全部通过。
:::

:::slide {"kind":"closing","chapter":"release","eyebrow":"COMPONENT GUIDE / RIN III"}
## 一份内容，两种阅读节奏

> 先写出能够独立读懂的文章，再用显式边界告诉 Slides 应该怎样逐页讲述它。

ONE RIN DOCUMENT / ARTICLE + SLIDES
:::
