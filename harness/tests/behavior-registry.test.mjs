import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import {
  browserPreflightMessage,
  environmentForBehaviors,
  findBehaviors,
  loadRegistry,
  parseTestSummary,
  resolveBrowserExecutable,
  validateChangedCode,
  validateRegistry,
} from "../scripts/behavior.mjs";

function fixtureTest(name) {
  return `test(${JSON.stringify(name)}, () => {});\n`;
}

function createChangeFixture(t) {
  const root = mkdtempSync(path.join(tmpdir(), "rin3-behavior-check-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const write = (file, source) => {
    mkdirSync(path.dirname(path.join(root, file)), { recursive: true });
    writeFileSync(path.join(root, file), source);
  };
  const git = (...args) => execFileSync("git", [
    "-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null",
    "-c", "commit.gpgsign=false", "-c", "user.name=Harness",
    "-c", "user.email=harness@example.invalid", ...args,
  ], { cwd: root, stdio: "pipe" });
  const registry = {
    schemaVersion: 1,
    codeRoots: ["src"],
    testRoots: ["tests"],
    behaviors: [{
      id: "FIXTURE-001", version: 2, status: "active", nameZh: "示例行为",
      behaviorZh: "示例函数返回固定结果。", lastReviewedOn: "2026-09-01",
      code: [{ file: "src/example.mjs", symbol: "example", roleZh: "返回示例结果" }],
      tests: [{ file: "tests/example.test.mjs", name: "旧测试", level: "unit", behaviorZh: "返回固定结果。" }],
    }],
  };
  write("src/example.mjs", "export function example() { return 1; }\n");
  write("tests/example.test.mjs", fixtureTest("旧测试"));
  write("harness/behaviors/registry.json", JSON.stringify(registry));
  git("init", "--quiet");
  git("add", ".");
  git("commit", "--quiet", "-m", "Fixture baseline");
  return { root, registry, write };
}

// 只调整实现与已有测试写法时，仍检查映射，但不要求制造一个新的行为版本。
test("[HARNESS-TRACE-001] 纯重构保持行为版本仍能通过变更检查", (t) => {
  const { root, registry, write } = createChangeFixture(t);
  write("src/example.mjs", "export function example() { const result = 1; return result; }\n");
  write("tests/example.test.mjs", `// 调整已有测试的说明。\n${fixtureTest("旧测试")}`);

  assert.deepEqual(validateChangedCode(registry, root), ["src/example.mjs", "tests/example.test.mjs"]);
  assert.equal(registry.behaviors[0].version, 2);
});

// 即使只修改数据库，行为描述和状态变化也必须有新版本，已有版本不能回退。
test("[HARNESS-TRACE-001] 行为描述或状态变化必须升版本且版本不能回退", (t) => {
  const { root, registry } = createChangeFixture(t);
  for (const change of [{ behaviorZh: "示例函数返回新的结果。" }, { status: "retired" }]) {
    const updated = structuredClone(registry);
    Object.assign(updated.behaviors[0], change);
    assert.throws(() => validateChangedCode(updated, root), /bump version/);
    updated.behaviors[0].version = 3;
    updated.behaviors[0].lastReviewedOn = "2026-09-07";
    assert.doesNotThrow(() => validateChangedCode(updated, root));
  }
  registry.behaviors[0].version = 1;
  assert.throws(() => validateChangedCode(registry, root), /version must not decrease/);
});

// 放宽版本要求不能让未登记的代码、测试文件或不合规的新测试绕过检查。
test("[HARNESS-TRACE-001] 不升版本仍拒绝缺失映射与无行为编号的新测试", (t) => {
  const { root, registry, write } = createChangeFixture(t);
  write("src/unmapped.mjs", "export function unmapped() {}\n");
  write("tests/unmapped.test.mjs", fixtureTest("未登记测试"));
  write("tests/example.test.mjs", fixtureTest("旧测试") + fixtureTest("新增但没有编号"));

  assert.throws(() => validateChangedCode(registry, root), (error) => {
    assert.match(error.message, /src\/unmapped.mjs: changed code file is not mapped/);
    assert.match(error.message, /tests\/unmapped.test.mjs: changed test file is not mapped/);
    assert.match(error.message, /new or renamed business test needs/);
    return true;
  });
});

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
