"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { advanceTouchGesture, advanceWheelGesture } from "./edge-gesture";
import { learningSections, personalSection } from "@/lib/site/sections";

const MOBILE_QUERY = "(max-width: 720px)";

// 首页独占展开状态，避免把滚轮和触摸手势放入静态分区数据。
export function EntranceGates() {
  const [isExtraRevealed, setIsExtraRevealed] = useState(false);
  const gatesRef = useRef<HTMLElement>(null);
  const extraGateRef = useRef<HTMLAnchorElement>(null);
  const touchGestureRef = useRef<{ startX: number; startedAtEnd: boolean } | null>(null);
  const touchSwipeCountRef = useRef(0);
  const wheelGestureRef = useRef<{ count: number; lastEventAt: number | null }>({
    count: 0,
    lastEventAt: null,
  });

  const revealExtra = useCallback(() => {
    setIsExtraRevealed(true);
  }, []);

  // 等待第四列完成展开后再滚入视野，避免滚动目标仍处于零宽状态。
  useEffect(() => {
    if (!isExtraRevealed || !window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => {
      extraGateRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "start",
      });
    }, prefersReducedMotion ? 0 : 650);

    return () => window.clearTimeout(timer);
  }, [isExtraRevealed]);

  // PC 首页统一接收横向滑动，不再由鼠标当前悬停的分栏决定是否累计。
  useEffect(() => {
    if (isExtraRevealed || window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    function handleWheel(event: WheelEvent) {
      const nextWheel = advanceWheelGesture({
        ...wheelGestureRef.current,
        eventAt: event.timeStamp,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
      });
      wheelGestureRef.current = {
        count: nextWheel.count,
        lastEventAt: nextWheel.lastEventAt,
      };

      if (nextWheel.shouldReveal) {
        revealExtra();
      }
    }

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [isExtraRevealed, revealExtra]);

  // 只有到达末端后的完整手势才计数，正常浏览前三列不会误触。
  function handleTouchStart(event: React.TouchEvent<HTMLElement>) {
    const gates = gatesRef.current;
    const touch = event.changedTouches[0];
    if (!gates || !touch || isExtraRevealed) {
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

    if (!gesture || !touch || isExtraRevealed || !window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    const nextSwipe = advanceTouchGesture({
      count: touchSwipeCountRef.current,
      startedAtEnd: gesture.startedAtEnd,
      horizontalDistance: gesture.startX - touch.clientX,
    });
    touchSwipeCountRef.current = nextSwipe.count;

    if (nextSwipe.shouldReveal) {
      revealExtra();
    }
  }

  const entranceSections = [...learningSections, personalSection];

  return (
    <nav
      className={`gates${isExtraRevealed ? " gates-extra-revealed" : ""}`}
      aria-label="Archive sections"
      ref={gatesRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {entranceSections.map((section, index) => {
        const isExtra = section.slug === personalSection.slug;

        return (
          <Link
            className={`gate gate-${section.slug}${isExtra ? " gate-extra" : ""}`}
            href={`/${section.slug}`}
            key={section.slug}
            aria-label={`Enter ${section.title}`}
            aria-hidden={isExtra && !isExtraRevealed ? true : undefined}
            data-extra-gate={isExtra ? (isExtraRevealed ? "revealed" : "hidden") : undefined}
            tabIndex={isExtra && !isExtraRevealed ? -1 : undefined}
            ref={isExtra ? extraGateRef : undefined}
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
  );
}
