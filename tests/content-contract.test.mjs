import { verifyKotlinUnits } from "./kotlin-reader-units.mjs";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import { parseRinDocument } from "@rin/document";
import { validateCourseReaders } from "../scripts/check-course-readers.mjs";
import { readUpdateMetadata } from "../lib/content/recent-update-data.js";

const contentRoot = path.resolve(import.meta.dirname, "../content");
const knownSections = new Set([
  "computer-science",
  "mathematics",
  "me",
  "software-engineering",
]);

function requireString(data, key, filePath) {
  const value = data[key];
  assert.equal(
    typeof value === "string" && value.trim().length > 0,
    true,
    `${filePath}: frontmatter field "${key}" must be a non-empty string`,
  );
  return value;
}

function requireValidDate(data, filePath) {
  const value = data.date;
  const date = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : requireString(data, "date", filePath);
  assert.match(date, /^\d{4}-\d{2}-\d{2}$/, `${filePath}: date must use YYYY-MM-DD`);
  assert.equal(
    new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10),
    date,
    `${filePath}: date must be a real calendar date`,
  );
}

async function readContentFiles() {
  const sectionNames = await readdir(contentRoot);
  const unknownSections = sectionNames.filter((section) => !knownSections.has(section));
  assert.deepEqual(unknownSections, [], `content contains unknown sections: ${unknownSections.join(", ")}`);

  const files = [];
  for (const section of sectionNames.sort()) {
    const sectionRoot = path.join(contentRoot, section);
    for (const fileName of (await readdir(sectionRoot)).sort()) {
      if (!fileName.endsWith(".md")) continue;
      files.push({
        filePath: path.join(sectionRoot, fileName),
        section,
        slug: fileName.slice(0, -3),
      });
    }
  }
  return files;
}

// 每篇内容在进入完整 Next.js 构建前，就应暴露可定位的元数据或 RIN 结构错误。
test("[CONTENT-CONTRACT-001] 每个内容源在完整构建前通过快速契约检查", async () => {
  const files = await readContentFiles();
  assert.ok(files.length > 0, "content must contain at least one Markdown source");

  for (const { filePath, section, slug } of files) {
    assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, `${filePath}: slug must use kebab-case`);
    const source = await readFile(filePath, "utf8");
    const parsed = matter(source);
    const data = parsed.data;

    requireString(data, "title", filePath);
    requireString(data, "summary", filePath);
    if (data.tldr !== undefined) {
      requireString(data, "tldr", filePath);
    }
    requireString(data, "topic", filePath);
    requireValidDate(data, filePath);
    const publicationDate = data.date instanceof Date ? data.date.toISOString().slice(0, 10) : data.date;
    readUpdateMetadata(data, filePath, publicationDate, path.resolve(contentRoot, "../public"));
    assert.ok(["en", "zh-CN"].includes(data.lang), `${filePath}: lang must be "en" or "zh-CN"`);
    assert.equal(
      Array.isArray(data.tags) && data.tags.every((tag) => typeof tag === "string"),
      true,
      `${filePath}: tags must be an array of strings`,
    );
    if (data.order !== undefined) {
      assert.equal(Number.isFinite(data.order), true, `${filePath}: order must be a finite number`);
    }

    if (data.format === "rin-note") {
      parseRinDocument(source, filePath, section, slug);
    } else {
      assert.equal(data.format, undefined, `${filePath}: unknown content format "${data.format}"`);
      if (data.slides !== undefined) {
        assert.equal(
          typeof data.slides === "string"
            && data.slides.startsWith("/slides/")
            && !data.slides.endsWith("/"),
          true,
          `${filePath}: slides must be a route like "/slides/deck-name"`,
        );
      }
    }
  }
});

// Slides 使用全站共享路由，因此不同分区也不能生成相同 slug。
test("[CONTENT-CONTRACT-001] 全站派生 Slides 路由保持唯一", async () => {
  const routes = new Map();

  for (const { filePath, slug } of await readContentFiles()) {
    const data = matter(await readFile(filePath, "utf8")).data;
    const slideRoute = data.format === "rin-note" ? `/slides/${slug}` : data.slides;
    if (!slideRoute) continue;
    assert.equal(
      routes.has(slideRoute),
      false,
      `${filePath}: duplicate slide route "${slideRoute}" also used by ${routes.get(slideRoute)}`,
    );
    routes.set(slideRoute, filePath);
  }
});

