# 业务行为数据库

`registry.json` 是 RIN III 的业务行为、关键代码和测试用例之间的唯一结构化索引。

每条记录必须包含：

- 稳定行为 ID；
- 一句中文业务行为描述；
- 版本与最后复核日期；
- 实现该行为的关键函数；
- 用中文说明可观察结果的测试用例。

常用命令：

```bash
# 查看全部行为
npm --prefix harness run behavior -- list

# 查看一个行为的代码和测试
npm --prefix harness run behavior -- show HOME-GATE-001

# 从函数或文件反查受影响业务
npm --prefix harness run behavior -- impact advanceWheelGesture

# 执行一个行为的全部已登记测试
npm --prefix harness run behavior -- run HOME-GATE-001

# 校验数据库、函数、测试以及本轮代码变更是否同步
npm --prefix harness run check
```

数据库保存语义关系，TypeScript/JavaScript 源码仍然是实现事实。不要把每个内部辅助函数都登记为业务行为；登记能够表达业务边界、核心状态变化或最终可观察结果的函数。

当前是首批基线，只覆盖最重要的跨层行为；未带行为 ID 的旧测试将随实际修改逐步迁移。此后新增或修改的业务测试不能再以无 ID 状态进入仓库。

修改已登记代码或测试时，先结合代码与测试复核可观察行为：行为变化时更新 `behaviorZh`、提升 `version`、将 `lastReviewedOn` 设为复核日期；纯重构只复核并按需修正映射，不要求升版本。新增可观察行为时创建新 ID；删除行为时先改为 `retired`，确认没有代码和测试引用后再清理。

`check` 校验映射完整性和新增测试命名，并在行为描述或状态相对 `HEAD` 变化时要求提升版本；已有版本不得回退。代码或测试文件变化本身不触发升版本。工具无法从代码差异推断行为是否改变，也无法证明已完成复核；未更新行为描述的语义变化仍需由代码审查和行为测试发现。
