// 这是 @rin/document 的唯一公共入口；消费者不依赖 package 内部文件布局。
export { parseRinDocument, rinSlideKinds } from "./parser.ts";
export { compileRinDeck } from "./slide-compiler.ts";
export { renderArticleMarkdown } from "./article-renderer.ts";
export { renderSlideDeck } from "./slide-renderer.ts";
export { projectRinContent, rinSlidePresentations } from "./domain.ts";

export type {
  RinChapter,
  RinDocument,
  RinDocumentIdentity,
  RinDocumentSummary,
  RinSlideKind,
  RinSlideSource,
} from "./parser.ts";
export type {
  RinContentBlock,
  RinContentRole,
  RinProjectionTarget,
  RinSlidePage,
  RinSlidePresentation,
} from "./domain.ts";
export type {
  RenderedSlideContent,
  RenderedSlideDeckData,
  SlideChapter,
  SlideContent,
  SlideDeckData,
  SlideItem,
} from "./types.ts";
export type { ArticleHeading, RenderedArticleMarkdown } from "./article-renderer.ts";
export type { RichContentRenderOptions } from "./rich-content.ts";
