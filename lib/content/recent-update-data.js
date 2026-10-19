import fs from "node:fs";
import path from "node:path";

/**
 * 这些日期由作者维护，不使用 checkout 或构建时变化的文件 mtime。
 * @param {Record<string, unknown>} data
 * @param {string} filePath
 * @param {string} publishedDate
 * @param {string} publicRoot
 * @returns {{ updated?: string; reader?: string }}
 */
export function readUpdateMetadata(data, filePath, publishedDate, publicRoot = path.join(process.cwd(), "public")) {
  let updated;
  if (data.updated !== undefined) {
    const value = data.updated;
    updated = value instanceof Date && !Number.isNaN(value.getTime())
      ? value.toISOString().slice(0, 10)
      : value;
    if (typeof updated !== "string"
      || !/^\d{4}-\d{2}-\d{2}$/.test(updated)
      || Number.isNaN(Date.parse(`${updated}T00:00:00Z`))
      || new Date(`${updated}T00:00:00Z`).toISOString().slice(0, 10) !== updated) {
      throw new Error(`${filePath}: frontmatter field "updated" must be a valid YYYY-MM-DD date`);
    }
    if (updated < publishedDate) {
      throw new Error(`${filePath}: frontmatter field "updated" must not precede publication date`);
    }
  }

  let reader;
  if (data.reader !== undefined) {
    const value = data.reader;
    if (typeof value !== "string" || !/^\/reading\/(?:[a-z0-9]+(?:-[a-z0-9]+)*\/)+index\.html$/.test(value)) {
      throw new Error(`${filePath}: frontmatter field "reader" must be a canonical /reading/.../index.html path`);
    }
    const file = path.join(publicRoot, value.slice(1));
    let isFile = false;
    try {
      isFile = fs.statSync(file).isFile();
    } catch {
      // Missing reader targets are authoring errors, not a reason to silently link elsewhere.
    }
    if (!isFile) {
      throw new Error(`${filePath}: frontmatter field "reader" points to a missing file: ${value}`);
    }
    reader = value;
  }
  return { updated, reader };
}

/**
 * @typedef {{
 *   title: string;
 *   summary: string;
 *   date: string;
 *   section: string;
 *   href: string;
 *   updated?: string;
 *   reader?: string;
 *   draft?: boolean;
 * }} UpdateSource
 */

/**
 * @typedef {{
 *   title: string;
 *   summary: string;
 *   date: string;
 *   section: string;
 *   href: string;
 *   kind: "reader" | "article";
 * }} RecentUpdate
 */

/**
 * 一篇文章只对应一个最近更新入口；独立阅读器优先，同日用文章路径稳定排序。
 * @param {readonly UpdateSource[]} articles
 * @param {number} limit
 * @returns {RecentUpdate[]}
 */
export function buildRecentUpdates(articles, limit = 12) {
  if (!Number.isInteger(limit) || limit < 0) {
    throw new RangeError("Recent update limit must be a non-negative integer");
  }
  return articles
    .filter((article) => !article.draft)
    .sort((left, right) => {
      const leftDate = left.updated ?? left.date;
      const rightDate = right.updated ?? right.date;
      if (leftDate !== rightDate) return leftDate < rightDate ? 1 : -1;
      if (left.href === right.href) return 0;
      return left.href < right.href ? 1 : -1;
    })
    .slice(0, limit)
    .map((article) => ({
      title: article.title,
      summary: article.summary,
      date: article.updated ?? article.date,
      section: article.section,
      href: article.reader ?? article.href,
      kind: article.reader ? "reader" : "article",
    }));
}
