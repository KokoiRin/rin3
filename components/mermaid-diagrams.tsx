"use client";

// Only visible diagrams load Mermaid. Original source is retained for theme changes.
import { useEffect } from "react";

export default function MermaidDiagrams() {
  useEffect(() => {
    let isDisposed = false;
    let runtimePromise: Promise<(typeof import("mermaid"))["default"]> | null = null;
    let renderQueue = Promise.resolve();
    let initializedTheme: string | null = null;
    const sources = new WeakMap<HTMLElement, string>();

    const getRuntime = () => {
      runtimePromise ??= import("mermaid").then(({ default: mermaid }) => mermaid);
      return runtimePromise;
    };

    const renderVisibleDiagrams = async () => {
      if (isDisposed) return;
      const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      // Hidden Reveal slides have no reliable size; render them when they become present.
      const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-mermaid-diagram]"))
        .filter((node) => {
          const slide = node.closest(".rin-slide");
          return (slide === null || slide.classList.contains("present"))
            && (!node.hasAttribute("data-processed") || node.dataset.mermaidTheme !== theme);
        });
      if (nodes.length === 0) return;

      const mermaid = await getRuntime();
      if (isDisposed) return;
      if (initializedTheme !== theme) {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: theme === "dark" ? "dark" : "neutral",
          ...(theme === "dark" ? {
            themeVariables: {
              background: "#24282c",
              primaryColor: "#2d3a3d",
              primaryTextColor: "#d8dcd7",
              primaryBorderColor: "#849b9a",
              lineColor: "#aabbb5",
              secondaryColor: "#343d48",
              tertiaryColor: "#2d3530",
              mainBkg: "#2d3a3d",
              textColor: "#d8dcd7",
              nodeTextColor: "#d8dcd7",
              edgeLabelBackground: "#24282c",
              clusterBkg: "#28312f",
              clusterBorder: "#63736e",
            },
          } : {}),
          // Native SVG text avoids clipped foreignObject labels under Reveal scaling.
          htmlLabels: false,
        });
        initializedTheme = theme;
      }

      nodes.forEach((node) => {
        if (!sources.has(node)) sources.set(node, node.textContent ?? "");
        node.textContent = sources.get(node) ?? "";
        node.removeAttribute("data-processed");
        node.setAttribute("data-mermaid-rendering", "");
      });
      try {
        await mermaid.run({ nodes, suppressErrors: false });
        nodes.forEach((node) => { node.dataset.mermaidTheme = theme; });
      } finally {
        nodes.forEach((node) => node.removeAttribute("data-mermaid-rendering"));
      }
    };

    // Serialize fast theme/slide changes because Mermaid has a global configuration.
    const scheduleRender = () => {
      renderQueue = renderQueue
        .then(renderVisibleDiagrams)
        .catch((error: unknown) => console.error("Failed to render Mermaid diagram", error));
    };

    const observer = new MutationObserver(scheduleRender);
    document.querySelectorAll(".rin-slide").forEach((slide) => {
      observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
    document.addEventListener("rin-theme-change", scheduleRender);
    scheduleRender();

    return () => {
      isDisposed = true;
      observer.disconnect();
      document.removeEventListener("rin-theme-change", scheduleRender);
    };
  }, []);

  return null;
}
