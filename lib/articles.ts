import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import { sections, type SectionSlug } from "@/app/sections";

const contentRoot = path.join(process.cwd(), "content");
const sectionSlugs = new Set<string>(sections.map((section) => section.slug));

export type ArticleSummary = {
  section: SectionSlug;
  slug: string;
  title: string;
  summary: string;
  date: string;
  topic: string;
  tags: string[];
  order: number;
};

export type Article = ArticleSummary & {
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
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((tag): tag is string => typeof tag === "string")
    : [];

  return {
    source: parsed.content,
    draft: data.draft === true,
    summary: {
      section,
      slug: fileName.replace(/\.md$/, ""),
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

  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeSlug)
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
    html: String(result),
  };
}

export function formatArticleDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
