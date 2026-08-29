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
