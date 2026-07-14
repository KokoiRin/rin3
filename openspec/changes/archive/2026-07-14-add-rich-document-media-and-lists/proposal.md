## Why

RIN documents currently render Markdown text, math, code, and basic lists, but authors cannot publish Mermaid diagrams and root-relative Markdown images are not adapted for the GitHub Pages base path. Ordered and unordered lists also lack the strong visual hierarchy shown in the requested document examples.

## What Changes

- Treat fenced `mermaid` blocks as diagrams in article and prose-slide projections.
- Support Markdown images with responsive presentation and host-provided asset-path resolution.
- Style ordinary ordered and unordered Markdown lists with prominent numbered and bullet markers in both article and prose-slide views.
- Document and demonstrate the authoring syntax, including the supported projection boundary.

## Capabilities

### New Capabilities

- `rich-document-content`: Mermaid diagrams, portable Markdown images, and editorial list presentation across RIN article and prose-slide projections.

### Modified Capabilities

None.

## Impact

- Extends the public `@rin/document` rendering API with an optional image-source resolver.
- Adds Mermaid as a browser dependency that is loaded only when diagram nodes exist.
- Updates article and slide rendering, site asset adaptation, shared styles, authoring documentation, sample content, and regression tests.
