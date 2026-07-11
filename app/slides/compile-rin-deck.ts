// 这个模块把中立的 RinDocument 映射成现有播放器使用的 SlideDeckData。
// 它在构建期解释每种 Markdown 约定并补齐封面，不读取或保存第二份正文。
// 路由、播放状态与文章 HTML 渲染不属于这里的职责。
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import type { RinDocument, RinSlideSource } from "@/lib/rin-documents";
import { assetPath, getSection } from "../sections";
import type { SlideContent, SlideDeckData, SlideItem } from "./types";

type MarkdownNode = {
  type: string;
  value?: string;
  lang?: string | null;
  ordered?: boolean | null;
  children?: MarkdownNode[];
};

function fail(document: RinDocument, slide: RinSlideSource, message: string): never {
  throw new Error(`${document.filePath}: ${slide.kind} slide at line ${slide.line} ${message}`);
}

function text(node: MarkdownNode): string {
  if (typeof node.value === "string") {
    return node.value;
  }
  return node.children?.map(text).join("").trim() ?? "";
}

function root(slide: RinSlideSource) {
  return remark().use(remarkGfm).use(remarkMath).parse(slide.markdown) as MarkdownNode;
}

function titleOf(document: RinDocument, slide: RinSlideSource, tree: MarkdownNode) {
  const heading = tree.children?.find((node) => node.type === "heading");
  const title = heading ? text(heading) : "";
  if (!title) {
    fail(document, slide, "must start with a heading");
  }
  return title;
}

function introOf(tree: MarkdownNode) {
  return text(tree.children?.find((node) => node.type === "paragraph") ?? { type: "paragraph" });
}

function headingItems(tree: MarkdownNode): SlideItem[] {
  const nodes = tree.children ?? [];
  const items: SlideItem[] = [];
  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    if (node.type !== "heading") {
      continue;
    }
    const match = /^(.+?)\s+[—–-]\s+(.+)$/.exec(text(node));
    if (!match) {
      continue;
    }
    const body: string[] = [];
    for (let cursor = index + 1; cursor < nodes.length && nodes[cursor].type !== "heading"; cursor += 1) {
      const value = text(nodes[cursor]);
      if (value) body.push(value);
    }
    items.push({ label: match[1].trim(), title: match[2].trim(), body: body.join(" ") });
  }
  return items;
}

function orderedList(tree: MarkdownNode) {
  return tree.children?.find((node) => node.type === "list" && node.ordered);
}

function flowItems(tree: MarkdownNode): SlideItem[] {
  return orderedList(tree)?.children?.map((item, index) => {
    const value = text(item);
    const match = /^(.+?)\s+[—–-]\s+(.+)$/.exec(value);
    return {
      label: (index + 1).toString().padStart(2, "0"),
      title: match?.[1].trim() ?? value,
      body: match?.[2].trim() ?? "",
    };
  }) ?? [];
}

function matrixOf(document: RinDocument, slide: RinSlideSource, tree: MarkdownNode) {
  const table = tree.children?.find((node) => node.type === "table");
  const rows = table?.children?.map((row) => row.children?.map(text) ?? []) ?? [];
  if (rows.length < 2 || rows.some((row) => row.length !== 3)) {
    fail(document, slide, "must contain a three-column table with data rows");
  }
  return {
    columns: rows[0] as [string, string, string],
    rows: rows.slice(1) as Array<[string, string, string]>,
  };
}

function proseWithoutTitle(slide: RinSlideSource) {
  return slide.markdown.replace(/^##\s+.+(?:\r?\n)+/, "").trim();
}

function compileSlide(document: RinDocument, slide: RinSlideSource): SlideContent {
  const tree = root(slide);
  const title = titleOf(document, slide, tree);
  const base = { chapter: slide.chapter, eyebrow: slide.eyebrow, title };
  const intro = introOf(tree);

  switch (slide.kind) {
    case "prose":
      return { ...base, kind: "prose", markdown: proseWithoutTitle(slide) };
    case "cards": {
      const items = headingItems(tree);
      if (items.length < 2) fail(document, slide, "must contain at least two labelled sections");
      return { ...base, kind: "cards", intro, items };
    }
    case "contract": {
      const items = headingItems(tree);
      if (items.length < 2) fail(document, slide, "must contain at least two labelled sections");
      return { ...base, kind: "contract", intro, items };
    }
    case "matrix": {
      const matrix = matrixOf(document, slide, tree);
      return { ...base, kind: "matrix", intro, ...matrix };
    }
    case "flow": {
      const items = flowItems(tree);
      if (items.length < 2) fail(document, slide, "must contain an ordered list");
      return { ...base, kind: "flow", intro, items };
    }
    case "checklist": {
      const items = orderedList(tree)?.children?.map(text) ?? [];
      if (items.length < 2) fail(document, slide, "must contain an ordered list");
      return { ...base, kind: "checklist", intro, items };
    }
    case "formula": {
      const formula = tree.children?.find((node) => node.type === "math")?.value;
      if (!formula) fail(document, slide, "must contain a display formula");
      return { ...base, kind: "formula", intro, formula, items: headingItems(tree) };
    }
    case "code": {
      const code = tree.children?.find((node) => node.type === "code");
      if (!code?.value) fail(document, slide, "must contain a fenced code block");
      const quote = tree.children?.find((node) => node.type === "blockquote");
      return {
        ...base,
        kind: "code",
        intro,
        language: code.lang || "text",
        code: code.value,
        caption: quote ? text(quote) : undefined,
      };
    }
    case "closing": {
      const quote = tree.children?.find((node) => node.type === "blockquote");
      if (!quote) fail(document, slide, "must contain a blockquote");
      const note = [...(tree.children ?? [])].reverse().find((node) => node.type === "paragraph");
      return { ...base, kind: "closing", statement: text(quote), note: note ? text(note) : "" };
    }
  }
}

export function compileRinDeck(document: RinDocument): SlideDeckData {
  const section = getSection(document.summary.section);
  if (!section) {
    throw new Error(`${document.filePath}: unknown section "${document.summary.section}"`);
  }
  const firstChapter = document.deck.chapters[0];

  return {
    slug: document.summary.slug,
    lang: document.summary.lang,
    series: document.deck.series,
    title: document.summary.title,
    description: document.summary.summary,
    date: document.summary.date.replaceAll("-", " / "),
    coverImage: assetPath(document.deck.coverImage),
    section: document.summary.section,
    sectionTitle: section.title,
    sectionHref: `/${section.slug}`,
    articleHref: `/${section.slug}/${document.summary.slug}`,
    chapters: document.deck.chapters,
    slides: [
      {
        kind: "cover",
        chapter: firstChapter.id,
        eyebrow: document.deck.series,
        title: document.summary.title,
        summary: document.summary.summary,
        tags: document.summary.tags,
      },
      ...document.slides.map((slide) => compileSlide(document, slide)),
    ],
  };
}
