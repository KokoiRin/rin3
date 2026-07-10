import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import test from "node:test";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/rin3" : "";

async function readOutput(relativePath) {
  return readFile(new URL(`../out/${relativePath}`, import.meta.url), "utf8");
}

test("exports the three learning gates with deploy-safe paths", async () => {
  const html = await readOutput("index.html");

  assert.match(html, /<title>RIN III<\/title>/i);
  assert.match(html, /Mathematics/);
  assert.match(html, /Computer Science/);
  assert.match(html, /Software Engineering/);
  assert.match(html, new RegExp(`href="${basePath}/mathematics/"`));
  assert.match(html, new RegExp(`src="${basePath}/entrance/math-sakura\\.webp"`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("exports optimized entrance artwork", async () => {
  for (const fileName of [
    "math-sakura.webp",
    "computer-lotus.webp",
    "engineering-maple.webp",
  ]) {
    const asset = await stat(new URL(`../out/entrance/${fileName}`, import.meta.url));
    assert.ok(asset.size < 500_000, `${fileName} should remain below 500 KB`);
  }
});

test("exports each section index", async () => {
  for (const [directory, title] of [
    ["mathematics", "Mathematics"],
    ["computer-science", "Computer Science"],
    ["software-engineering", "Software Engineering"],
  ]) {
    const html = await readOutput(`${directory}/index.html`);
    assert.match(html, new RegExp(`<title>${title} \\| RIN III<\\/title>`, "i"));
    assert.match(html, /Notes/);
  }
});

test("renders Markdown, LaTeX, tables, and highlighted code", async () => {
  const html = await readOutput("mathematics/eigenvalues/index.html");

  assert.match(html, /Eigenvalues: Scale Along Stable Directions/);
  assert.match(html, /class="katex"/);
  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /<table>/);
  assert.match(html, /np\.linalg\.eig/);
  assert.match(html, /<article class="article-shell" lang="en">/);
  assert.match(html, /ON THIS PAGE/);
  assert.match(html, /href="#a-two-dimensional-example"/);
  assert.match(html, /ALL MATHEMATICS NOTES/);
});

test("publishes the workflow-interface note under software engineering", async () => {
  const index = await readOutput("software-engineering/index.html");
  const article = await readOutput(
    "software-engineering/when-workflows-are-clear-but-interfaces-are-not/index.html",
  );

  assert.match(index, /流程清楚，接口却模糊/);
  assert.match(article, /Skill 需要的不是口号，而是契约/);
  assert.match(article, /流程知识和接口知识是两种不同的资产/);
  assert.match(article, /<article class="article-shell" lang="zh-CN">/);
  assert.match(article, /ON THIS PAGE/);
  assert.match(article, /ALL SOFTWARE ENGINEERING NOTES/);
});

test("keeps the entrance copy English-only", async () => {
  const html = await readOutput("index.html");
  assert.doesNotMatch(html, /\p{Script=Han}/u);
});
