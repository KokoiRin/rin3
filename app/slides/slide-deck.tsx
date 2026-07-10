"use client";

// 这个组件把稳定的 deck 数据映射为可播放的页面。
// Reveal 是导航与页码的唯一事实源，React 只同步站点外壳状态。
// 本模块不决定演示内容，也不负责文章与 deck 的注册关系。
import { Deck, Slide } from "@revealjs/react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  House,
  Maximize2,
  Minimize2,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RevealApi } from "reveal.js";
import type { RenderedSlideContent, RenderedSlideDeckData } from "./decks";

// 把稳定的 deck 数据映射为模板支持的视觉页面，不参与导航状态管理。
function renderSlideContent(slide: RenderedSlideContent, deck: RenderedSlideDeckData) {
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

// 负责单份演示的导航、响应式画布、全屏状态和 Reveal 生命周期。
export default function SlideDeckView({ deck }: { deck: RenderedSlideDeckData }) {
  const deckRef = useRef<RevealApi | null>(null);
  const shellRef = useRef<HTMLElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPortraitDeck, setIsPortraitDeck] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 860px) and (orientation: portrait)");

    // 手机竖屏使用独立画布比例，否则 16:9 内容会被缩到难以阅读。
    const handleViewportChange = () => setIsPortraitDeck(query.matches);
    handleViewportChange();
    query.addEventListener("change", handleViewportChange);
    return () => query.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    // 全屏状态以浏览器为权威源，确保 Esc 退出后图标和可访问名称同步。
    const handleFullscreenChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const deckConfig = useMemo(() => ({
    width: isPortraitDeck ? 900 : 1280,
    height: isPortraitDeck ? 1200 : 720,
    embedded: true,
    controls: false,
    progress: false,
    center: false,
    hash: true,
    touch: true,
    // Reveal 5 会在窄屏自动改成长页面；模板已有竖屏画布，必须保持单页导航语义。
    scrollActivationWidth: 0,
    navigationMode: "linear" as const,
    transition: "fade" as const,
    backgroundTransition: "fade" as const,
    margin: 0,
  }), [isPortraitDeck]);

  const activeChapter = deck.slides[activeIndex]?.chapter ?? deck.chapters[0].id;
  const progress = ((activeIndex + 1) / deck.slides.length) * 100;

  // Reveal 初始化后同步可能来自 URL hash 的实际页码。
  const handleReady = useCallback((reveal: RevealApi) => {
    const syncIndex = () => setActiveIndex(reveal.getIndices().h);
    syncIndex();
    // Reveal 在 ready 事件之后才应用首屏 hash；下一帧再次读取才能同步深链接页码。
    window.requestAnimationFrame(syncIndex);
  }, []);

  // 每次翻页都从 Reveal 读取索引，避免侧栏维护第二份导航事实源。
  const handleSlideChange = useCallback(() => {
    setActiveIndex(deckRef.current?.getIndices().h ?? 0);
  }, []);

  // 章节跳转定位到该章节第一张 slide，并在手机端收起目录。
  const handleChapterSelect = useCallback((chapterId: string) => {
    const targetIndex = deck.slides.findIndex((slide) => slide.chapter === chapterId);
    if (targetIndex >= 0) {
      deckRef.current?.slide(targetIndex);
      setIsMenuOpen(false);
    }
  }, [deck.slides]);

  // 请求或退出浏览器全屏，失败时保留当前播放状态。
  const handleFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else {
      await shellRef.current?.requestFullscreen();
    }
  }, []);

  return (
    <main
      className={`rin-slides-shell${isMenuOpen ? " is-menu-open" : ""}`}
      lang={deck.lang}
      ref={shellRef}
    >
      <button
        className="slides-menu-backdrop"
        type="button"
        aria-label="Close chapter menu"
        onClick={() => setIsMenuOpen(false)}
      />

      <aside className="slides-rail" aria-label="Presentation chapters">
        <header className="slides-rail-header">
          <div>
            <p>{deck.series}</p>
            <Link href="/">RIN III</Link>
          </div>
          <button
            className="slides-rail-close"
            type="button"
            aria-label="Close chapter menu"
            title="Close chapters"
            onClick={() => setIsMenuOpen(false)}
          >
            <X size={18} />
          </button>
          <p>{deck.description}</p>
        </header>

        <nav className="slides-chapters" aria-label="Chapters">
          {deck.chapters.map((chapter) => (
            <button
              className={chapter.id === activeChapter ? "is-active" : ""}
              type="button"
              key={chapter.id}
              aria-current={chapter.id === activeChapter ? "step" : undefined}
              onClick={() => handleChapterSelect(chapter.id)}
            >
              <span>{chapter.label}</span>
              <strong>{chapter.title}</strong>
              <small>{chapter.summary}</small>
            </button>
          ))}
        </nav>

        <footer className="slides-rail-footer">
          <div className="slides-progress" aria-hidden="true">
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className="slides-counter" aria-live="polite">
            <span>{(activeIndex + 1).toString().padStart(2, "0")}</span>
            <span>{deck.slides.length.toString().padStart(2, "0")}</span>
          </div>
          <p>ARROW KEYS / SWIPE / CLICK</p>
        </footer>
      </aside>

      <section className="slides-stage" aria-label={deck.title}>
        <nav className="slides-toolbar" aria-label="Presentation tools">
          <button
            className="slides-menu-trigger"
            type="button"
            aria-label="Open chapter menu"
            title="Chapters"
            onClick={() => setIsMenuOpen(true)}
          >
            <Menu size={18} />
          </button>
          <Link href="/" aria-label="Return to RIN III" title="Home">
            <House size={18} />
          </Link>
          <Link href={deck.articleHref} aria-label="Read the full article" title="Read article">
            <BookOpen size={18} />
          </Link>
          <button
            type="button"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={handleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </nav>

        <Deck
          className="rin-reveal"
          config={deckConfig}
          deckRef={deckRef}
          onReady={handleReady}
          onSlideChange={handleSlideChange}
        >
          {deck.slides.map((slide, index) => (
            <Slide
              className={`rin-slide rin-slide-${slide.kind}`}
              data-chapter={slide.chapter}
              key={`${slide.chapter}-${index}`}
            >
              {renderSlideContent(slide, deck)}
            </Slide>
          ))}
        </Deck>

        <nav className="slides-controls" aria-label="Slide navigation">
          <button
            type="button"
            aria-label="Previous slide"
            title="Previous"
            disabled={activeIndex === 0}
            onClick={() => deckRef.current?.prev()}
          >
            <ArrowLeft size={19} />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            title="Next"
            disabled={activeIndex === deck.slides.length - 1}
            onClick={() => deckRef.current?.next()}
          >
            <ArrowRight size={19} />
          </button>
        </nav>
      </section>
    </main>
  );
}
