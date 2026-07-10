import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArticleDate, getArticlesBySection } from "@/lib/articles";
import { getSection, sections, type SectionSlug } from "../sections";

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
          <span>{articles.length.toString().padStart(2, "0")} NOTES</span>
        </header>

        {articles.length > 0 ? (
          <ol className="article-list">
            {articles.map((article, index) => (
              <li key={article.slug} lang={article.lang}>
                <Link href={`/${section.slug}/${article.slug}`}>
                  <span className="article-order">{(index + 1).toString().padStart(2, "0")}</span>
                  <span className="article-list-copy">
                    <span className="article-topic-row">
                      <span className="article-topic">{article.topic}</span>
                      {article.slides ? <span className="article-slides-flag">SLIDES AVAILABLE</span> : null}
                    </span>
                    <strong>{article.title}</strong>
                    <span className="article-summary">{article.summary}</span>
                    <time dateTime={article.date}>{formatArticleDate(article.date, article.lang)}</time>
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
