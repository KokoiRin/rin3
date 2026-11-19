import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

// Ranges are taken from the verified English blocks. Each triple identifies a
// zero-based line and a half-open column range containing explanatory text.
// Delimiters, tool markers, commented-out code, strings and output stay literal.
const commentRanges = JSON.parse(readFileSync(
  new URL("./fixtures/android-reader-comment-ranges.json", import.meta.url), "utf8",
));

export function verifyReaderCode(originals, published, hashes, edition, label) {
  assert.equal(originals.length, hashes.length, label);
  assert.equal(published.length, originals.length, label);
  originals.forEach((source, index) => {
    const block = `${label}, code block ${index + 1}`;
    const digest = createHash("sha256").update(source).digest("hex");
    assert.equal(digest, hashes[index], `${block}: official English example`);
    const translation = published[index];
    if (source === translation) return;

    const ranges = commentRanges[digest];
    assert.ok(edition !== "english.html" && ranges, `${block}: changed source code or output`);
    const sourceLines = source.split("\n");
    const lines = translation.split("\n");
    assert.equal(lines.length, sourceLines.length, `${block}: line structure`);
    for (const [line, start, end] of ranges) {
      const before = sourceLines[line].slice(0, start);
      const after = sourceLines[line].slice(end);
      const value = lines[line];
      if (value === sourceLines[line]) continue;
      assert.ok(value.startsWith(before) && value.endsWith(after), `${block}: code beside comment on line ${line + 1}`);
      const comment = value.slice(start, value.length - after.length);
      assert.match(comment, /\p{Script=Han}/u, `${block}: expected Chinese comment on line ${line + 1}`);
      // A replacement must remain inside the original comment in the source language.
      assert.doesNotMatch(comment, /\/\*|\*\/|\\u+[\da-fA-F]{4}|[\r\u2028\u2029]/u, block);
      lines[line] = sourceLines[line];
    }
    assert.deepEqual(lines, sourceLines, `${block}: text outside a translated comment`);
  });
}
