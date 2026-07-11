// 这里保存仍然独立创作的 deck，并把它们与 RIN 文档派生 deck 合并成公开注册表。
// 路由和播放器只消费合并后的数据；双视图内容的正文不在这里维护副本。
// 本模块不负责导航状态、Reveal 生命周期或具体视觉交互。
import type { SectionSlug } from "../sections";
import { getAllRinDocuments } from "@/lib/articles";
import { compileRinDeck } from "./compile-rin-deck";
import type { ListedSlideDeckData, SlideDeckData } from "./types";

export type {
  ListedSlideDeckData,
  RenderedSlideContent,
  RenderedSlideDeckData,
  SlideChapter,
  SlideContent,
  SlideDeckData,
  SlideDeckListing,
  SlideItem,
} from "./types";

// 作为全部公开演示的唯一注册表，同时驱动内容入口与静态路由。
// 尚未迁移为 RIN 文档的纯演示可以继续注册在这里。
export const slideDecks: SlideDeckData[] = [];

export function getAllSlideDecks() {
  const derived = getAllRinDocuments().map(compileRinDeck);
  const slugs = new Set(slideDecks.map((deck) => deck.slug));
  for (const deck of derived) {
    if (slugs.has(deck.slug)) {
      throw new Error(`Duplicate slide deck slug "${deck.slug}"`);
    }
    slugs.add(deck.slug);
  }
  return [...slideDecks, ...derived];
}

// 按公开 slug 查找静态演示，路由层不重复维护另一份注册表。
export function getSlideDeck(slug: string) {
  return getAllSlideDecks().find((deck) => deck.slug === slug);
}

// 返回需要作为独立内容出现在指定分区列表中的 decks。
export function getListedSlideDecks(section: SectionSlug): ListedSlideDeckData[] {
  return slideDecks.filter(
    (deck): deck is ListedSlideDeckData => deck.section === section && deck.listing !== undefined,
  );
}
