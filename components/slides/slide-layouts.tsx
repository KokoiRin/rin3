// 这个模块只把构建期生成的稳定 deck 数据映射为视觉页面。
// 它不读取浏览器状态，不拥有 Reveal，也不参与导航。
// 所有布局共享同一视觉词汇，只有出现独立行为时才继续拆分。
import Image from "next/image";
import type {
  RenderedSlideContent,
  SiteRenderedSlideDeckData,
} from "@/lib/content/slides";

export function SlideContent({
  slide,
  deck,
}: {
  slide: RenderedSlideContent;
  deck: SiteRenderedSlideDeckData;
}) {
  switch (slide.kind) {
    case "cover":
      return (
        <div className="slide-cover-layout">
          <Image
            className="slide-cover-image"
            src={deck.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
          />
          <span className="slide-cover-shade" aria-hidden="true" />
          <div className="slide-cover-copy">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p className="slide-cover-summary">{slide.summary}</p>
            <ul className="slide-tags" aria-label="Presentation topics">
              {slide.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          </div>
          <p className="slide-cover-date">{deck.date}</p>
        </div>
      );

    case "cards":
      return (
        <div className="slide-standard-layout">
          <header className="slide-heading">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <div className="slide-card-grid">
            {slide.items.map((item) => (
              <article className="slide-card" key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      );

    case "prose":
      return (
        <div className="slide-standard-layout slide-prose-layout">
          <header className="slide-heading slide-heading-compact">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
          </header>
          <div
            className="slide-prose-content"
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
        </div>
      );

    case "matrix":
      return (
        <div className="slide-standard-layout">
          <header className="slide-heading slide-heading-compact">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <table className="slide-matrix">
            <thead>
              <tr>
                {slide.columns.map((column) => <th key={column}>{column}</th>)}
              </tr>
            </thead>
            <tbody>
              {slide.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell) => <td key={cell}>{cell}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "flow":
      return (
        <div className="slide-standard-layout">
          <header className="slide-heading">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <ol className="slide-flow">
            {slide.items.map((item) => (
              <li key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </li>
            ))}
          </ol>
        </div>
      );

    case "contract":
      return (
        <div className="slide-standard-layout">
          <header className="slide-heading slide-heading-compact">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <div className="slide-contract-grid">
            {slide.items.map((item) => (
              <article key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      );

    case "checklist":
      return (
        <div className="slide-standard-layout slide-checklist-layout">
          <header className="slide-heading">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <ol className="slide-checklist">
            {slide.items.map((item, index) => (
              <li key={item}>
                <span>{(index + 1).toString().padStart(2, "0")}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
        </div>
      );

    case "formula":
      return (
        <div className="slide-standard-layout slide-formula-layout">
          <header className="slide-heading slide-heading-compact">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <div
            className="slide-formula-render"
            dangerouslySetInnerHTML={{ __html: slide.html }}
          />
          <div className="slide-formula-legend">
            {slide.items.map((item) => (
              <article key={item.title}>
                <span>{item.label}</span>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      );

    case "code":
      return (
        <div className="slide-standard-layout slide-code-layout">
          <header className="slide-heading slide-heading-compact">
            <p className="slide-eyebrow">{slide.eyebrow}</p>
            <h2>{slide.title}</h2>
            <p>{slide.intro}</p>
          </header>
          <div className="slide-code-panel">
            <div className="slide-code-bar">
              <span>{slide.language.toUpperCase()}</span>
              <span>RIN III / SOURCE</span>
            </div>
            <div dangerouslySetInnerHTML={{ __html: slide.html }} />
          </div>
          {slide.caption ? <p className="slide-code-caption">{slide.caption}</p> : null}
        </div>
      );

    case "closing":
      return (
        <div className="slide-closing-layout">
          <p className="slide-eyebrow">{slide.eyebrow}</p>
          <h2>{slide.title}</h2>
          <blockquote>{slide.statement}</blockquote>
          <p className="slide-closing-note">{slide.note}</p>
          <span className="slide-closing-mark" aria-hidden="true">III</span>
        </div>
      );
  }
}
