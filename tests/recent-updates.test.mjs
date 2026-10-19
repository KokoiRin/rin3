import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { buildRecentUpdates, readUpdateMetadata } from "../lib/content/recent-update-data.js";

function article(slug, options = {}) {
  return {
    title: slug,
    summary: `${slug} summary`,
    date: "2026-10-17",
    section: "computer-science",
    href: `/computer-science/${slug}`,
    ...options,
  };
}

// 最近修改的旧文应排在新发表但之后没有更新的文章前，栏目 order 不参与这里的排序。
test("[RECENT-UPDATES-001] 按显式更新日排序并在缺少更新日时保留首发日期", () => {
  const input = [
    article("new", { date: "2026-10-18", order: 1 }),
    article("old", { date: "2026-07-12", updated: "2026-10-19", order: 99 }),
    article("draft", { date: "2026-10-20", draft: true }),
  ];
  const result = buildRecentUpdates(input);
  assert.deepEqual(result.map(({ title, date }) => ({ title, date })), [
    { title: "old", date: "2026-10-19" },
    { title: "new", date: "2026-10-18" },
  ]);
  assert.equal(result[0].kind, "article");
  assert.deepEqual(input.map(({ title }) => title), ["new", "old", "draft"], "input order must remain unchanged");
});

// 同日更新不随文件扫描顺序改变，读者从较后的系列部分开始往前找。
test("[RECENT-UPDATES-001] 同日按原文章路径降序稳定排序并限制结果数量", () => {
  const input = [article("section-2"), article("section-4"), article("section-3")];
  assert.deepEqual(buildRecentUpdates(input, 2).map(({ title }) => title), ["section-4", "section-3"]);
  assert.deepEqual(buildRecentUpdates([...input].reverse(), 2), buildRecentUpdates(input, 2));
  assert.deepEqual(buildRecentUpdates(input, 0), []);
  assert.throws(() => buildRecentUpdates(input, -1), /non-negative integer/);
});

// 更新列表直接到中文阅读器，普通文章仍使用文章入口，各自只出现一次。
test("[RECENT-UPDATES-001] 独立阅读器优先而普通文章保留文章路由", () => {
  const result = buildRecentUpdates([
    article("reader", { reader: "/reading/course/chapter-1/index.html" }),
    article("article"),
  ]);
  assert.equal(result.length, 2);
  assert.deepEqual(result.map(({ href, kind }) => ({ href, kind })), [
    { href: "/reading/course/chapter-1/index.html", kind: "reader" },
    { href: "/computer-science/article", kind: "article" },
  ]);
});

// 非法日期和早于首发的更新日会在构建前指出具体来源；不推测缺失的日期。
test("[RECENT-UPDATES-002] 更新日期必须有效且不能早于首发日期", () => {
  assert.deepEqual(readUpdateMetadata({}, "/notes/example.md", "2026-07-12"), { updated: undefined, reader: undefined });
  assert.equal(readUpdateMetadata({ updated: new Date("2026-10-19T00:00:00Z") }, "/notes/example.md", "2026-07-12").updated, "2026-10-19");
  for (const updated of ["2026-02-30", "2026-13-01", "2026-1-01", "", 123, new Date("invalid")]) {
    assert.throws(() => readUpdateMetadata({ updated }, "/notes/example.md", "2026-01-01"), /example\.md:.*updated.*valid YYYY-MM-DD/);
  }
  assert.throws(() => readUpdateMetadata({ updated: "2026-07-11" }, "/notes/example.md", "2026-07-12"), /updated.*must not precede/);
});

