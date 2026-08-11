import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const releaseMode = process.env.PUBLIC_RELEASE === "true";

async function listFiles(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(entryPath));
    else files.push(entryPath);
  }
  return files;
}

// 私人批注必须同时具备机器标记和样式标记，后续打包或发布门禁才能可靠识别。
test("[PUBLISH-SAFETY-001] 每条私人阅读批注都具备可机械识别的双重标记", async () => {
  const readingRoot = path.join(repositoryRoot, "public/reading");
  const htmlFiles = (await listFiles(readingRoot)).filter((file) => file.endsWith(".html"));

  for (const filePath of htmlFiles) {
    const html = await readFile(filePath, "utf8");
    for (const tag of html.match(/<[^>]*data-private-note[^>]*>/g) ?? []) {
      assert.match(
        tag,
        /class="[^"]*\bprivate-note\b[^"]*"/,
        `${filePath}: data-private-note must also carry the private-note class`,
      );
    }
  }
});

// 私人分支允许本地阅读，但公开发布必须来自 main 且不能携带任何私人标记。
test("[PUBLISH-SAFETY-001] 公开发布拒绝私人分支和私人内容标记", { skip: !releaseMode }, async () => {
  const branch = process.env.GITHUB_REF_NAME || execFileSync(
    "git",
    ["branch", "--show-current"],
    { cwd: repositoryRoot, encoding: "utf8" },
  ).trim();
  assert.equal(branch, "main", `public release must run from main, received "${branch || "detached HEAD"}"`);

  const roots = [path.join(repositoryRoot, "content"), path.join(repositoryRoot, "public")];
  const privateFiles = [];
  for (const root of roots) {
    for (const filePath of await listFiles(root)) {
      if (!/\.(?:css|html|md)$/.test(filePath)) continue;
      const source = await readFile(filePath, "utf8");
      if (/data-private-note|^visibility:\s*private\s*$/m.test(source)) {
        privateFiles.push(path.relative(repositoryRoot, filePath));
      }
    }
  }

  assert.deepEqual(
    privateFiles,
    [],
    `public release contains private content markers:\n${privateFiles.join("\n")}`,
  );
});
