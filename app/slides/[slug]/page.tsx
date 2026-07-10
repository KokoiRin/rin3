import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SlideDeckView from "../slide-deck";
import { getSlideDeck, slideDecks } from "../decks";

// 表示静态 deck 路由从 Next.js 获得的唯一参数。
type SlidePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

// 为所有已注册 deck 生成 GitHub Pages 可直接访问的静态路由。
export function generateStaticParams() {
  return slideDecks.map((deck) => ({ slug: deck.slug }));
}

// 根据 deck 数据生成分享标题和摘要，避免播放组件承担 SEO 职责。
export async function generateMetadata({ params }: SlidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const deck = getSlideDeck(slug);

  return deck
    ? {
        title: `${deck.title} | Slides | RIN III`,
        description: deck.description,
      }
    : {};
}

// 渲染单份互动演示；未注册 slug 在构建和运行时都不会产生隐式 deck。
export default async function SlidePage({ params }: SlidePageProps) {
  const { slug } = await params;
  const deck = getSlideDeck(slug);

  if (!deck) {
    notFound();
  }

  return <SlideDeckView deck={deck} />;
}
