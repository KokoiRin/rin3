"use client";

import { Snowflake } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { learningSections, winterSection } from "./sections";
import { advanceWinterSwipe } from "./winter-gesture";

const WINTER_HINT_DELAY_MS = 8_000;
const MOBILE_QUERY = "(max-width: 720px)";

// 首页独占展开状态，避免把计时器和触摸手势放入静态分区数据。
export function EntranceGates() {
  const [isWinterRevealed, setIsWinterRevealed] = useState(false);
  const [isSnowflakeVisible, setIsSnowflakeVisible] = useState(false);
  const gatesRef = useRef<HTMLElement>(null);
  const winterGateRef = useRef<HTMLAnchorElement>(null);
  const touchGestureRef = useRef<{ startX: number; startedAtEnd: boolean } | null>(null);
  const winterSwipeCountRef = useRef(0);

  // 桌面端延后提供入口，保持初始构图稳定。
  useEffect(() => {
    const timer = window.setTimeout(() => setIsSnowflakeVisible(true), WINTER_HINT_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  const revealWinter = useCallback(() => {
    setIsWinterRevealed(true);
    setIsSnowflakeVisible(false);
  }, []);

  // 等待第四列完成展开后再滚入视野，避免滚动目标仍处于零宽状态。
  useEffect(() => {
    if (!isWinterRevealed || !window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      winterGateRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      });
    }, prefersReducedMotion ? 0 : 650);

    return () => window.clearTimeout(timer);
  }, [isWinterRevealed]);

  // 只有到达末端后的完整手势才计数，正常浏览前三列不会误触。
  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    const gates = gatesRef.current;
    const touch = event.changedTouches[0];
    if (!gates || !touch || isWinterRevealed) {
      return;
    }

    touchGestureRef.current = {
      startX: touch.clientX,
      startedAtEnd: gates.scrollLeft + gates.clientWidth >= gates.scrollWidth - 8,
    };
  }

  function handleTouchEnd(event: React.TouchEvent<HTMLElement>) {
    const gesture = touchGestureRef.current;
    const touch = event.changedTouches[0];
    touchGestureRef.current = null;

    if (!gesture || !touch || isWinterRevealed || !window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    const nextSwipe = advanceWinterSwipe({
      count: winterSwipeCountRef.current,
      startedAtEnd: gesture.startedAtEnd,
      horizontalDistance: gesture.startX - touch.clientX,
    });
    winterSwipeCountRef.current = nextSwipe.count;

    if (nextSwipe.shouldReveal) {
      revealWinter();
    }
  }

  const entranceSections = [...learningSections, winterSection];

  return (
    <>
      <nav
        className={`gates${isWinterRevealed ? " gates-winter-revealed" : ""}`}
        id="entrance-gates"
        aria-label="Archive sections"
        ref={gatesRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {entranceSections.map((section, index) => {
          const isWinter = section.slug === winterSection.slug;

          return (
            <Link
              className={`gate gate-${section.slug}`}
              href={`/${section.slug}`}
              key={section.slug}
              aria-label={`Enter ${section.title}`}
              aria-hidden={isWinter && !isWinterRevealed ? true : undefined}
              data-winter-gate={isWinter ? (isWinterRevealed ? "revealed" : "hidden") : undefined}
              tabIndex={isWinter && !isWinterRevealed ? -1 : undefined}
              ref={isWinter ? winterGateRef : undefined}
            >
              <img className="gate-image" src={section.image} alt={section.alt} />
              <span className="gate-shade" aria-hidden="true" />
              <span className="gate-number" aria-hidden="true">0{index + 1}</span>
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
          );
        })}
      </nav>

      {isSnowflakeVisible && !isWinterRevealed ? (
        <button
          className="winter-reveal"
          type="button"
          aria-controls="entrance-gates"
          aria-label="Reveal Winter"
          title="Reveal Winter"
          onClick={revealWinter}
        >
          <Snowflake aria-hidden="true" size={18} strokeWidth={1.5} />
        </button>
      ) : null}
    </>
  );
}
