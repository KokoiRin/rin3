import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArticleDate, getArticlePrimaryHref, getArticlesBySection } from "@/lib/articles";
import { getListedSlideDecks } from "../slides/decks";
import { getSection, sections, type SectionSlug } from "../sections";

// 统一分区列表中的 Markdown 文章和独立 deck，页面不关心它们的存储方式。
type SectionEntry = {
  id: string;
  lang: "en" | "zh-CN";
  href: string;
  topic: string;
  title: string;
  summary: string;
  date: string;
  order: number;
  isDeck: boolean;
};

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return sections.map((section) => ({ section: section.slug }));
}

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { section: slug } = await params;
  const section = getSection(slug);

  return section
    ? {
        title: `${section.title} | RIN III`,
        description: section.intro,
      }
    : {};
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section: slug } = await params;
  const section = getSection(slug);

  if (!section) {
    notFound();
  }

  const articles = getArticlesBySection(section.slug as SectionSlug);
  const decks = getListedSlideDecks(section.slug as SectionSlug);
  const entries: SectionEntry[] = [
    ...articles.map((article) => ({
      id: `article:${article.slug}`,
      lang: article.lang,
      href: getArticlePrimaryHref(article),
      topic: article.topic,
      title: article.title,
      summary: article.summary,
      date: article.date,
      order: article.order,
      isDeck: article.slides !== undefined,
    })),
    ...decks.map((deck) => ({
      id: `deck:${deck.slug}`,
      lang: deck.lang,
      href: `/slides/${deck.slug}`,
      topic: deck.listing.topic,
      title: deck.title,
      summary: deck.description,
      date: deck.listing.date,
      order: deck.listing.order,
      isDeck: true,
    })),
  ].sort((left, right) => left.order - right.order || right.date.localeCompare(left.date));

  return (
    <main className={`section-hub section-${section.slug}`}>
      <div className="section-visual">
        <img className="section-image" src={section.image} alt="" />
        <span className="section-shade" aria-hidden="true" />

        <Link className="back-link" href="/" aria-label="Return to the RIN III index">
          <span aria-hidden="true">←</span>
          <span>INDEX</span>
        </Link>

        <section className="section-intro">
          <p className="section-flower">{section.flower}</p>
          <h1>{section.title}</h1>
          <p className="section-english">{section.english}</p>
          <p className="section-lead">{section.intro}</p>
        </section>
      </div>

      <section className="article-index" aria-labelledby="article-index-title">
        <header className="article-index-header">
          <p>LEARNING NOTES</p>
          <h2 id="article-index-title">Notes</h2>
          <span>{entries.length.toString().padStart(2, "0")} NOTES</span>
        </header>

        {entries.length > 0 ? (
          <ol className="article-list">
            {entries.map((entry, index) => (
              <li key={entry.id} lang={entry.lang}>
                <Link href={entry.href}>
                  <span className="article-order">{(index + 1).toString().padStart(2, "0")}</span>
                  <span className="article-list-copy">
                    <span className="article-topic-row">
                      <span className="article-topic">{entry.topic}</span>
                      {entry.isDeck ? <span className="article-slides-flag">INTERACTIVE DECK</span> : null}
                    </span>
                    <strong>{entry.title}</strong>
                    <span className="article-summary">{entry.summary}</span>
                    <time dateTime={entry.date}>{formatArticleDate(entry.date, entry.lang)}</time>
                  </span>
                  <span className="article-list-arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ol>
        ) : (
          <p className="empty-section">NO NOTES YET.</p>
        )}
      </section>
    </main>
  );
}
