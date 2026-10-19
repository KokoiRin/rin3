import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const root = path.resolve(import.meta.dirname, "../public/reading/android-build-system");
const coverage = JSON.parse(await readFile(path.join(root, "coverage.json"), "utf8"));
const hash = (text) => createHash("sha256").update(text).digest("hex");

function decode(text) {
  return text.replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(Number.parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, "\u00a0").replace(/&amp;/g, "&");
}

function attribute(tag, name) {
  return decode(tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? "");
}

function articleBody(html, label) {
  const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
  assert.ok(article, `${label}: original article body`);
  return article;
}

// 持续守住公开内容的覆盖边界，不在仓库重复文稿生成器的翻译语义检查。
test("Android 构建系统的十五篇双语阅读页保留全部正文单元、源标题和代码", async () => {
  assert.equal(coverage.documents.length, 15);
  assert.equal(new Set(coverage.documents.map((document) => document.id)).size, 15);
  assert.equal(coverage.documents.reduce((sum, document) => sum + document.units, 0), 996);
  assert.equal(coverage.documents.reduce((sum, document) => sum + document.code_blocks, 0), 133);
  assert.equal(coverage.documents.reduce((sum, document) => sum + document.images.length, 0), 26);
  const tableCounts = { "index.html": 0, "english.html": 0 };

  for (const document of coverage.documents) {
    const selected = document.id === "05-api";
    assert.equal(document.coverage, selected ? "selected-two-sections" : "complete-article-body");
    assert.equal(document.units, document.unitIds.length, `${document.id}: coverage unit count`);
    assert.equal(document.code_blocks, document.code_sha256.length, `${document.id}: coverage code count`);
    if (!selected) assert.equal(document.excerpt_scope, null);
    for (const edition of Object.keys(tableCounts)) {
      const label = `${document.id}/${edition}`;
      const html = await readFile(path.join(root, label), "utf8");
      const article = articleBody(html, label);
      assert.deepEqual(
        [...article.matchAll(/data-unit="([^"]+)"/g)].map((match) => match[1]),
        document.unitIds,
        `${label}: complete original unit sequence`,
      );
      const headingTags = [...article.matchAll(/<h[1-6]\b[^>]*>/g)].map((match) => match[0]);
      assert.deepEqual(
        headingTags.map((tag) => attribute(tag, "data-original-id") || attribute(tag, "id")),
        document.source_headings.map((heading) => heading.id),
        `${label}: original headings, including repeated source ids`,
      );
      const ids = [...article.matchAll(/(?:^|\s)id="([^"]+)"/g)].map((match) => match[1]);
      assert.equal(new Set(ids).size, ids.length, `${label}: unique live HTML ids`);
      const blocks = [...article.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)]
        .map((match) => decode(match[1].replace(/<[^>]+>/g, "")));
      assert.deepEqual(blocks.map(hash), document.code_sha256, `${label}: original code hashes`);
      const images = [...article.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
      assert.equal(images.length, document.images.length, `${label}: original figures`);
      for (const image of images) {
        const src = attribute(image, "src");
        assert.ok(src && !/^https?:/.test(src), `${label}: locally published image`);
        await readFile(path.resolve(root, document.id, src));
      }
      tableCounts[edition] += (article.match(/<table\b/g) ?? []).length;
      const nav = html.match(/<nav\b[^>]*class="site-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] ?? "";
      assert.ok([...nav.matchAll(/<a\b[^>]*>/g)].some((match) =>
        attribute(match[0], "href") === document.url), `${label}: exact official source link`);
      assert.ok(html.includes("编者导读 · 不属于原文"), `${label}: editorial boundary`);
    }
  }
  assert.deepEqual(tableCounts, { "index.html": 16, "english.html": 16 });
});

test("API 依赖一篇明确声明两节节选，其余十四篇声明正文全文", async () => {
  const index = await readFile(path.join(root, "index.html"), "utf8");
  assert.match(index.replace(/<[^>]+>/g, ""), /14 篇正文全文与 1 篇明确节选/);
  const excerpt = coverage.documents.find((document) => document.id === "05-api");
  assert.ok(excerpt);
  for (const title of [
    "API and implementation separation",
    "Recognizing API and implementation dependencies",
  ]) assert.ok(excerpt.excerpt_scope.includes(title));
  assert.match(excerpt.excerpt_scope, /未翻译整篇 Java Library Plugin 文档/);
  for (const edition of ["index.html", "english.html"]) {
    const html = await readFile(path.join(root, excerpt.id, edition), "utf8");
    const notice = html.match(/<aside\b[^>]*class="scope-notice excerpt"[^>]*>([\s\S]*?)<\/aside>/)?.[1];
    assert.ok(notice, `${edition}: visible excerpt scope notice`);
    assert.ok(decode(notice.replace(/<[^>]+>/g, "")).includes(excerpt.excerpt_scope));
  }
  for (const document of coverage.documents.filter((entry) => entry.id !== "05-api")) {
    const html = await readFile(path.join(root, document.id, "index.html"), "utf8");
    const details = html.match(/<details\b[^>]*class="source-details"[^>]*>([\s\S]*?)<\/details>/)?.[1] ?? "";
    assert.match(decode(details.replace(/<[^>]+>/g, "")), /对应官方英文.*正文全文/, `${document.id}: full-body scope statement`);
    assert.doesNotMatch(details, /仅节选/, `${document.id}: complete article is not labelled an excerpt`);
  }
});

test("二十六个原图资源与来源清单的哈希一致", async () => {
  const assets = JSON.parse(await readFile(path.join(root, "assets.json"), "utf8"));
  assert.equal(Object.keys(assets).length, 26);
  const imageSources = coverage.documents.flatMap((document) => document.images);
  for (const source of imageSources) assert.ok(assets[source], `figure has provenance: ${source}`);
  for (const asset of Object.values(assets)) {
    const bytes = await readFile(path.join(root, asset.path));
    assert.equal(hash(bytes), asset.sha256, asset.path);
    assert.equal(bytes.length, asset.bytes, asset.path);
  }
});
