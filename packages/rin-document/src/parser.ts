// 这个模块定义 RIN 文档的中立内容模型，并负责解析与结构校验。
// 它只处理 frontmatter、显式 Slide 边界和 Markdown 结构，不生成 React 或视觉组件。
// 文章与 Slides 编译器都消费这里的同一个解析结果；模型不引用任何站点类型。
import matter from "gray-matter";
import { remark } from "remark";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import {
  projectRinContent,
  rinSlidePresentations,
  type RinContentBlock,
  type RinContentRole,
  type RinSlidePage,
  type RinSlidePresentation,
} from "./domain.ts";

// `kind` 是既有作者语法；进入领域模型后统一称为 presentation。
export const rinSlideKinds = rinSlidePresentations;
export type RinSlideKind = RinSlidePresentation;

// 兼容早期公共类型名；领域代码统一使用能够表达页面语义的 RinSlidePage。
export type RinSlideSource = RinSlidePage;

export type RinChapter = {
  id: string;
  label: string;
  title: string;
  summary: string;
};

export type RinDocumentIdentity = {
  section: string;
  slug: string;
};

export type RinDocumentSummary = RinDocumentIdentity & {
  lang: "en" | "zh-CN";
  title: string;
  summary: string;
  date: string;
  topic: string;
  tags: string[];
  order: number;
};

export type RinDocument = {
  filePath: string;
  summary: RinDocumentSummary;
  deck: {
    series: string;
    coverImage: string;
    chapters: RinChapter[];
  };
  articleMarkdown: string;
  slides: RinSlidePage[];
};

type MarkdownNode = {
  type: string;
  children?: MarkdownNode[];
};

const kindSet = new Set<string>(rinSlideKinds);

function fail(filePath: string, message: string): never {
  throw new Error(`${filePath}: ${message}`);
}

function readString(data: Record<string, unknown>, key: string, filePath: string) {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(filePath, `frontmatter field "${key}" must be a non-empty string`);
  }
  return value;
}

function readDate(data: Record<string, unknown>, filePath: string) {
  const value = data.date;
  const date = value instanceof Date
    ? value.toISOString().slice(0, 10)
    : readString(data, "date", filePath);

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)
    || new Date(`${date}T00:00:00Z`).toISOString().slice(0, 10) !== date) {
    fail(filePath, "frontmatter field \"date\" must be a valid YYYY-MM-DD date");
  }
  return date;
}

function readChapters(value: unknown, filePath: string): RinChapter[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(filePath, "frontmatter field \"slides.chapters\" must be a non-empty array");
  }

  const ids = new Set<string>();
  return value.map((chapter, index) => {
    if (!chapter || typeof chapter !== "object" || Array.isArray(chapter)) {
      fail(filePath, `slides.chapters[${index}] must be an object`);
    }
    const record = chapter as Record<string, unknown>;
    const parsed = {
      id: readString(record, "id", filePath),
      label: readString(record, "label", filePath),
      title: readString(record, "title", filePath),
      summary: readString(record, "summary", filePath),
    };
    if (ids.has(parsed.id)) {
      fail(filePath, `duplicate chapter id "${parsed.id}"`);
    }
    ids.add(parsed.id);
    return parsed;
  });
}

function containsNode(node: MarkdownNode, type: string): boolean {
  return node.type === type || Boolean(node.children?.some((child) => containsNode(child, type)));
}

function hasThreeColumnTable(node: MarkdownNode): boolean {
  if (node.type === "table" && node.children?.length) {
    return node.children.every((row) => row.children?.length === 3);
  }
  return Boolean(node.children?.some(hasThreeColumnTable));
}

function validateSlide(slide: RinSlidePage, filePath: string) {
  const markdown = projectRinContent(slide.blocks, "slides");
  const tree = remark().use(remarkGfm).use(remarkMath).parse(markdown) as MarkdownNode;
  const context = `${slide.presentation} slide at line ${slide.line}`;

  if (slide.presentation === "formula" && !containsNode(tree, "math")) {
    fail(filePath, `${context} must contain a display formula`);
  }
  if (slide.presentation === "matrix" && !hasThreeColumnTable(tree)) {
    fail(filePath, `${context} must contain a three-column table`);
  }
  if (slide.presentation === "code" && !containsNode(tree, "code")) {
    fail(filePath, `${context} must contain a fenced code block`);
  }
  if ((slide.presentation === "flow" || slide.presentation === "checklist")
    && !containsNode(tree, "list")) {
    fail(filePath, `${context} must contain a list`);
  }
  if (slide.presentation === "closing" && !containsNode(tree, "blockquote")) {
    fail(filePath, `${context} must contain a blockquote`);
  }
}

// 连续同角色内容合并为一个 block，空白只作为 Markdown 排版保留，不产生空领域对象。
function appendBlock(
  blocks: RinContentBlock[],
  role: RinContentRole,
  lines: string[],
  line: number,
) {
  const markdown = lines.join("\n").trim();
  if (markdown) {
    blocks.push({ role, markdown, line });
  }
}

