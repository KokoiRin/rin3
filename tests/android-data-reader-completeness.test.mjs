import { verifyReaderCode } from "./android-reader-code.mjs";
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
function codeBlocks(article) {
  return [...article.matchAll(/<pre\b[^>]*>([\s\S]*?)<\/pre>/g)].map(match => decode(match[1].replace(/<[^>]+>/g, '')));
}

test('十篇数据与状态文章的三种版本保留全文单元、标题和原始代码', async () => {
  assert.equal(coverage.documents.length, 10);
  assert.equal(coverage.documents.reduce((sum, doc) => sum + doc.units, 0), 1130);
  for (const doc of coverage.documents) {
    assert.equal(doc.coverage, 'complete-article-body');
    let originalCode;
    for (const edition of ['english.html', 'index.html', 'literal.html']) {
      const html = await readFile(path.join(root, doc.slug, edition), 'utf8');
      const article = html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)?.[1];
      assert.ok(article, `${doc.slug}/${edition}: article`);
      assert.deepEqual([...article.matchAll(/data-unit="([^"]+)"/g)].map(match => match[1]), doc.unitIds, `${doc.slug}/${edition}: complete unit sequence`);
      const ids = new Set([...article.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));
      for (const heading of doc.source_headings) if (heading.id) assert.ok(ids.has(heading.id), `${doc.slug}/${edition}: ${heading.text}`);
      const blocks = codeBlocks(article);
      if (edition === 'english.html') originalCode = blocks;
      verifyReaderCode(originalCode, blocks, doc.code_sha256, edition, `${doc.slug}/${edition}`);
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

test('中文示例允许翻译说明性注释，程序字符串、工具标记和取消调用仍逐字核对', async () => {
  const sample = coverage.documents.find(({ slug }) => slug === '06-cancellation');
  const page = await readFile(path.join(root, sample.slug, 'english.html'), 'utf8');
  const blocks = codeBlocks(page.match(/<article\b[^>]*>([\s\S]*?)<\/article>/)[1]);
  const message = 'Used as a signal that the coroutine has started running';
  const index = blocks.findIndex((block) => block.includes(message));
  assert.notEqual(index, -1);
  const source = blocks[index];
  const check = (candidate) => verifyReaderCode(
    [source], [candidate], [sample.code_sha256[index]], 'index.html', sample.slug,
  );
  const translated = source.replace(message, '用来通知外部：协程已经开始运行');
  check(translated);
  for (const [before, after] of [
    ['println("The coroutine has started")', 'println("协程已启动")'],
    ['//sampleStart', '//示例开始'],
    ['childJob.cancel()', 'childJob.join()'],
    ['用来通知外部：协程已经开始运行', ''],
  ]) {
    assert.ok(translated.includes(before));
    assert.throws(() => check(translated.replace(before, after)), assert.AssertionError);
  }
});
