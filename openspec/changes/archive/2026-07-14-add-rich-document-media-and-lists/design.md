## Context

`@rin/document` owns portable Markdown parsing and projection, while the Next.js host owns routes and the GitHub Pages base path. Article and prose-slide renderers already share remark/rehype concepts but have separate pipelines. Raw HTML remains disabled, and generated pages are statically exported.

## Goals / Non-Goals

**Goals:**

- Let authors use standard Markdown image and list syntax plus fenced `mermaid` blocks.
- Preserve identical rich-content semantics in articles and prose slides.
- Keep root-relative image URLs portable by resolving them at the host boundary.
- Avoid shipping Mermaid on pages that contain no diagrams.

**Non-Goals:**

- Add arbitrary raw HTML, remote image downloading, image optimization, diagram editing, or Mermaid support inside specialized slide layouts such as `code`, `flow`, or `checklist`.
- Replace the existing specialized flow/checklist slide components.

## Decisions

### Transform Mermaid fences in the portable renderer

A shared rehype transform converts `<pre><code class="language-mermaid">` into inert Mermaid source nodes. Both article and prose-slide pipelines use the same transform, keeping the syntax and security boundary consistent. A site-level client component initializes Mermaid with `startOnLoad: false` and `securityLevel: strict`, scans only those nodes, and dynamically imports the library.

This is preferred over committing generated SVG or running a browser during every build. Static SVG generation would add a Chromium-backed build dependency and complicate local and GitHub Pages builds; a global script would add Mermaid cost to every route.

### Resolve image sources through an optional host callback

The render API accepts an optional `resolveImageSrc` callback. The portable package applies it to Markdown image nodes but does not know `/rin3` or any site route. The Next host passes its existing `assetPath` adapter, which prefixes root-relative public assets and leaves relative or external URLs unchanged.

### Use semantic lists and CSS markers

Authors continue to write normal `1.` and `-` Markdown lists. Scoped article and prose-slide CSS controls spacing and neutral ink-colored `::marker` presentation. Specialized `flow` and `checklist` layouts keep their current structured compilation and visual treatment.

## Risks / Trade-offs

- Mermaid rendering happens after hydration, so diagrams appear shortly after the surrounding content. → Keep the source node visible until Mermaid replaces it and dynamically import only when needed.
- Invalid Mermaid syntax is discovered in the browser rather than at static compile time. → Surface a readable fallback/error state and cover a valid diagram with browser regression tests.
- Very large images or diagrams can overflow slide height. → Apply bounded responsive styles and document that dense content should be split across slides.
- Image URL rewriting could corrupt remote URLs. → The site adapter only prefixes strings beginning with `/`; package tests cover root-relative and external sources.

## Migration Plan

Existing Markdown remains valid because the new renderer option is optional and list syntax is unchanged. Rollback consists of removing the runtime component and shared transform; Mermaid fences then fall back to ordinary highlighted code blocks.

## Open Questions

None. The requested examples map directly to ordinary ordered and unordered Markdown lists.
