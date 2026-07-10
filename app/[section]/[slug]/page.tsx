import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatArticleDate,
  getAllArticles,
  getArticle,
  getArticleNavigation,
} from "@/lib/articles";
import { getSection } from "../../sections";

type ArticlePageProps = {
  params: Promise<{ section: string; slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllArticles().map((article) => ({
    section: article.section,
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { section, slug } = await params;
  const article = await getArticle(section, slug);

  return article
    ? {
        title: `${article.title} | RIN III`,
        description: article.summary,
      }
    : {};
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { section: sectionSlug, slug } = await params;
  const [section, article] = await Promise.all([
    getSection(sectionSlug),
    getArticle(sectionSlug, slug),
  ]);

  if (!section || !article) {
    notFound();
  }

  const navigation = getArticleNavigation(article.section, article.slug);

  return (
    <main className="article-page">
      <nav className="article-nav" aria-label="Article navigation">
        <Link href={`/${section.slug}`}>
          <span aria-hidden="true">←</span>
          <span>{section.title}</span>
        </Link>
        <Link className="article-brand" href="/">RIN III</Link>
      </nav>

      <article className="article-shell" lang={article.lang}>
        <header className="article-header">
          <p className="article-section-name">{section.flower}</p>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.summary}</p>
          <div className="article-meta">
            <time dateTime={article.date}>{formatArticleDate(article.date, article.lang)}</time>
            <span>{article.topic}</span>
          </div>
        </header>

        <div className="article-layout">
          <aside className="article-aside" aria-label="Article tags">
            <p>TAGS</p>
            <ul>
              {article.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </aside>
          <div className="article-main">
            <div
              className="prose"
              dangerouslySetInnerHTML={{ __html: article.html }}
            />

            <nav className="article-pagination" aria-label="Adjacent articles">
              {navigation.previous ? (
                <Link href={`/${navigation.previous.section}/${navigation.previous.slug}`}>
                  <span>PREVIOUS</span>
                  <strong>{navigation.previous.title}</strong>
                </Link>
              ) : <span />}
              <Link className="article-pagination-index" href={`/${section.slug}`}>
                {`ALL ${section.english} NOTES`}
              </Link>
              {navigation.next ? (
                <Link className="article-pagination-next" href={`/${navigation.next.section}/${navigation.next.slug}`}>
                  <span>NEXT</span>
                  <strong>{navigation.next.title}</strong>
                </Link>
              ) : <span />}
            </nav>
          </div>

          {article.headings.length > 0 ? (
            <aside className="article-toc" aria-label="Table of contents">
              <p>ON THIS PAGE</p>
              <ol>
                {article.headings.map((heading) => (
                  <li className={`article-toc-depth-${heading.depth}`} key={heading.id}>
                    <a href={`#${heading.id}`}>{heading.text}</a>
                  </li>
                ))}
              </ol>
            </aside>
          ) : null}
        </div>
      </article>
    </main>
  );
}
