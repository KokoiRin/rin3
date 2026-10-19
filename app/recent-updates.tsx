"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, X } from "lucide-react";
import { useRef, useState, type MouseEvent, type KeyboardEvent } from "react";
import type { RecentUpdate } from "@/lib/content/recent-updates";
import { assetPath } from "@/lib/site/sections";
import "./recent-updates.css";

const sectionNames: Record<string, string> = {
  mathematics: "数学",
  "computer-science": "计算机科学",
  "software-engineering": "软件工程",
  me: "个人札记",
};

export function RecentUpdates({ entries }: { entries: RecentUpdate[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  function openDialog() {
    dialogRef.current?.showModal();
    setIsOpen(true);
  }

  function closeDialog() {
    dialogRef.current?.close();
  }

  function closeOnBackdrop(event: MouseEvent<HTMLDialogElement>) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      closeDialog();
    }
  }

  function keepFocusInDialog(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== "Tab") return;
    const controls = event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <>
      <button
        className="recent-trigger"
        lang="zh-CN"
        type="button"
        aria-label="最近更新"
        aria-haspopup="dialog"
        aria-controls="recent-updates"
        aria-expanded={isOpen}
        onClick={openDialog}
      >
        <Clock3 size={16} strokeWidth={1.5} aria-hidden="true" />
        <span>最近更新</span>
        {entries[0] && <span className="recent-trigger-date" aria-hidden="true">{entries[0].date.slice(5).replace("-", ".")}</span>}
      </button>

      <dialog
        ref={dialogRef}
        id="recent-updates"
        className="recent-dialog"
        lang="zh-CN"
        aria-labelledby="recent-title"
        aria-describedby="recent-description"
        onClose={() => setIsOpen(false)}
        onClick={closeOnBackdrop}
        onKeyDown={keepFocusInDialog}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="recent-colors" aria-hidden="true"><i /><i /><i /></div>
        <header className="recent-header">
          <p className="recent-eyebrow" lang="en">THE READING JOURNAL</p>
          <h2 id="recent-title">最近更新<span aria-hidden="true">.</span></h2>
          <p id="recent-description">新整理的文章与阅读材料，从这里接着读。</p>
          <button type="button" className="recent-close" aria-label="关闭最近更新" onClick={closeDialog}>
            <X size={20} strokeWidth={1.4} aria-hidden="true" />
          </button>
        </header>

        <div className="recent-scroll">
          {entries.length ? (
            <ol className="recent-list">
              {entries.map((entry) => {
                const content = (
                  <>
                    <time className="recent-date" dateTime={entry.date}>
                      <span>{entry.date.slice(5).replace("-", ".")}</span>
                      <span>{entry.date.slice(0, 4)}</span>
                    </time>
                    <div className="recent-copy">
                      <div className="recent-meta">
                        <span className={`recent-section recent-section-${entry.section}`}>{sectionNames[entry.section]}</span>
                        <span className="recent-kind">{entry.kind === "reader" ? "阅读材料" : "文章"}</span>
                      </div>
                      <h3>{entry.title}</h3>
                      <p>{entry.summary}</p>
                    </div>
                    <span className="recent-arrow" aria-hidden="true"><ArrowUpRight size={20} strokeWidth={1.4} /></span>
                  </>
                );
                return (
                  <li key={entry.href}>
                    {entry.kind === "reader" ? (
                      <a className="recent-link" href={assetPath(entry.href)}>{content}</a>
                    ) : (
                      <Link className="recent-link" href={entry.href} onClick={closeDialog}>{content}</Link>
                    )}
                  </li>
                );
              })}
            </ol>
          ) : <p className="recent-empty">新的内容正在整理中。</p>}
        </div>

        <footer className="recent-footer">
          <span>按更新日期排列{entries.length > 0 ? ` · 最近 ${entries.length} 项` : ""}</span>
          <span className="recent-signature" aria-hidden="true">RIN III</span>
        </footer>
      </dialog>
    </>
  );
}
