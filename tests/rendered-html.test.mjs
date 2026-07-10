import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";

async function readOutput(relativePath) {
  return readFile(new URL(`../out/${relativePath}`, import.meta.url), "utf8");
}

test("exports the three learning gates with deploy-safe paths", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /<title>铃有三剑<\/title>/i);
  assert.match(html, /数学/);
  assert.match(html, /计算机/);
  assert.match(html, /软件工程/);
  assert.match(html, new RegExp(`href="${basePath}/mathematics/"`));
  assert.match(html, new RegExp(`src="${basePath}/entrance/math-sakura\\.png"`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("exports each section index", async () => {
  for (const [directory, title] of [
    ["mathematics", "数学"],
    ["computer-science", "计算机"],
    ["software-engineering", "软件工程"],
  ]) {
    const html = await readOutput(`${directory}/index.html`);
    assert.match(html, new RegExp(`<title>${title} \\| 铃有三剑<\\/title>`, "i"));
    assert.match(html, /札记/);
  }
});

test("renders Markdown, LaTeX, tables, and highlighted code", async () => {
  const html = await readOutput("mathematics/eigenvalues/index.html");

  assert.match(html, /特征值：保持方向的尺度/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /<table>/);
  assert.match(html, /np\.linalg\.eig/);
});
