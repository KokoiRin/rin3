import assert from "node:assert/strict";
import test from "node:test";
import { resolveBrowserExecutable, runBrowserTests } from "../scripts/browser.mjs";

test("浏览器缺失时不会开始构建", (t) => {
  const messages = [];
  t.mock.method(process.stderr, "write", (message) => { messages.push(message); return true; });
  const status = runBrowserTests({
    executablePath: "/definitely-missing/playwright-chromium",
    run: () => assert.fail("missing browser must stop before build"),
  });
  assert.equal(status, 1);
  assert.match(messages.join(""), /npm --prefix harness run install:browser/);
  assert.equal(resolveBrowserExecutable("/missing", [process.execPath]), process.execPath);
});

test("静态产物和浏览器测试共享一次成功构建并返回测试退出码", () => {
  const calls = [];
  const status = runBrowserTests({
    includeStatic: true,
    executablePath: process.execPath,
    run: (command, args, options) => {
      calls.push({ command, args, options });
      return { status: calls.length === 1 ? 0 : 7 };
    },
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].args, ["run", "build"]);
  assert.deepEqual(calls[1].args, ["--test", "tests/rendered-html.test.mjs", "harness/tests/browser-runtime.test.mjs"]);
  assert.equal(calls[1].options.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH, process.execPath);
  assert.equal(status, 7);
});

test("构建失败时不会用旧产物继续测试", () => {
  let calls = 0;
  const status = runBrowserTests({
    executablePath: process.execPath,
    run: () => {
      calls += 1;
      return { status: 2 };
    },
  });
  assert.equal(calls, 1);
  assert.equal(status, 2);
});
