# RIN III Harness 建设计划

## 目标

让开发者和 Agent 都能沿着同一条反馈链工作：

```text
理解改动 → 快速检查 → 检查静态产物 → 浏览器验证 → 自动发布门禁
```

Harness 不等于某一个测试框架。它由可执行命令、业务规则测试、构建产物检查、浏览器证据和 CI 门禁共同组成。

## 业务行为追踪基线

`harness/behaviors/registry.json` 保存稳定业务行为 ID、中文行为描述、关键代码符号和测试用例。Harness 是独立 package，只能单向验证项目，产品运行时不引用它。

```bash
# 从函数反查业务和测试
npm --prefix harness run behavior -- impact advanceWheelGesture

# 执行一个业务行为对应的测试
npm --prefix harness run behavior -- run HOME-GATE-001

# 检查映射和本轮代码同步状态
npm --prefix harness run check
```

每次代码修改都必须同步复核并提升受影响行为版本。测试名称使用稳定行为 ID，并保留一条普通读者可以理解的中文业务结果。

## 第一阶段：快速检查

目标：不构建完整网站，快速发现代码、类型、文档结构和发布边界问题。

统一入口：

```bash
npm run check:fast
```

包含：

- ESLint；
- TypeScript 类型检查；
- RIN 文档解析、投影和手势领域测试；
- 全部 Markdown 的 frontmatter 与 RIN 结构检查；
- 全局 Slides slug 冲突检查；
- 私人批注必须带有可机械识别的标记。

公开发布前单独运行：

```bash
npm run check:publish
```

该命令只允许从 `main` 发布，并拒绝包含 `data-private-note` 或 `visibility: private` 的内容。私人分支日常开发可以通过 `check:fast`，但不能误通过公开发布门禁。

## 第二阶段：静态产物检查

目标：验证 `out/` 中真正会被发布的页面，而不只验证源码。

统一入口：

```bash
npm run test:build
```

计划补充：

- 枚举全部导出页面；
- 检查站内链接、目录锚点、图片和 CSS；
- 检查文章与 Slides 双向跳转；
- 检查章节阅读器与整本书记录之间的链接；
- 在根路径和 GitHub Pages `/rin3` 前缀下验证资源地址。

## 第三阶段：真实浏览器检查

目标：验证只有在浏览器中才能观察到的行为。

统一入口：

```bash
npm --prefix harness run test:e2e
```

计划把现有 Chromium 脚本迁移到标准 Playwright Test，并覆盖少量关键旅程：

1. 桌面首页横向手势展开第四入口；
2. 手机末端滑动展开第四入口；
3. 首页 → 分区 → 文章 → Slides → 返回文章；
4. Slides 翻页、章节跳转、页码和深链接；
5. Mermaid、公式和图片正常显示；
6. 桌面与手机无明显横向溢出；
7. 键盘焦点和基础可访问性。

失败时保留 Playwright Trace、截图和 HTML 报告，让 Agent 能根据证据继续修复。

## 第四阶段：CI 与发布门禁

目标：让验证自动发生，而不是依靠人记住命令。

计划：

- Pull Request 自动运行 `check:fast` 和静态产物检查；
- UI 或交互改动运行浏览器测试；
- 公开部署前运行 `check:publish`；
- 失败时上传构建报告、截图和 Trace；
- 所有门禁通过后才部署 GitHub Pages。

项目自身的完整交付入口保持为：

```bash
npm test
```

跨层行为和浏览器验收独立执行：

```bash
npm --prefix harness run verify
```

## 内容生产链的长期方向

当前 Markdown/RIN 文档已经拥有统一解析和双视图编译链；`public/reading/` 下的章节阅读器仍主要是直接维护的 HTML。

随着章节增加，应逐步把阅读器改为“结构化源文件 → 统一生成 HTML”。迁移前至少为每本书维护章节清单，并用通用结构、链接和资源规则替代不断增长的正文硬编码断言。

## 当前进度

- [x] 保存分阶段计划；
- [x] 拆分领域、内容、构建和浏览器测试命令；
- [x] 增加 `check:fast`；
- [x] 增加内容契约检查；
- [x] 增加独立公开发布安全门禁；
- [x] 建立业务行为数据库和首批基线行为；
- [x] 增加函数反查、按行为执行和代码同步检查工具；
- [x] 将 Harness 拆成独立 package，移除产品运行时反向依赖；
- [ ] 建立全站静态链接巡检；
- [ ] 迁移到标准 Playwright Test；
- [ ] 增加 Pull Request CI。
