import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { slideDecks } from "./decks";

export const metadata: Metadata = {
  title: "Slides | RIN III",
  description: "Interactive presentations from the RIN III learning archive.",
};

// 展示所有公开演示入口，并保持它们与原始文章互相可达。
export default function SlidesIndex() {
  return (
    <main className="slides-index-page">
      <nav className="slides-index-nav" aria-label="Slides navigation">
        <Link href="/">RIN III</Link>
        <span>INTERACTIVE NOTES</span>
      </nav>

      <header className="slides-index-header">
        <p>PRESENTATIONS / 01</p>
        <h1>Slides</h1>
        <p>Ideas arranged for movement, comparison, and conversation.</p>
      </header>

      <ol className="slides-index-list">
        {slideDecks.map((deck, index) => (
          <li key={deck.slug} lang={deck.lang}>
            <div className="slides-index-visual">
              <Image
                src={deck.coverImage}
                alt=""
                fill
                priority={index === 0}
                sizes="(max-width: 760px) 100vw, 42vw"
              />
              <span aria-hidden="true" />
              <strong>{(index + 1).toString().padStart(2, "0")}</strong>
            </div>
            <div className="slides-index-copy">
              <p>{deck.series}</p>
              <h2>{deck.title}</h2>
              <p>{deck.description}</p>
              <div className="slides-index-actions">
                <Link href={`/slides/${deck.slug}`}>
                  <span>OPEN DECK</span>
                  <ArrowRight size={17} />
                </Link>
                <Link href={deck.articleHref}>
                  <BookOpen size={16} />
                  <span>READ ARTICLE</span>
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </main>
  );
}
