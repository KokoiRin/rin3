# RIN III 测试工具

`harness/` 只负责浏览器测试、构建后批量验收和验证工具自检。网站运行时、依赖与构建不引用这里；领域、内容和静态产物测试保留在根项目。

## 安装与执行

```bash
# 根项目依赖与浏览器工具分开安装
npm ci
npm --prefix harness ci --ignore-scripts
npm --prefix harness run install:browser

# 验证工具自检，不下载或启动浏览器，也不构建网站
npm --prefix harness test

# 构建一次后执行现有浏览器测试
npm --prefix harness run test:e2e

# 工具自检、快速检查、公开发布检查，再共享一次构建运行静态和浏览器测试
npm --prefix harness run verify
```

`verify` 包含 `npm run check:publish`，因此需要在 `main` 上运行且内容符合公开发布要求。日常开发按改动范围选择测试，命令表见 [验证指南](../docs/harness-plan.md)。

浏览器测试在构建前检查 Chromium 是否可用；首页手势测试的截图和失败 Trace 写入 `harness/output/artifacts/`。若要单独复查某项测试，可在构建完成后用 Node 的 `--test-name-pattern` 按测试名称筛选。

无需登记行为 ID、函数映射或版本号。部分已有测试名称保留历史编号，只是名称的一部分，不参与执行选择或检查。

## CI

拉取请求和公开部署运行工具自检与根项目的 `npm test`；公开部署在上传产物前额外运行 `npm run check:publish`。CI 安装工具依赖时使用 `--ignore-scripts`，当前不下载 Chromium，也不运行浏览器测试。
