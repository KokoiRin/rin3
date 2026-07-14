"use client";

// 这个组件把稳定的 deck 数据映射为可播放的页面。
// Reveal 是导航与页码的唯一事实源，React 只同步站点外壳状态。
// 本模块不决定演示内容，也不负责文章与 deck 的注册关系。
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
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Reveal from "reveal.js";
import type { RevealApi } from "reveal.js";
import type { SiteRenderedSlideDeckData } from "@/lib/content/slides";
import MermaidDiagrams from "@/components/mermaid-diagrams";
import { SlideContent } from "./slide-layouts";

// 负责单份演示的导航、响应式画布、全屏状态和 Reveal 生命周期。
export default function SlideDeckView({ deck }: { deck: SiteRenderedSlideDeckData }) {
  const deckRef = useRef<RevealApi | null>(null);
  const revealRootRef = useRef<HTMLDivElement | null>(null);
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

  useEffect(() => {
    const root = revealRootRef.current;
    if (!root) {
      return;
    }

    // 播放器直接拥有 Reveal 生命周期，避免 React wrapper 未完成初始化时留下零尺寸页面。
    const reveal = new Reveal(root, deckConfig);
    let isDisposed = false;
    const syncIndex = () => setActiveIndex(reveal.getIndices().h);
    reveal.on("slidechanged", syncIndex);
    deckRef.current = reveal;

    void reveal.initialize().then(() => {
      if (isDisposed) {
        return;
      }
      syncIndex();
      // Reveal 在 ready 之后才应用首屏 hash，下一帧再次读取才能同步深链接页码。
      window.requestAnimationFrame(syncIndex);
    });

    return () => {
      isDisposed = true;
      reveal.off("slidechanged", syncIndex);
      if (deckRef.current === reveal) {
        deckRef.current = null;
      }
      reveal.destroy();
    };
  }, [deckConfig]);

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
      <MermaidDiagrams />
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
          <Link
            className="slides-section-link"
            href={deck.sectionHref}
            aria-label={`Back to ${deck.sectionTitle}`}
          >
            <ArrowLeft size={14} />
            <span>{deck.sectionTitle}</span>
          </Link>
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
          <Link
            className="slides-toolbar-section"
            href={deck.sectionHref}
            aria-label={`Back to ${deck.sectionTitle}`}
            title={`Back to ${deck.sectionTitle}`}
          >
            <ArrowLeft size={16} />
            <span>{deck.sectionTitle}</span>
          </Link>
          <Link className="slides-toolbar-home" href="/" aria-label="Return to RIN III" title="Home">
            <House size={18} />
          </Link>
          {deck.articleHref ? (
            <Link
              className="slides-toolbar-document"
              href={deck.articleHref}
              aria-label="View document"
              title="View document"
            >
              <BookOpen size={18} />
              <span>DOCUMENT</span>
            </Link>
          ) : null}
          <button
            type="button"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={handleFullscreen}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </nav>

        <div className="reveal rin-reveal" ref={revealRootRef}>
          <div className="slides">
            {deck.slides.map((slide, index) => (
              <section
                className={`rin-slide rin-slide-${slide.kind}`}
                data-chapter={slide.chapter}
                key={`${slide.chapter}-${index}`}
              >
                <SlideContent slide={slide} deck={deck} />
              </section>
            ))}
          </div>
        </div>

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