// 只接受公开目录里现存的中文 canonical 页，拒绝外链、对照版、查询参数和目录穿越。
test("[RECENT-UPDATES-002] 阅读器路由必须是存在的站内 index.html", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rin-reader-metadata-"));
  try {
    const chapter = path.join(root, "reading/course/chapter-1");
    await mkdir(chapter, { recursive: true });
    await writeFile(path.join(chapter, "index.html"), "<!doctype html><html lang=\"zh-CN\"><h1>Chapter</h1></html>");
    const reader = "/reading/course/chapter-1/index.html";
    assert.equal(readUpdateMetadata({ reader }, "/notes/example.md", "2026-07-12", root).reader, reader);
    for (const value of [
      "https://example.com/reading/course/index.html", "//example.com/index.html",
      "/reading/../index.html", "/reading/%2e%2e/index.html", "/reading/course//index.html",
      "/reading/course/english.html", "/reading/course/literal.html",
      `${reader}?edition=zh`, `${reader}#part`, "reading/course/index.html", 123,
    ]) {
      assert.throws(() => readUpdateMetadata({ reader: value }, "/notes/example.md", "2026-07-12", root), /reader.*canonical/);
    }
    assert.throws(() => readUpdateMetadata({ reader: "/reading/missing/index.html" }, "/notes/example.md", "2026-07-12", root), /reader.*missing file/);
    await mkdir(path.join(chapter, "nested/index.html"), { recursive: true });
    assert.throws(() => readUpdateMetadata({ reader: "/reading/course/chapter-1/nested/index.html" }, "/notes/example.md", "2026-07-12", root), /reader.*missing file/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

// 直接走真实 catalog，验证普通 Markdown 与 RIN 双视图读取相同宿主字段，并过滤草稿。
test("[RECENT-UPDATES-003] 真实目录同时支持普通文章与双视图的更新日期和阅读器", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "rin-updates-catalog-"));
  const originalCwd = process.cwd();
  const source = (title, date, extra = "") => `---\nlang: zh-CN\ntitle: ${title}\nsummary: Fixture summary\ndate: ${date}\ntopic: Test\ntags: [TEST]\n${extra}---\n\nFixture body.\n`;
  try {
    await mkdir(path.join(root, "content/computer-science"), { recursive: true });
    await mkdir(path.join(root, "public/reading/fixture/plain"), { recursive: true });
    await mkdir(path.join(root, "public/reading/fixture/dual"), { recursive: true });
    await writeFile(path.join(root, "public/reading/fixture/plain/index.html"), "<html lang=\"zh-CN\"></html>");
    await writeFile(path.join(root, "public/reading/fixture/dual/index.html"), "<html lang=\"zh-CN\"></html>");
    await writeFile(path.join(root, "content/computer-science/plain.md"), source("Plain", "2026-07-12", "updated: 2026-10-19\nreader: /reading/fixture/plain/index.html\n"));
    const dual = `---\nformat: rin-note\nlang: zh-CN\ntitle: Dual\nsummary: Fixture summary\ndate: 2026-07-12\nupdated: 2026-10-20\nreader: /reading/fixture/dual/index.html\ntopic: Test\ntags: [TEST]\nslides:\n  series: Fixture\n  coverImage: /fixture.png\n  chapters:\n    - id: start\n      label: "01"\n      title: Start\n      summary: Fixture\n---\n\n:::slide {"kind":"prose","chapter":"start","eyebrow":"FIXTURE"}\n## Fixture heading\n\nFixture content.\n:::\n`;
    await writeFile(path.join(root, "content/computer-science/dual.md"), dual);
    await writeFile(path.join(root, "content/computer-science/draft.md"), source("Draft", "2026-10-21", "draft: true\n"));
    process.chdir(root);
    const { getRecentUpdates } = await import("../lib/content/recent-updates.ts");
    const entries = getRecentUpdates();
    assert.deepEqual(entries.map(({ title, date, href, kind }) => ({ title, date, href, kind })), [
      { title: "Dual", date: "2026-10-20", href: "/reading/fixture/dual/index.html", kind: "reader" },
      { title: "Plain", date: "2026-10-19", href: "/reading/fixture/plain/index.html", kind: "reader" },
    ]);
    assert.equal(getRecentUpdates(1).length, 1);
  } finally {
    process.chdir(originalCwd);
    await rm(root, { recursive: true, force: true });
  }
});
