import assert from "node:assert/strict";
import { parse } from "parse5";

const unitTags = new Set(["h1", "h2", "h3", "h4", "p", "summary", "figcaption"]);
const attribute = (node, name) => node.attrs?.find((attr) => attr.name === name)?.value;
const hasClass = (node, name) => attribute(node, "class")?.split(/\s+/).includes(name);

function unitText(node) {
  if (hasClass(node, "source-refs")) return "";
  if (node.nodeName === "#text") return node.value;
  return (node.childNodes ?? []).map(unitText).join("");
}

export function verifyKotlinUnits(html, document, label) {
  const ids = [];
  const empty = new Set(document.emptySourceUnits);
  function visit(node, inSource = false) {
    if (hasClass(node, "learning-note") || hasClass(node, "source-tab-title")) return;
    const body = inSource || hasClass(node, "translated-article") || hasClass(node, "chapter-header");
    if (body && unitTags.has(node.tagName)) {
      const id = attribute(node, "id");
      ids.push(id);
      if (!empty.has(id)) {
        assert.ok(unitText(node).trim(), `${label}: empty source paragraph or heading ${id}`);
      }
    }
    for (const child of node.childNodes ?? []) visit(child, body);
  }
  visit(parse(html));
  assert.deepEqual(ids, document.unitIds, `${label}: missing, extra or reordered source unit`);
}
