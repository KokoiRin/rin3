import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatArticleDate, getAllArticles, getArticle } from "@/lib/articles";
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

  return (
    <main className="article-page">
      <nav className="article-nav" aria-label="Article navigation">
        <Link href={`/${section.slug}`}>
          <span aria-hidden="true">←</span>
          <span>{section.title}</span>
        </Link>
        <Link className="article-brand" href="/">RIN III</Link>
      </nav>

      <article className="article-shell">
        <header className="article-header">
          <p className="article-section-name">{section.flower}</p>
          <h1>{article.title}</h1>
          <p className="article-deck">{article.summary}</p>
          <div className="article-meta">
            <time dateTime={article.date}>{formatArticleDate(article.date)}</time>
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
          <div
            className="prose"
            dangerouslySetInnerHTML={{ __html: article.html }}
          />
        </div>
      </article>
    </main>
  );
}
