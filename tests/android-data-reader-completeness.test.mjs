import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import test from 'node:test';
const root = path.resolve(import.meta.dirname, '../public/reading/android-data-state');
const coverage = JSON.parse(await readFile(path.join(root, 'coverage.json'), 'utf8'));
function decode(text) {
  return text.replace(/&#x([0-9a-f]+);/gi, (_, value) => String.fromCodePoint(parseInt(value, 16)))
    .replace(/&#(\d+);/g, (_, value) => String.fromCodePoint(Number(value)))
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&nbsp;/g, '\u00a0').replace(/&amp;/g, '&');
}
const hash = text => createHash('sha256').update(text).digest('hex');
test('十篇数据与状态文章的三种版本保留全文单元、标题和原始代码', async () => {
  assert.equal(coverage.documents.length, 10);
  assert.equal(coverage.documents.reduce((sum, doc) => sum + doc.units, 0), 1130);
  for (const doc of coverage.documents) {
    assert.equal(doc.coverage, 'complete-article-body');
    for (const edition of ['index.html', 'literal.html', 'english.html']) {
      const html = await readFile(path.join(root, doc.slug, edition), 'utf8');
      const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
      assert.ok(article, `${doc.slug}/${edition}: article`);
      assert.deepEqual([...article.matchAll(/data-unit="([^"]+)"/g)].map(match => match[1]), doc.unitIds, `${doc.slug}/${edition}: complete unit sequence`);
      const ids = new Set([...article.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
      for (const heading of doc.source_headings) if (heading.id) assert.ok(ids.has(heading.id), `${doc.slug}/${edition}: ${heading.text}`);
      const blocks = [...article.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map(match => decode(match[1].replace(/<[^>]+>/g, '')));
      assert.deepEqual(blocks.map(hash), doc.code_sha256, `${doc.slug}/${edition}: unmodified code blocks`);
      const withoutBlocks = article.replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/g, '');
      const inline = [...withoutBlocks.matchAll(/<code\b[^>]*>([\s\S]*?)<\/code>/g)].map(match => decode(match[1].replace(/<[^>]+>/g, ''))).sort();
      assert.deepEqual(inline, [...doc.inline_code].sort(), `${doc.slug}/${edition}: unmodified inline code`);
      const images = [...article.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/g)];
      assert.equal(images.length, doc.images, `${doc.slug}/${edition}: all original figures`);
      for (const [, src] of images) await access(path.resolve(root, doc.slug, src));
    }
  }
});
test('原图资源保持来源清单中的哈希', async () => {
  const assets = JSON.parse(await readFile(path.join(root, 'assets.json'), 'utf8'));
  assert.equal(Object.keys(assets).length, 89);
  for (const asset of Object.values(assets)) {
    const bytes = await readFile(path.join(root, asset.path));
    assert.equal(createHash('sha256').update(bytes).digest('hex'), asset.sha256, asset.path);
  }
});
