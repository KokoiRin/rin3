# 独立阅读器与样式清单

> 盘点日期：2026-08-29。范围为 Git 跟踪的 `public/reading/**/*.html`。

## 结论

独立阅读器共有 **91 个 HTML 页面**。其中 **83 个（91.2%）**已经复用系列级公共 CSS，**8 个（8.8%）**仍在 HTML 中保存内联样式。

因此当前问题不是“每个页面都各写一套样式”，而是：

- 不同书系有各自的视觉系统，尚无全站基础 token；
- DDD 第 10—16 章和《困难的对话》第 1 章仍是内联样式；
- HTML 是直接维护的发布内容，还没有统一的结构化源文件和生成器。

## 页面与样式归属

| 阅读器系列 | HTML | 样式归属 | 状态 |
| --- | ---: | --- | --- |
| Category Theory for Programmers | 35 | `public/reading/reader.css` | 已共享 |
| Kotlin Tour | 23 | `public/reading/reader.css` | 已共享 |
| Android Native Bridge | 9 | `public/reading/android-native-bridge/reader.css` | 已共享 |
| Difficult Conversations | 12 | 11 页使用系列 CSS；第 1 章内联 | 1 页待迁移 |
| Emotions | 5 | `public/reading/emotions/shared/reader.css` 与 `rating.js` | 已共享 |
| Learning Domain-Driven Design | 7 | 每章 HTML 内联 CSS | 7 页待迁移 |
| **合计** | **91** | **83 页共享 / 8 页内联** | |

KaTeX 的 `public/reading/_shared/katex/` 是第三方数学排版资源，不属于站点主题样式。

## 维护规则

1. 新增同系列章节时，必须复用该系列已有 CSS，不在 HTML 中新增整页 `<style>`。
2. 书籍之间可以保留不同画风；颜色、字号、正文宽度等基础 token 应优先放入全站基础层，书系 CSS 只保留真正的视觉差异。
3. 图片、脚本和样式放在对应书系目录；只有被多个书系复用时才进入 `_shared/`。
4. 删除资源前同时核对 HTML 引用、构建检查和 Git 历史；公开兼容入口不能仅因内容重复而删除。
5. 长期方向是“结构化源文件 → 统一生成 HTML”。在生成链建立前，先保持章节结构、返回入口、资源路径和系列样式归属一致。

## 后续整理顺序

1. 把《困难的对话》第 1 章迁到该书的 `reader.css`，消除单章例外。
2. 提取 DDD 七章共同的基础 token 和布局骨架，再保留各章确有必要的组件差异。
3. 统一情绪阅读器 `rating.js` 的版本参数。
4. 章节继续增加前，为每个书系建立结构化章节清单，再决定是否引入 HTML 生成器。

这四项涉及页面视觉或发布行为，应逐项做截图与静态构建验证，不与资源清理混在一次大改中。


## 2026-09-09：Android 官方文档中文阅读版

新增 `public/reading/android-foundations/`：21 篇中文、21 篇英文对照、目录和许可说明，共 44 个 HTML 页面。文章入口为 `content/computer-science/android-foundations.md`。上述 2026-08-29 数字保留为当时快照。

正文复用 `public/reading/reader.css`，KaTeX 复用 `_shared/katex/`；本系列 `source.css` 处理原文提示、标题署名、代码来源链接和视频排版，原图放在系列 `assets/` 中。已接入 `check:course-readers` 与内容契约检查。

2026-09-09 全文修订：21 篇均覆盖对应官方文档正文全文（含 Handler 构造器、方法摘要与方法参考），不再按首周计划截取章节。`coverage.json` 从完整原文正文生成，记录来源、原始快照 SHA-256、全部标题和文本单元；`tests/android-reader-completeness.test.mjs` 校验中英文页面的完整单元序列、标题、代码数量和图片，防止再次退化为节选。原始正文与英文输出的文字、代码、图片一致性另由文稿目录中的全文校验脚本验证。


## 2026-10-10：网络请求 · MDN 中文阅读版

新增 `public/reading/network-requests/`：七篇中文润色版、七篇英文对照、七篇第一轮直译，以及目录和许可说明，共 23 个 HTML 页面。站内文章入口为 `content/computer-science/network-requests.md`。

复用 `public/reading/reader.css`；系列 `source.css` 处理 MDN 正文与独立校注，16 张原图保留在 `assets/`。`sources.json`、`coverage.json` 与 `assets.json` 保留来源、原文单元顺序和图像哈希。章节导航接入 `check:course-readers`，页面关联全站应用清单；制作底稿留在文稿目录，不进入公开产物。


## 2026-10-13：Android 应用的数据与状态

新增 `public/reading/android-data-state/`：十篇中文阅读版、十篇英文对照、十篇第一轮直译，以及目录和许可说明，共 32 个 HTML 页面；站内入口为 `content/computer-science/android-data-state.md`。

正文复用 `public/reading/reader.css`；系列 `source.css` 处理官方正文、代码变体、表格与独立校注。原文包含 1,130 个正文单元、162 个代码块、91 处图片引用（89 个独立原图）与 5 张表。`coverage.json` 保存原始单元序列、标题、代码哈希和行内代码；`tests/android-data-reader-completeness.test.mjs` 检查三版完整正文及全部图像哈希，课程导航接入 `check:course-readers`。两轮译稿、原文快照、表达修改记录与全文校验器留在文稿目录。


## 2026-10-16：Programming Languages, Part A · Section 1 中文讲解

新增 `public/reading/programming-languages-a-section-1/`：13 篇原创中文讲解和系列目录，共 14 个 HTML 页面；站内入口为 `content/computer-science/programming-languages-a-section-1.md`。按四个学习阶段组织，目录逐一列出 17 个视频主题与 13 篇讲解的对应关系。

复用 `public/reading/reader.css` 与共享 KaTeX 资源；系列 `lesson.css` 只处理本系列的阅读卡片、目录、代码、来源说明和手机排版。每篇使用顶部与底部前后篇导航，并保留对应视频、来源和非官方原创讲解的范围说明；不镜像整份视频、字幕或讲义。`series.json` 保存章节、视频映射及中文源文稿的 SHA-256。课程已接入 `check:course-readers`。

正文 Markdown、原始参考资料和可重复生成脚本保留在 `~/Documents/RIN III 草稿/Dan Grossman Section 1/`；生成器通过 `@rin/document` 公共入口复用 Markdown、KaTeX 与代码渲染，不向站点添加依赖，不把草稿或临时产物纳入仓库。