function parseSlides(content: string, filePath: string, chapters: RinChapter[]) {
  const lines = content.split(/\r?\n/);
  const articleLines: string[] = [];
  const slides: RinSlidePage[] = [];
  const chapterIds = new Set(chapters.map((chapter) => chapter.id));

  for (let index = 0; index < lines.length;) {
    const line = lines[index];
    const match = /^:::slide\s+(.+)$/.exec(line);
    if (!match) {
      articleLines.push(line);
      index += 1;
      continue;
    }

    const startLine = index + 1;
    let attributes: unknown;
    try {
      attributes = JSON.parse(match[1]);
    } catch {
      fail(filePath, `invalid slide attributes at line ${startLine}`);
    }
    if (!attributes || typeof attributes !== "object" || Array.isArray(attributes)) {
      fail(filePath, `slide attributes at line ${startLine} must be a JSON object`);
    }
    const record = attributes as Record<string, unknown>;
    const kind = readString(record, "kind", filePath);
    if (!kindSet.has(kind)) {
      fail(filePath, `unknown slide kind "${kind}" at line ${startLine}`);
    }
    const chapter = readString(record, "chapter", filePath);
    if (!chapterIds.has(chapter)) {
      fail(filePath, `slide at line ${startLine} references unknown chapter "${chapter}"`);
    }
    const eyebrow = readString(record, "eyebrow", filePath);

    index += 1;
    const blocks: RinContentBlock[] = [];
    let blockRole: RinContentRole = "core";
    let blockStartLine = index + 1;
    let blockLines: string[] = [];
    let detailStartLine: number | null = null;
    let fence: { marker: string; length: number } | null = null;
    while (index < lines.length) {
      const bodyLine = lines[index];
      const fenceMatch = /^\s*(`{3,}|~{3,})/.exec(bodyLine);
      if (fenceMatch) {
        const marker = fenceMatch[1][0];
        const length = fenceMatch[1].length;
        if (!fence) {
          fence = { marker, length };
        } else if (fence.marker === marker && length >= fence.length) {
          fence = null;
        }
      }
      // detail 是 Slide 内唯一允许嵌套的语义指令；它切换内容角色，但不进入任一投影文本。
      if (!fence && bodyLine === ":::detail") {
        if (blockRole === "detail") {
          fail(filePath, `nested detail block at line ${index + 1} is not supported`);
        }
        appendBlock(blocks, blockRole, blockLines, blockStartLine);
        blockRole = "detail";
        detailStartLine = index + 1;
        blockStartLine = index + 2;
        blockLines = [];
        index += 1;
        continue;
      }
      // 同一个结束标记优先闭合当前 detail；没有 detail 时才闭合外层 Slide。
      if (!fence && bodyLine === ":::") {
        if (blockRole === "detail") {
          appendBlock(blocks, blockRole, blockLines, blockStartLine);
          blockRole = "core";
          detailStartLine = null;
          blockStartLine = index + 2;
          blockLines = [];
          index += 1;
          continue;
        }
        break;
      }
      blockLines.push(bodyLine);
      index += 1;
    }
    if (detailStartLine !== null && index === lines.length) {
      fail(filePath, `unclosed detail block at line ${detailStartLine}`);
    }
    if (index === lines.length) {
      fail(filePath, `unclosed slide directive at line ${startLine}`);
    }
    appendBlock(blocks, blockRole, blockLines, blockStartLine);

    const slide = {
      presentation: kind as RinSlidePresentation,
      chapter,
      eyebrow,
      blocks,
      line: startLine,
    };
    validateSlide(slide, filePath);
    slides.push(slide);
    articleLines.push(projectRinContent(blocks, "article"));
    articleLines.push("");
    index += 1;
  }

  return {
    slides,
    articleMarkdown: articleLines.join("\n").replace(/\n{3,}/g, "\n\n").trim(),
  };
}

export function parseRinDocument(
  source: string,
  filePath: string,
  section: string,
  slug: string,
): RinDocument {
  const parsed = matter(source);
  const data = parsed.data as Record<string, unknown>;
  if (data.format !== "rin-note") {
    fail(filePath, "frontmatter field \"format\" must be \"rin-note\"");
  }

  const lang = readString(data, "lang", filePath);
  if (lang !== "en" && lang !== "zh-CN") {
    fail(filePath, "frontmatter field \"lang\" must be \"en\" or \"zh-CN\"");
  }
  if (!Array.isArray(data.tags) || data.tags.some((tag) => typeof tag !== "string")) {
    fail(filePath, "frontmatter field \"tags\" must be an array of strings");
  }
  if (!data.slides || typeof data.slides !== "object" || Array.isArray(data.slides)) {
    fail(filePath, "frontmatter field \"slides\" must be an object");
  }
  const slideData = data.slides as Record<string, unknown>;
  const chapters = readChapters(slideData.chapters, filePath);
  const body = parseSlides(parsed.content, filePath, chapters);

  return {
    filePath,
    summary: {
      section,
      slug,
      lang,
      title: readString(data, "title", filePath),
      summary: readString(data, "summary", filePath),
      date: readDate(data, filePath),
      topic: readString(data, "topic", filePath),
      tags: data.tags as string[],
      order: typeof data.order === "number" ? data.order : 999,
    },
    deck: {
      series: readString(slideData, "series", filePath),
      coverImage: readString(slideData, "coverImage", filePath),
      chapters,
    },
    ...body,
  };
}
