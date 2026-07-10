import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
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
  assert.match(html, new RegExp(`src="${basePath}/entrance/math-sakura\\.png"`));
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
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
});

test("publishes the workflow-interface note under software engineering", async () => {
  const index = await readOutput("software-engineering/index.html");
  const article = await readOutput(
    "software-engineering/when-workflows-are-clear-but-interfaces-are-not/index.html",
  );

  assert.match(index, /When the Workflow Is Clear but the Interface Is Not/);
  assert.match(article, /A skill should expose a contract/);
  assert.match(article, /Process knowledge and interface knowledge are different assets/);
});

test("exports no Han characters in any page", async () => {
  const outRoot = new URL("../out/", import.meta.url);
  const files = await readdir(outRoot, { recursive: true });
  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  for (const file of htmlFiles) {
    const html = await readFile(new URL(file, outRoot), "utf8");
    assert.doesNotMatch(html, /\p{Script=Han}/u, `${file} contains Han characters`);
  }
});
