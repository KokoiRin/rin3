import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import matter from "gray-matter";
import { parseRinDocument } from "@rin/document";
import { validateCourseReaders } from "../scripts/check-course-readers.mjs";

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
test("[COURSE-READER-001] 两套课程页面共享样式并保持完整导航", async () => {
  assert.deepEqual(await validateCourseReaders(), []);
});
