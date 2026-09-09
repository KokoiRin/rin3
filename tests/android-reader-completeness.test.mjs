import assert from "node:assert/strict";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../public/reading/android-foundations");
const coverage = JSON.parse(await readFile(path.join(root, "coverage.json"), "utf8"));

test("Android 的 21 篇中英文阅读页保留完整官方正文的全部单元和章节", async () => {
  assert.equal(coverage.documents.length, 21);
  assert.equal(new Set(coverage.documents.map((doc) => doc.slug)).size, 21);
  for (const doc of coverage.documents) {
    assert.equal(doc.coverage, "complete-article-body");
    for (const filename of ["index.html", "english.html"]) {
      const source = await readFile(path.join(root, doc.slug, filename), "utf8");
      const label = `${doc.slug}/${filename}`;
      const units = [...source.matchAll(/data-unit="([^"]+)"/g)].map((match) => match[1]);
      assert.deepEqual(units, doc.source_units, `${label}: missing or reordered original text`);
      const ids = new Set([...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
      for (const heading of doc.source_headings) {
        assert.ok(ids.has(heading.id), `${label}: missing original section ${heading.title}`);
      }
      assert.equal((source.match(/<pre\b/g) ?? []).length, doc.code_blocks, `${label}: missing code`);
      const images = [...source.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)];
      assert.equal(images.length, doc.images, `${label}: missing figures`);
      for (const [, src] of images) await access(path.resolve(root, doc.slug, src));
      assert.doesNotMatch(source, />TODO</, `${label}: unfinished translation`);
    }
  }
});
