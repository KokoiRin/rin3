"use client";

// 这个组件只负责把服务端输出的惰性 Mermaid 节点升级为 SVG。
// 没有图表节点时不会加载 Mermaid，图表内容和分页仍由文档编译器拥有。
import { useEffect } from "react";

// 在当前页面挂载后渲染尚未处理的图表，并保持 Mermaid 的严格安全边界。
export default function MermaidDiagrams() {
  useEffect(() => {
    let isDisposed = false;
    let runtimePromise: Promise<(typeof import("mermaid"))["default"]> | null = null;
    let renderQueue = Promise.resolve();

    // Mermaid 只初始化一次，并且只有确实找到可见图表时才下载运行时。
    const getRuntime = () => {
      runtimePromise ??= import("mermaid").then(({ default: mermaid }) => {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "neutral",
          // Reveal 会缩放整张 SVG，但 Chromium 不会同步缩放 foreignObject 内的 HTML，
          // 因此使用原生 SVG text，避免节点文字末尾被裁掉。
          htmlLabels: false,
        });
        return mermaid;
      });
      return runtimePromise;
    };

    // Reveal 隐藏页没有可靠尺寸，只渲染普通正文或当前 present Slide 内的图表。
    const renderVisibleDiagrams = async () => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(
          "[data-mermaid-diagram]:not([data-processed]):not([data-mermaid-rendering])",
        ),
      ).filter((node) => {
        const slide = node.closest(".rin-slide");
        return slide === null || slide.classList.contains("present");
      });
      if (nodes.length === 0) {
        return;
      }

      nodes.forEach((node) => node.setAttribute("data-mermaid-rendering", ""));
      try {
        const mermaid = await getRuntime();
        if (!isDisposed) {
          await mermaid.run({ nodes, suppressErrors: false });
        }
      } finally {
        nodes.forEach((node) => node.removeAttribute("data-mermaid-rendering"));
      }
    };

    // 串行处理快速翻页触发的渲染请求，避免 Mermaid 全局配置并发执行。
    const scheduleRender = () => {
      renderQueue = renderQueue
        .then(renderVisibleDiagrams)
        .catch((error: unknown) => console.error("Failed to render Mermaid diagram", error));
    };

    const observer = new MutationObserver(scheduleRender);
    document.querySelectorAll(".rin-slide").forEach((slide) => {
      observer.observe(slide, { attributes: true, attributeFilter: ["class"] });
    });
    scheduleRender();

    return () => {
      isDisposed = true;
      observer.disconnect();
    };
  }, []);

  return null;
}
