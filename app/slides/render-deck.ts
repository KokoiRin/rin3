// 这个模块在构建阶段准备需要专用渲染器的 slide 内容。
// 公式沿用站点的 KaTeX 管线，代码沿用文章的 Shiki 高亮管线。
// 客户端只接收静态 HTML，不承担解析、主题加载或异步高亮工作。
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";
import { remark } from "remark";
import remarkMath from "remark-math";
import remarkRehype from "remark-rehype";
import remarkGfm from "remark-gfm";
import type { RenderedSlideDeckData, SlideDeckData } from "./types";

// 把一段展示公式转成 KaTeX 静态标记，构建失败时直接暴露无效公式。
async function renderFormula(formula: string) {
  const result = await remark()
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypeStringify)
    .process(`$$\n${formula}\n$$`);

  if (result.messages.length > 0) {
    throw new Error(`Invalid slide formula: ${result.messages[0]}`);
  }

  return String(result);
}

// 把代码转成带 Shiki token 的静态标记，语言名同时参与语法校验。
async function renderCode(code: string, language: string) {
  const result = await remark()
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: "github-dark",
      keepBackground: true,
    })
    .use(rehypeStringify)
    .process(`~~~${language}\n${code}\n~~~`);

  return String(result);
}

async function renderProse(markdown: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype)
    .use(rehypeKatex)
    .use(rehypePrettyCode, {
      theme: "github-dark",
      keepBackground: true,
    })
    .use(rehypeStringify)
    .process(markdown);

  return String(result);
}

// 准备一份 deck 中的富内容页，同时保留普通布局的原始数据结构。
export async function renderSlideDeck(deck: SlideDeckData): Promise<RenderedSlideDeckData> {
  const slides = await Promise.all(deck.slides.map(async (slide) => {
    if (slide.kind === "formula") {
      return { ...slide, html: await renderFormula(slide.formula) };
    }

    if (slide.kind === "code") {
      return { ...slide, html: await renderCode(slide.code, slide.language) };
    }

    if (slide.kind === "prose") {
      return { ...slide, html: await renderProse(slide.markdown) };
    }

    return slide;
  }));

  return { ...deck, slides };
}
