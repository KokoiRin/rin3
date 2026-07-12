// 网站 Slides catalog 把可移植的 deck 投影适配为 RIN III 的栏目、URL 与资源路径。
// @rin/document 不知道 Next.js、GitHub Pages base path 或文章导航。
import {
  compileRinDeck,
  type RenderedSlideDeckData,
  type RinDocument,
  type SlideDeckData,
} from "@rin/document";
import { assetPath, getSection, type SectionSlug } from "@/lib/site/sections";
import { getAllRinDocuments } from "./catalog";

export type SlideDeckListing = {
  topic: string;
  date: string;
  order: number;
};

export type SiteSlideDeckData = SlideDeckData & {
  section: SectionSlug;
  sectionTitle: string;
  sectionHref: string;
  listing?: SlideDeckListing;
  articleHref?: string;
};

export type ListedSlideDeckData = SiteSlideDeckData & {
  listing: SlideDeckListing;
};

export type SiteRenderedSlideDeckData = RenderedSlideDeckData<SiteSlideDeckData>;

export type {
  RenderedSlideContent,
  SlideChapter,
  SlideContent,
  SlideItem,
} from "@rin/document";

// 尚未迁移为 RIN 文档的纯演示可以继续作为网站专属内容注册在这里。
export const standaloneSlideDecks: SiteSlideDeckData[] = [];

// 宿主在这个真实 seam 上补齐网站导航与 deploy-safe 资源路径。
function adaptDerivedDeck(document: RinDocument): SiteSlideDeckData {
  const deck = compileRinDeck(document);
  const section = getSection(deck.section);
  if (!section) {
    throw new Error(`${document.filePath}: unknown section "${deck.section}"`);
  }

  return {
    ...deck,
    section: section.slug,
    coverImage: assetPath(deck.coverImage),
    sectionTitle: section.title,
    sectionHref: `/${section.slug}`,
    articleHref: `/${section.slug}/${deck.slug}`,
  };
}

// 作为全部公开演示的唯一网站注册表，同时驱动静态路由。
export function getAllSlideDecks(): SiteSlideDeckData[] {
  const derived = getAllRinDocuments().map(adaptDerivedDeck);
  const slugs = new Set(standaloneSlideDecks.map((deck) => deck.slug));
  for (const deck of derived) {
    if (slugs.has(deck.slug)) {
      throw new Error(`Duplicate slide deck slug "${deck.slug}"`);
    }
    slugs.add(deck.slug);
  }
  return [...standaloneSlideDecks, ...derived];
}

export function getSlideDeck(slug: string) {
  return getAllSlideDecks().find((deck) => deck.slug === slug);
}

// 双视图 RIN 内容由文章进入分区列表；这里只返回真正独立创作的 deck。
export function getListedSlideDecks(section: SectionSlug): ListedSlideDeckData[] {
  return standaloneSlideDecks.filter(
    (deck): deck is ListedSlideDeckData => deck.section === section && deck.listing !== undefined,
  );
}
