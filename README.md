# RIN III

以樱花、莲花、枫叶与雪为引，记录数学、计算机、软件工程与个人成长的个人静态网站。

## 本地运行

需要 Node.js 22 或更高版本。

```bash
npm install
npm run dev
```

访问 `http://localhost:3000`。

## 安装到手机桌面

通过 Android Chrome 打开 HTTPS 正式站点，在菜单中选择安装应用。若此前添加的是普通网页快捷方式，先移除旧图标再安装，从新图标启动验证。站内页面以独立窗口显示；外部链接仍可能显示浏览器工具栏。

`public/manifest.webmanifest` 使用 `standalone` 显示模式，启动页和应用范围均为清单所在目录（本地 `/`、GitHub Pages `/rin3/`）。桌面图标由现有樱花封面居中裁切为 PNG；本次只提供安装入口，不包含离线缓存。

Next 页面通过根布局关联清单。新增独立 HTML 阅读器时，也需要在 `<head>` 内用相对路径引用同一份清单，例如章节页的 `<link rel="manifest" href="../../../manifest.webmanifest">`。`test:build` 会检查所有导出 HTML 的清单地址、应用范围和图标。

## 新增文章

文章按分区放在 `content/` 下：

```text
content/
  mathematics/
  computer-science/
  software-engineering/
  me/
```

新建一个 `.md` 文件，例如 `content/mathematics/example.md`：

````markdown
---
title: 文章标题
summary: 一句话摘要
date: "2026-07-10"
lang: en
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
- `order`：同一分区中的显示顺序
- 原始 HTML 不会执行；正文使用 Markdown、GFM 表格、公式和代码围栏

## 新增文章 + Slides

需要同一份内容同时显示为文章和 Slides 时，使用 `format: rin-note` 与显式 `:::slide` 指令。完整格式、组件映射和发布检查见 [`docs/slides-authoring.md`](docs/slides-authoring.md)。

## 架构

```text
content/**/*.md
    ↓ 网站文件发现
lib/content/                 RIN III 内容 catalog 与站点适配
    ↓ 源字符串
packages/rin-document/       可移植的解析、校验和双视图编译
    ↓ 构建后数据
app/ + components/slides/    静态路由、文章页面与 Reveal 播放器
```

`@rin/document` 不依赖 Next.js、React、Reveal、网站 URL 或文件系统；其他消费者可以通过它的公共入口复用 RIN 文档编译能力。

长期架构约束见 [`docs/architecture.md`](docs/architecture.md)；独立 HTML 阅读器和共享样式的现状见 [`docs/reader-inventory.md`](docs/reader-inventory.md)。

## 构建与发布

```bash
npm test
```

构建结果位于 `out/`。推送到 `main` 分支后，`.github/workflows/deploy-pages.yml` 会通过 GitHub Actions 自动构建并发布到 GitHub Pages。