// Kotlin 与 Android 学习页直接交付静态 HTML，因此必须在构建前检查共同的阅读契约。
test("[COURSE-READER-001] 学习课程使用指定样式并保持完整导航", async () => {
  assert.deepEqual(await validateCourseReaders(), []);
});

test("Kotlin 协程指南提供两轮译稿，示例只翻译注释并保留原图", async () => {
  const root = path.resolve(contentRoot, "../public/reading/kotlin-coroutines-guide");
  const chapters = JSON.parse(await readFile(path.join(root, "coverage.json"), "utf8"));
  const sourceUnits = JSON.parse(await readFile(new URL("./fixtures/kotlin-reader-units.json", import.meta.url), "utf8"));
  const overview = { chapter: "", codeBlocks: 0, figures: 0, textUnits: 24 };
  assert.equal(chapters.length, 12);
  assert.deepEqual(Object.keys(sourceUnits).sort(), ["coroutines-guide", ...chapters.map(({ chapter }) => chapter)].sort());
  const versions = ["index.html", "literal.html", "english.html"];
  const examples = (page) => page.match(/<pre><code\b[\s\S]*?<\/code><\/pre>/g) ?? [];
  const comments = /<span class="code-comment">([^<]*)<\/span>/g;
  const withoutCommentText = (block) => block.replace(comments, '<span class="code-comment"></span>');
  const images = (page) => [...page.matchAll(/<img\b[^>]*? src="([^"]+)"/g)].map((match) => match[1]);

  for (const { chapter, codeBlocks, figures, textUnits, sourceSha256 } of [overview, ...chapters]) {
    const units = sourceUnits[chapter || "coroutines-guide"];
    if (chapter) assert.equal(units.sourceSha256, sourceSha256, chapter);
    assert.equal(units.unitIds.length, textUnits, chapter);
    const pages = await Promise.all(versions.map((file) => readFile(path.join(root, chapter, file), "utf8")));
    const [polished, literal, english] = pages;
    for (const [index, page] of pages.entries()) {
      verifyKotlinUnits(page, units, `${chapter || "overview"}/${versions[index]}`);
      for (const file of versions) assert.ok(page.includes(`href="${file}"`), chapter);
    }
    const original = examples(english);
    assert.equal(original.length, codeBlocks, chapter);
    assert.equal(images(english).length, figures, chapter);
    for (const chinese of [polished, literal]) {
      assert.deepEqual(examples(chinese).map(withoutCommentText), original.map(withoutCommentText), chapter);
      assert.deepEqual(images(chinese), images(english), chapter);
    }
    assert.deepEqual(examples(polished), examples(literal), chapter);
    const translated = examples(polished).flatMap((block) => [...block.matchAll(comments)].map((m) => m[1]));
    const source = original.flatMap((block) => [...block.matchAll(comments)].map((m) => m[1]));
    source.forEach((value, i) => {
      if (/\b[A-Za-z]+ [A-Za-z]+\b/.test(value)) assert.match(translated[i], /\p{Script=Han}/u, chapter);
    });
  }
});

test("Kotlin 正文缺段、空段、重复或调序时均无法通过，编者注也不能充当原文", () => {
  const source = { unitIds: ["title", "intro", "example", "empty"], emptySourceUnits: ["empty"] };
  const intro = '<p id="intro">协程可以挂起。</p>';
  const example = '<p id="example">下面用 delay() 让协程等一秒。</p>';
  const check = (body) => verifyKotlinUnits(
    '<header class="chapter-header"><h1 id="title">协程</h1></header>' +
    `<article class="translated-article">${body}<p id="empty"></p></article>`, source, "fixture",
  );
  check(intro + example);
  for (const body of [
    example,
    '<p id="intro"> <sup class="source-refs">[1]</sup></p>' + example,
    intro + intro + example,
    example + intro,
    `<aside class="learning-note">${intro}</aside>${example}`,
  ]) assert.throws(() => check(body), assert.AssertionError);
});
