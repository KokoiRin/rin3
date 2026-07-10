import Link from "next/link";
import { sections } from "./sections";

export default function Home() {
  return (
    <main className="entrance">
      <header className="brand-lockup">
        <p className="brand-kicker">A PERSONAL LEARNING ARCHIVE</p>
        <h1>RIN III</h1>
        <p className="brand-note">Three disciplines. One continuous practice.</p>
      </header>

      <nav className="gates" aria-label="Learning sections">
        {sections.map((section, index) => (
          <Link
            className={`gate gate-${section.slug}`}
            href={`/${section.slug}`}
            key={section.slug}
            aria-label={`Enter ${section.title}`}
          >
            <img
              className="gate-image"
              src={section.image}
              alt={section.alt}
            />
            <span className="gate-shade" aria-hidden="true" />
            <span className="gate-number" aria-hidden="true">
              0{index + 1}
            </span>
            <span className="gate-content">
              <span className="gate-flower">{section.flower}</span>
              <span className="gate-title">{section.title}</span>
              <span className="gate-english">{section.english}</span>
              <span className="gate-action">
                <span>ENTER</span>
                <span className="gate-arrow" aria-hidden="true">→</span>
              </span>
            </span>
          </Link>
        ))}
      </nav>

      <p className="swipe-hint" aria-hidden="true">SWIPE TO EXPLORE</p>
    </main>
  );
}
