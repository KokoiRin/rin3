import assert from "node:assert/strict";
import test from "node:test";
import {
  browserPreflightMessage,
  environmentForBehaviors,
  findBehaviors,
  loadRegistry,
  parseTestSummary,
  resolveBrowserExecutable,
  validateRegistry,
} from "../scripts/behavior.mjs";

// 函数名应当成为进入业务语义、实现位置和可执行测试的统一查询入口。
test("[HARNESS-TRACE-001] 输入函数名可以反查中文业务行为和对应测试", async () => {
  const registry = await validateRegistry(await loadRegistry());
  const [behavior] = findBehaviors(registry, "advanceWheelGesture");

  assert.equal(behavior.id, "HOME-GATE-001");
  assert.match(behavior.behaviorZh, /第三次独立横向手势/);
  assert.ok(behavior.code.some((code) => code.symbol === "advanceWheelGesture"));
  assert.ok(behavior.tests.length >= 2);
  assert.ok(behavior.tests.every((testCase) => /[\u3400-\u9fff]/.test(testCase.behaviorZh)));
});

// 验收执行结果应该转换为页面能稳定读取的通过、失败和跳过数量。
test("[HARNESS-TRACE-001] 行为执行输出可以转换为结构化验收结果", () => {
  const summary = parseTestSummary(`
ℹ tests 8
ℹ pass 7
ℹ fail 0
ℹ skipped 1
`);

  assert.deepEqual(summary, {
    total: 8,
    passed: 7,
    failed: 0,
    skipped: 1,
  });
});

test("[HARNESS-TRACE-001] 发布级行为执行时不会跳过公开发布门禁", () => {
  const environment = environmentForBehaviors([
    { tests: [{ level: "unit" }, { level: "release" }] },
  ], { EXISTING_VALUE: "kept" });

  assert.equal(environment.PUBLIC_RELEASE, "true");
  assert.equal(environment.EXISTING_VALUE, "kept");
});

test("[HARNESS-TRACE-001] 浏览器缺失时在构建前给出正确安装命令", () => {
  const message = browserPreflightMessage([
    { tests: [{ level: "browser" }] },
  ], "/definitely-missing/playwright-chromium");

  assert.match(message, /npm --prefix harness run install:browser/);
  assert.match(message, /不会执行生产构建/);
  assert.equal(resolveBrowserExecutable("/missing", [process.execPath]), process.execPath);
});
