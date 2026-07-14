// 这个模块保存文章与 prose Slides 共享的富内容 HTML 约定。
// 它只识别中立 Markdown 结构，不负责站点路由、浏览器渲染或视觉样式。
import { visit } from "unist-util-visit";
import type { Element, Root } from "hast";

// 宿主可在不泄漏部署细节的前提下适配 Markdown 中的资源地址。
export type RichContentRenderOptions = {
  resolveImageSrc?: (src: string) => string;
};

// 把 Mermaid 围栏转换成浏览器运行时可识别的惰性图表节点，避免进入代码高亮管线。
export function rehypeRinRichContent(options: RichContentRenderOptions = {}) {
  return (tree: Root) => {
    visit(tree, "element", (node: Element) => {
      if (node.tagName === "img" && typeof node.properties.src === "string") {
        node.properties.src = options.resolveImageSrc?.(node.properties.src) ?? node.properties.src;
        return;
      }

      if (node.tagName === "ol" || node.tagName === "ul") {
        const existing = Array.isArray(node.properties.className)
          ? node.properties.className.map(String)
          : [];
        node.properties.className = [
          ...existing,
          "rin-list",
          node.tagName === "ol" ? "rin-list-ordered" : "rin-list-unordered",
        ];
        return;
      }

      if (node.tagName !== "pre" || node.children.length !== 1) {
        return;
      }

      const code = node.children[0];
      if (code.type !== "element" || code.tagName !== "code") {
        return;
      }

      const classNames = Array.isArray(code.properties.className)
        ? code.properties.className.map(String)
        : [];
      if (!classNames.includes("language-mermaid")) {
        return;
      }

      node.properties = {
        className: ["mermaid"],
        dataMermaidDiagram: "",
      };
      node.children = code.children;
    });
  };
}
