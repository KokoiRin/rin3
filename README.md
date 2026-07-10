# 铃有三剑

以樱花、莲花与枫叶为引，记录数学、计算机与软件工程学习内容的个人静态网站。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 新增文章

文章按分区放在 `content/` 下：

```text
content/
  mathematics/
  computer-science/
  software-engineering/
```

新建一个 `.md` 文件，例如 `content/mathematics/eigenvalues.md`：

````markdown
---
title: 文章标题
summary: 一句话摘要
date: "2026-07-10"
lang: en
# slides: "/slides/example-deck"
topic: 分析与代数
tags: [线性代数, 几何直觉]
order: 10
draft: false
---

# 文章标题

行内公式 $Av = \lambda v$。

$$
A = PDP^{-1}
$$

```python
print("code is highlighted")
```
````

- `$...$`：行内公式
- `$$...$$`：独立公式
- `draft: true`：构建时不发布
- `lang`：文章语言，使用 `en` 或 `zh-CN`
- `slides`：可选，对应互动演示路由，例如 `/slides/example-deck`
- `order`：同一分区中的显示顺序
- 原始 HTML 不会执行；正文使用 Markdown、GFM 表格、公式和代码围栏

## 构建与发布

```bash
npm test
```

构建结果位于 `out/`。推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会通过 GitHub Actions 自动构建并发布到 GitHub Pages。
