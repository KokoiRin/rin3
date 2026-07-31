# RIN III publishing reference

仅在用户要求把书籍阅读器接入当前 RIN III 仓库时使用。下文路径均相对于仓库根目录。

## Current content boundary

- 整书学习记录：`content/<section>/<book-slug>.md`
- 分章阅读器：`public/reading/<book-slug>/<chapter-slug>/index.html`
- 静态导出：Next.js
- 线上 base path：`/rin3`
- 部署：推送 `main` 后由 `.github/workflows/deploy-pages.yml` 发布

同一本书默认只在分区首页占一个文章入口。新章节追加到整书学习记录中的章节链接、阶段理解和当前总结，不再创建新的章节文章。

## Inspect before changing

重新读取：

- `AGENTS.md`
- `README.md`
- `next.config.ts`
- `lib/site/sections.ts`
- `.github/workflows/deploy-pages.yml`
- `tests/rendered-html.test.mjs`

检查 Git 状态，保留用户和其他任务的修改。

## Relative links

整书文章链接到章节阅读器：

```markdown
[第 N 章：标题 →](../../reading/book-slug/chapter-N/)
```

章节阅读器返回整书文章：

```html
<a href="../../../software-engineering/book-slug/">← 返回整本书学习记录</a>
<a href="../../../">RIN III</a>
```

若把已发布的章节文章合并为整书文章，可在旧路径下放置轻量静态跳转页，避免旧链接直接 404；跳转页不进入内容 catalog。

## Verification

根据改动风险选择验证，但至少证明：

- 分区首页只出现一个整书入口；
- 整书文章链接到所有已发布章节；
- 每个章节阅读器回到整书文章；
- 旧 URL 若承诺兼容，确实指向新入口；
- `/rin3` 前缀下静态资源和链接可达。

部署等价命令：

```bash
env GITHUB_ACTIONS=true NEXT_PUBLIC_BASE_PATH=/rin3 npm test
```

本地预览和线上 HTTP 检查分别报告，不把构建成功当成部署成功。

## Git boundary

只暂存本次内容、阅读器、兼容跳转和相关测试。不要暂存 `tsconfig.tsbuildinfo` 等构建缓存。只有用户明确要求时才提交、推送或部署。
