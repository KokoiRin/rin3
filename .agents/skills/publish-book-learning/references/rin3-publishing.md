# 站点接入与发布

仅在需要把阅读器接入 RIN III 时使用，路径相对于仓库根目录。先阅读当前 `AGENTS.md` 和 `docs/reader-inventory.md`，检查 Git 状态，保留其他修改。

## 文件归属

| 内容 | 路径 |
| --- | --- |
| 整书学习记录（需要时） | `content/<section>/<book-slug>.md` |
| 分章阅读器 | `public/reading/<book-slug>/<chapter-slug>/index.html` |
| 共享样式 | `public/reading/reader.css` |
| 本地公式资源 | `public/reading/_shared/katex/` |

同一本书需要学习记录时，维护一个整书入口，汇集章节链接与实际形成的理解，不为每章新建文章或虚构学习进度。单篇文档沿用所在系列的组织方式。

## 链接与兼容

- 整书文章链接到章节，例如 `../../reading/book-slug/chapter-N/`。
- 章节链接回整书文章，例如 `../../../software-engineering/book-slug/`；返回首页可用 `../../../`。
- 同时核对本地访问和 `/rin3` 路径前缀。合并既有入口时，保留承诺兼容的旧链接；静态跳转页不进入文章目录。

## 验证与交付

按当前仓库约定运行相关内容检查。发布前核对章节互链、样式、公式和其他资源可达；检查入口以 `package.json` 为准。需要模拟当前静态部署环境时，可使用：

```bash
env GITHUB_ACTIONS=true NEXT_PUBLIC_BASE_PATH=/rin3 npm test
```

提交、推送和部署按用户明确授权执行，只暂存本次相关文件。部署机制以 `.github/workflows/deploy-pages.yml` 为准；当前为推送 `main` 后发布。

区分本地检查、浏览器预览与线上验证。构建成功不能证明部署成功；实际发布后再验证线上链接。
