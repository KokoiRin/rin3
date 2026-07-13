// 文章投影统一在构建期完成 Markdown、目录、公式与代码渲染。
// 调用方只提供 Markdown，不需要了解 remark / rehype 的组合顺序。
import { toString } from "hast-util-to-string";
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

export type ArticleHeading = {
  depth: 2 | 3;
  id: string;
  text: string;
};

export type RenderedArticleMarkdown = {
  headings: ArticleHeading[];
  html: string;
};

// 返回可直接交给文章视图的静态 HTML 和同源目录结构。
export async function renderArticleMarkdown(markdown: string): Promise<RenderedArticleMarkdown> {
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
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      theme: "github-light",
      keepBackground: false,
    })
    .use(rehypeStringify)
    .process(markdown);

  return { headings, html: String(result) };
}
