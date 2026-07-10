import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sections } from "../sections";

type SectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: SectionPageProps): Promise<Metadata> {
  const { section: slug } = await params;
  const section = sections.find((item) => item.slug === slug);

  return section
    ? {
        title: `${section.title} | 铃有三剑`,
        description: section.intro,
      }
    : {};
}

export default async function SectionPage({ params }: SectionPageProps) {
  const { section: slug } = await params;
  const section = sections.find((item) => item.slug === slug);

  if (!section) {
    notFound();
  }

  return (
    <main className={`section-page section-${section.slug}`}>
      <img className="section-image" src={section.image} alt="" />
      <span className="section-shade" aria-hidden="true" />

      <Link className="back-link" href="/" aria-label="返回铃有三剑进入页">
        <span aria-hidden="true">←</span>
        <span>三境</span>
      </Link>

      <section className="section-intro">
        <p className="section-flower">{section.flower}</p>
        <h1>{section.title}</h1>
        <p className="section-english">{section.english}</p>
        <p className="section-lead">{section.intro}</p>
        <ul className="topic-list" aria-label={`${section.title}学习主题`}>
          {section.topics.map((topic) => <li key={topic}>{topic}</li>)}
        </ul>
      </section>

      <p className="section-mark">铃有三剑 · 学习札记</p>
    </main>
  );
}
