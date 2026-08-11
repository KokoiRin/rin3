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

修改已登记代码或测试时，应提升受影响行为的 `version`、更新 `lastReviewedOn`，并同步代码或测试映射。工具会拒绝没有行为映射的变更文件，也会拒绝新增无 `[行为ID] 中文名称` 的业务测试。新增可观察行为时创建新 ID；删除行为时先改为 `retired`，确认没有代码和测试引用后再清理。
