# RIN III 验证指南

验证围绕实际代码、内容和页面结果展开。`harness/` 保留为独立测试工具目录；不再维护行为数据库、函数映射、行为版本或 Git 变更登记门禁。

## 按改动选择检查

| 场景 | 命令 | 验证范围 |
| --- | --- | --- |
| 代码与内容快速反馈 | `npm run check:fast` | Lint、类型、领域和内容契约 |
| 只检查领域逻辑 | `npm run test:domain` | 手势、文档解析和编译 |
| 只检查内容 | `npm run test:content` | 内容结构、课程导航、情绪素材、私人批注标记 |
| 课程阅读器 | `npm run check:course-readers` | 课程样式、章节导航和资源 |
| 情绪阅读器 | `npm run check:emotion-readers` | 情绪系列页面、样式和资源 |
| 静态导出 | `npm run test:build` | 构建并检查 `out/` 页面 |
| 关键浏览器交互 | `npm --prefix harness run test:e2e` | 构建并验证 Slides、文章目录和首页手势 |
| 验证工具自身 | `npm --prefix harness test` | 浏览器执行流程和 CI 发布约束 |
| 公开发布边界 | `npm run check:publish` | 必须来自 `main`，且无私人内容标记 |

根项目的完整入口 `npm test` 执行快速检查和静态导出检查，不依赖 Harness。

需要浏览器在内的完整验收时，安装方式见 [测试工具说明](../harness/README.md)，再运行：

```bash
npm --prefix harness run verify
```

该命令依次执行工具自检、快速检查、公开发布检查，然后只构建一次，共享产物执行静态和浏览器测试。公开发布检查在私人分支上会失败；日常开发使用上表对应命令即可。

新增测试直接描述预期结果，修复问题时优先覆盖实际失败场景。测试说明和断言保存可观察行为，长期设计约束写入 [架构文档](architecture.md)。

## 当前覆盖与边界

- PR 和部署 CI 已执行工具自检、快速检查和静态导出检查；部署上传前另有公开发布检查。
- 浏览器测试按需本地运行，现有首页手势测试保留截图和失败 Trace。
- 静态测试覆盖指定页面与内容约束，尚不是全站链接和锚点巡检。
- 独立阅读器仍主要直接维护 HTML，现状与样式归属见 [阅读器清单](reader-inventory.md)。
