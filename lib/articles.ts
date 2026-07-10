import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { toString } from "hast-util-to-string";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";
import { sections, type SectionSlug } from "@/app/sections";

const contentRoot = path.join(process.cwd(), "content");
const sectionSlugs = new Set<string>(sections.map((section) => section.slug));

export type ArticleSummary = {
  section: SectionSlug;
  slug: string;
  slides?: string;
  lang: "en" | "zh-CN";
  title: string;
  summary: string;
  date: string;
  topic: string;
  tags: string[];
  order: number;
};

export type ArticleHeading = {
  depth: 2 | 3;
  id: string;
  text: string;
};

export type Article = ArticleSummary & {
  headings: ArticleHeading[];
  html: string;
};

function readString(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${file}: frontmatter field "${key}" must be a non-empty string`);
  }
  return value;
}

function readArticleSource(section: SectionSlug, fileName: string) {
  const filePath = path.join(contentRoot, section, fileName);
  const source = fs.readFileSync(filePath, "utf8");
  const parsed = matter(source);
  const data = parsed.data as Record<string, unknown>;
  const dateValue = data.date;
  const date = dateValue instanceof Date
    ? dateValue.toISOString().slice(0, 10)
    : readString(data, "date", filePath);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    throw new Error(`${filePath}: frontmatter field "date" must be a valid YYYY-MM-DD date`);
  }

  const lang = readString(data, "lang", filePath);
  if (lang !== "en" && lang !== "zh-CN") {
    throw new Error(`${filePath}: frontmatter field "lang" must be "en" or "zh-CN"`);
  }

  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
    throw new Error(`${filePath}: frontmatter field "tags" must be an array of strings`);
  }
  const tags = data.tags as string[];
  const slides = data.slides;
  if (slides !== undefined
    && (typeof slides !== "string" || !slides.startsWith("/slides/") || slides.endsWith("/"))) {
    throw new Error(`${filePath}: frontmatter field "slides" must be a route like "/slides/deck-name"`);
  }

  return {
    source: parsed.content,
    draft: data.draft === true,
    summary: {
      section,
      slug: fileName.replace(/\.md$/, ""),
      slides: slides as string | undefined,
      lang,
      title: readString(data, "title", filePath),
      summary: readString(data, "summary", filePath),
      date,
      topic: readString(data, "topic", filePath),
      tags,
      order: typeof data.order === "number" ? data.order : 999,
    } satisfies ArticleSummary,
  };
}

export function getAllArticles(): ArticleSummary[] {
  if (!fs.existsSync(contentRoot)) {
    return [];
  }

  const articles: ArticleSummary[] = [];

  for (const sectionName of fs.readdirSync(contentRoot)) {
    if (!sectionSlugs.has(sectionName)) {
      continue;
    }

    const section = sectionName as SectionSlug;
    const sectionDir = path.join(contentRoot, section);
    for (const fileName of fs.readdirSync(sectionDir)) {
      if (!fileName.endsWith(".md")) {
        continue;
      }
      const article = readArticleSource(section, fileName);
      if (!article.draft) {
        articles.push(article.summary);
      }
    }
  }

  return articles.sort((left, right) =>
    left.order - right.order || right.date.localeCompare(left.date),
  );
}

export function getArticlesBySection(section: SectionSlug) {
  return getAllArticles().filter((article) => article.section === section);
}

export function getArticleNavigation(section: SectionSlug, slug: string) {
  const articles = getArticlesBySection(section);
  const index = articles.findIndex((article) => article.slug === slug);

  return {
    previous: index > 0 ? articles[index - 1] : null,
    next: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  };
}

export async function getArticle(section: string, slug: string): Promise<Article | null> {
  if (!sectionSlugs.has(section)) {
    return null;
  }

  const fileName = `${slug}.md`;
  const filePath = path.join(contentRoot, section, fileName);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const parsed = readArticleSource(section as SectionSlug, fileName);
  if (parsed.draft) {
    return null;
  }

  const headings: ArticleHeading[] = [];
  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(() => (tree: Root) => {
      visit(tree, "element", (node: Element) => {
        if ((node.tagName === "h2" || node.tagName === "h3")
          && typeof node.properties?.id === "string") {
          headings.push({
            depth: node.tagName === "h2" ? 2 : 3,
            id: node.properties.id,
            text: toString(node),
          });
        }
      });
    })
    .use(rehypeAutolinkHeadings, { behavior: "wrap" })
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      theme: "github-light",
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(parsed.source);

  return {
    ...parsed.summary,
    headings,
    html: String(result),
  };
}

export function formatArticleDate(date: string, lang: ArticleSummary["lang"] = "en") {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
