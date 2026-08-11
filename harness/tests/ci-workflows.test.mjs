import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "../..");

async function readWorkflow(fileName) {
  return readFile(path.join(repositoryRoot, ".github/workflows", fileName), "utf8");
}

test("[PUBLISH-SAFETY-001] 公开部署在上传产物前执行发布安全门禁", async () => {
  const workflow = await readWorkflow("deploy-pages.yml");
  const safetyCheck = workflow.indexOf("run: npm run check:publish");
  const upload = workflow.indexOf("uses: actions/upload-pages-artifact@");

  assert.notEqual(safetyCheck, -1, "deploy workflow must run check:publish");
  assert.notEqual(upload, -1, "deploy workflow must upload the verified artifact");
  assert.ok(safetyCheck < upload, "check:publish must run before the artifact is uploaded");
});

test("[HARNESS-TRACE-001] 部署和拉取请求都会自动校验行为数据库", async () => {
  const [deployWorkflow, pullRequestWorkflow] = await Promise.all([
    readWorkflow("deploy-pages.yml"),
    readWorkflow("verify.yml"),
  ]);

  assert.match(deployWorkflow, /run: npm --prefix harness ci --ignore-scripts/);
  assert.match(deployWorkflow, /run: npm --prefix harness test/);
  assert.match(pullRequestWorkflow, /pull_request:/);
  assert.match(pullRequestWorkflow, /run: npm --prefix harness ci --ignore-scripts/);
  assert.match(pullRequestWorkflow, /run: npm --prefix harness test/);
  assert.match(pullRequestWorkflow, /run: npm test/);
});
