---
name: publish-book-learning
description: Translate user-provided book chapters into faithful Chinese HTML readers with a local shared reading format and optional guidance, preserve figures/formulas/footnotes, and optionally maintain one book-level learning record or publish to RIN III. Use when the user asks to translate or continue a book, improve readability, keep later chapters visually consistent, or publish the result.
---

# Publish Book Learning

## Purpose

把书籍翻译做成可以持续阅读的作品，而不是一次性的纯文本输出。

本 Skill 提供判断原则和可复用 UI，不规定必须执行的流水线。根据原书结构、用户目的和已有产物选择必要部分；不要为了“遵守模板”增加无价值的批注、分类、图表或发布动作。

## Core ideas

### Keep the source and guidance separate

- 正文层忠实保留原书的标题层级、段落、例子、代码、公式、表格、图、图注、脚注和练习。
- 讲解层帮助理解，但不替换原书内容。项目案例、类比和重写图示应明确属于扩展内容。
- 若把原书例子改成用户项目示例，同时保留原始例子或明确说明改写；不要把“知识点没漏”表述成“逐段完整翻译”。

### Keep guidance optional and in the reading flow

阅读器默认只呈现来源内容。只有用户明确需要讲解层时，才加入与正文视觉分离的行内提示，防止读者沉入细节后忘记主线。

优先回答：

- 这一段的核心想法是什么？
- 它在本章论证或流程中处于哪一步？
- 它怎样承接前文、又怎样通向后文？

“项目映射”“可优化点”和筛选分类都是可选项。只有用户需要、且有真实上下文时才加入；不要为这些内容预留永久侧栏。

### Preserve the book's visual semantics

- 结构图优先重绘并翻译图中文字，使缩放和移动端阅读保持清晰。
- 重绘时保留原图实体、关系、方向、阶段和例子；视觉简化不能改变论证。
- 若原图是照片、艺术插图或难以忠实重建，保留清晰原图并翻译图注，或明确标注示意重绘。
- 项目化重画应作为额外图示，不冒充原图翻译。

### Organize learning by book, reading by chapter

- 每章可以有独立阅读器，便于完整翻译、图表和定位。
- 同一本书默认维护一篇持续增长的学习记录，而不是每章创建一篇文章。
- 学习记录连接跨章节形成的理解和实际影响；章节阅读器保存原文阅读体验。
- 已发布的章节文章合并时，尽量为旧 URL 保留兼容跳转。

### Keep verification claims precise

区分：

- 章节结构是否齐全；
- 知识点是否覆盖；
- 是否逐段忠实翻译；
- 图示是否为原图翻译、语义重绘或项目化改写；
- 静态导出、浏览器显示和线上部署是否分别验证。

不要用其中一种证据替代另一种。

## Reusing the reader UI

当用户希望延续当前阅读体验时：

1. 阅读 [reader-ui.md](references/reader-ui.md)，沿用其中的视觉不变量和响应式边界。
2. 优先从 [reader-shell.html](assets/reader-shell.html) 开始，而不是复制上一章全部内容。
3. 复用共享样式、单栏阅读几何、标题层级、图框、公式、移动端行为和打印样式。
4. 为本章新增的图表创建局部组件样式，不修改全局阅读节奏。
5. 若当前书已经有阅读器，以最新且已确认体验良好的章节作为视觉对照；模板只是基线。

一致性来自稳定的排版关系，不来自每章拥有完全相同的控件。

## Optional RIN III publishing

只有目标是 RIN III 时才阅读 [rin3-publishing.md](references/rin3-publishing.md)。

发布、提交和部署属于可选的宿主工作，不是翻译本身的一部分。只有用户明确要求时才执行外部写入、Git push 或部署。

## Useful completion check

交付前按需抽查：

- 原章节边界和下一章起点；
- 标题、图、表、代码、公式、脚注、练习清单；
- 每个原书例子是否仍在正文或被明确标记为改写；
- 可选讲解是否真的帮助回到主线，并与来源正文明确分开；
- 桌面、移动端和打印时是否仍可读；
- 对“完整”“忠实”“已部署”的表述是否有对应证据。

这是一组提醒，不是强制顺序。
