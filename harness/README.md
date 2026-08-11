# RIN III Harness

这个目录是独立于产品运行时的验收工具。它可以读取、构建和测试上一级 RIN III 项目；产品代码、产品依赖和产品构建不得反向引用这里。

## 边界

```text
Harness → 读取并验证 RIN III
RIN III ✕ 不依赖 Harness
```

根项目只运行网站：

```bash
npm install
npm run dev
```

需要验收时单独安装和执行：

```bash
npm --prefix harness install
npm --prefix harness run behavior -- impact advanceWheelGesture
npm --prefix harness run behavior -- run HOME-GATE-001
npm --prefix harness run check
```

行为数据库在 `harness/behaviors/registry.json`。浏览器截图、失败 Trace 和最近结果写入 `harness/output/`，不会进入产品静态产物或 Git 提交。

项目内保留快速单元测试、类型检查、Lint 和静态构建测试；Chromium、跨层行为编排、证据与行为索引由这个独立 package 负责。
