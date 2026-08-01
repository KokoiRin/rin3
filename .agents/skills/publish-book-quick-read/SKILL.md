---
name: publish-book-quick-read
description: Compress a user-provided long book into accurate, readable chapter quick-reads and an optional book-level learning record or RIN III webpage, so the reader can build a whole-book map first and return to selected original chapters later. Use when the user says a book is long, asks to 快速读、精简、提炼、先看全书地图、逐章整理、做速读网页, or wants a readable alternative to full translation. Do not use for faithful translation, line-by-line preservation, or claims of complete coverage; use publish-book-learning instead.
---

# Publish Book Quick Read

## Purpose

把长书做成“先快速通读，再按需回原书”的导航层，而不是原书替代品。

优先保住作者的核心问题、结论、推理链、代表性案例和关键限定；主动压缩重复铺陈与同类例子。始终让读者知道哪些内容经过压缩，以及何时应该回到原书。

## Choose the correct book mode

先根据用户目标选择模式，不要只根据输入文件格式判断。

| 用户目标 | 使用方式 |
| --- | --- |
| 快速建立全书地图、判断哪些章节值得深读 | 使用本 Skill |
| 逐章提炼、结构化精读、长书速读网页 | 使用本 Skill |
| 忠实翻译、完整保留段落、公式、图片、脚注和练习 | 使用 `publish-book-learning` |
| 对某个观点做精确引用、文学细读或逐句分析 | 回到原书或使用完整阅读模式 |

用户意图不明确时，明确说明当前选择的是“快速精读”还是“忠实完整”，不要让压缩在无提示的情况下发生。

## Build an argument ledger before writing

先确认目录、章节边界和下一章起点，再为每章记录：

1. 本章试图回答的核心问题；
2. 作者给出的核心结论；
3. 从问题走到结论的主要推理步骤；
4. 承担论证作用的代表性案例；
5. 反例、例外、限定条件和常见误用；
6. 作者给出的行动方法、练习或判断标准；
7. 本章怎样承接前章、通向后章。

没有完成这张账本前，不要直接根据印象写摘要。目录标题不能代替正文论证。

## Apply a visible compression contract

可以压缩：

- 为同一结论服务的多组平行案例；
- 重复解释、修辞性过渡和回顾性段落；
- 不改变观点边界的背景细节；
- 已由一张清晰语义图完整表达的重复文字。

不能静默删除：

- 改变结论适用范围的例外与限定；
- 防止概念被误用的反例；
- 推理链中的关键因果步骤；
- 作者主动修正、反转或收回的观点；
- 承载独立思想的图、表、脚注、练习或案例；
- 与前后章节建立关系的关键转折。

若必须删去上述内容，在相关位置留下“回原书阅读”的定位提示，而不是只在章末笼统声明有删减。

## Keep three layers distinct

### Quick-read body

用作者的论证顺序组织正文。默认包含：本章问题、推理主线、代表性案例、关键限制、可执行方法和本章落点。

### Reading guidance

用少量侧栏帮助读者回答“这一段在主线哪一步”。不要用侧栏重复正文，也不要把个人理解写成作者结论。

### Personal learning record

只有掌握真实用户或项目上下文时，才记录“它对我有什么影响”。将项目映射、个人启发和行动实验放在整书学习记录中，并与章节正文分开。

## Preserve useful source landmarks

- 保留原章节标题与小节顺序，必要时标注对应原书小节。
- 代表性案例保留原人物、冲突和结论；若合并或改写，明确标注。
- 原书结构图优先语义重绘；新增总结图必须标记为“阅读辅助图”。
- 不把“覆盖核心框架”表述成“完整保留作者思想”。
- 被问及覆盖比例时，分别评估核心框架、推理完整度、限定条件和实践训练，不给未经分析的单一百分数。

## Design the reading path for a long book

按以下节奏组织整本书：

1. 先用目录建立全书结构和章节关系；
2. 用一章确认压缩尺度和阅读体验；
3. 分批生成章节快速阅读器，并保持相邻章节导航；
4. 在整书记录中维护当前进度、跨章理解和待回原书清单；
5. 用户读完快速版后，把有疑问、有共鸣或需要引用的章节升级为完整阅读或忠实翻译。

不要因为批量处理而继续提高压缩率。同一本书的章节应采用稳定尺度；如果尺度变化，显式说明。

## Reuse RIN III's book UI when requested

当输出目标是当前 RIN III 项目时：

1. 阅读 `../publish-book-learning/references/reader-ui.md`，复用阅读几何、排版、侧栏、图框、移动端与打印约定。
2. 阅读 `../publish-book-learning/references/rin3-publishing.md`，沿用整书学习记录与分章阅读器的两层结构。
3. 可从 `../publish-book-learning/assets/reader-shell.html` 开始，但要把页面身份明确写成“结构化精读”或“快速阅读”，不要冒充完整翻译。
4. 同一本书只建立一篇整书学习记录；每章快速阅读器通过相对链接往返。
5. 只有用户明确要求时才提交、推送或部署。

## State what the artifact is

每个快速阅读器都应在开头提供简短整理说明，至少交代：

- 本页经过结构化压缩；
- 保留了哪些类型的内容；
- 哪些内容可能被合并或省略；
- 它适合建立地图，不替代需要引用或深入判断时的原书阅读。

## Completion check

交付前抽查：

- 章节边界和标题顺序是否正确；
- argument ledger 中每一项是否在页面中有去处；
- 例外、反例和防误用边界是否仍然可见；
- 原书图与阅读辅助图是否标注清楚；
- 个性化讲解是否与作者正文分层；
- 桌面、移动端和打印是否可读；
- 对“精简”“完整”“忠实”和“已部署”的表述是否与证据一致。
