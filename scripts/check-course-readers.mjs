import { access, readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
const readingRoot = path.join(repositoryRoot, "public/reading");
const learningCourseSlugs = ["kotlin-tour", "android-native-bridge"];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listHtmlFiles(root) {
  const files = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const entryPath = path.join(root, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listHtmlFiles(entryPath));
    } else if (entry.name === "index.html") {
      files.push(entryPath);
    }
  }
  return files.sort();
}

function attributes(tag) {
  return new Map([...tag.matchAll(/([a-zA-Z:-]+)="([^"]*)"/g)].map((match) => [match[1], match[2]]));
}

function tags(html, name) {
  return [...html.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((match) => match[0]);
}

async function resolveReadingLink(fromFile, href) {
  const cleanHref = href.split("#", 1)[0].split("?", 1)[0];
  if (!cleanHref || /^(?:https?:|mailto:|tel:)/.test(cleanHref)) return null;

  let target = path.resolve(path.dirname(fromFile), cleanHref);
  if (!target.startsWith(`${readingRoot}${path.sep}`)) return null;
  if (await exists(target) && (await stat(target)).isDirectory()) {
    target = path.join(target, "index.html");
  }
  return target;
}

function visibleHtmlSource(html) {
  return html
    .replace(/<pre\b[^>]*>[\s\S]*?<\/pre>/gi, "")
    .replace(/<code\b[^>]*>[\s\S]*?<\/code>/gi, "")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
}

export async function validateCourseReaders(courseSlugs = learningCourseSlugs) {
  const errors = [];

  for (const courseSlug of courseSlugs) {
    const courseRoot = path.join(readingRoot, courseSlug);
    const courseIndex = path.join(courseRoot, "index.html");
    const readerCss = path.join(courseRoot, "reader.css");
    const htmlFiles = await listHtmlFiles(courseRoot);
    const chapterFiles = htmlFiles.filter((file) => file !== courseIndex);

    if (!await exists(readerCss)) errors.push(`${courseSlug}: missing reader.css`);
    if (!await exists(courseIndex)) errors.push(`${courseSlug}: missing course index.html`);

    for (const filePath of htmlFiles) {
      const relativePath = path.relative(repositoryRoot, filePath);
      const html = await readFile(filePath, "utf8");

      if (/<style\b/i.test(html)) errors.push(`${relativePath}: inline <style> is not allowed`);
      if (!/class="[^"]*\bsite-nav\b/.test(html)) errors.push(`${relativePath}: missing site-nav`);

      const stylesheetLinks = tags(html, "link")
        .map(attributes)
        .filter((tag) => tag.get("rel") === "stylesheet")
        .map((tag) => tag.get("href"))
        .filter(Boolean);
      const resolvedStylesheets = stylesheetLinks.map((href) => path.resolve(path.dirname(filePath), href));
      if (!resolvedStylesheets.includes(readerCss)) {
        errors.push(`${relativePath}: must reference the course reader.css`);
      }

      if (filePath !== courseIndex) {
        const switcherCount = (html.match(/class="[^"]*\bchapter-switcher\b/g) ?? []).length;
        if (switcherCount !== 2) {
          errors.push(`${relativePath}: expected top and bottom chapter-switcher, found ${switcherCount}`);
        }
      }

      const markdownCodeSpans = visibleHtmlSource(html).match(/`[^`\n]+`/g) ?? [];
      if (markdownCodeSpans.length > 0) {
        errors.push(`${relativePath}: contains ${markdownCodeSpans.length} Markdown code span(s) outside <code>`);
      }

      for (const anchor of tags(html, "a").map(attributes)) {
        const href = anchor.get("href");
        if (!href) continue;
        const target = await resolveReadingLink(filePath, href);
        if (target && !await exists(target)) errors.push(`${relativePath}: broken reading link ${href}`);
      }
    }

    const courseHtml = await readFile(courseIndex, "utf8");
    const listedChapters = new Set();
    for (const anchor of tags(courseHtml, "a").map(attributes)) {
      if (!(anchor.get("class") ?? "").split(/\s+/).includes("chapter-card")) continue;
      const target = await resolveReadingLink(courseIndex, anchor.get("href") ?? "");
      if (target) listedChapters.add(target);
    }
    for (const chapterFile of chapterFiles) {
      if (!listedChapters.has(chapterFile)) {
        errors.push(`${courseSlug}: course index does not list ${path.relative(courseRoot, chapterFile)}`);
      }
    }
    for (const listedChapter of listedChapters) {
      if (!chapterFiles.includes(listedChapter)) {
        errors.push(`${courseSlug}: course index lists unknown chapter ${path.relative(courseRoot, listedChapter)}`);
      }
    }
  }

  return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const errors = await validateCourseReaders();
  if (errors.length > 0) {
    process.stderr.write(`Course reader contract failed:\n- ${errors.join("\n- ")}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Course readers OK: ${learningCourseSlugs.join(", ")}\n`);
  }
}
