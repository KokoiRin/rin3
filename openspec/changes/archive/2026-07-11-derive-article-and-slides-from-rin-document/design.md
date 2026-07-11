## Context

RIN III currently has two independent content pipelines. `lib/articles.ts` reads Markdown and renders article HTML, while `app/slides/decks.ts` stores complete `SlideDeckData` objects. An article can link to a deck, but the two bodies remain separate. The component guide is presently a standalone hand-authored deck and is the best migration fixture because it exercises every existing Slide layout.

## Goals / Non-Goals

**Goals:**

- Define one authoring format that remains readable as Markdown while carrying explicit Slide structure.
- Compile one source deterministically into article HTML and existing Slide data.
- Keep parsing and rich-content rendering on the server at build time.
- Preserve standalone decks and the current Reveal player.
- Demonstrate the full workflow with the component guide in the `me` section.

**Non-Goals:**

- Automatically infer high-semantic layouts from arbitrary Markdown.
- Migrate the model-theory deck or every existing deck in this change.
- Add a browser editor, runtime Markdown parser, or automatic page sizing.
- Preserve the deleted Eigenvalues route with redirects.

## Decisions

### Use Markdown plus deterministic RIN directives

A RIN source remains a `.md` file with `format: rin-note`. Shared metadata lives in frontmatter. Each Slide uses a line-delimited directive whose attributes are JSON, for example:

```md
:::slide {"kind":"formula","chapter":"rich-content","eyebrow":"RICH CONTENT / LATEX"}
## 公式页直接填写 LaTeX 本体

介绍文字。

$$
\det(A-\lambda I)=0
$$

### SOURCE — String.raw

解释文字。
:::
```

JSON attributes avoid ambiguous ad-hoc quoting and can be parsed without executing MDX. Directive bodies remain ordinary Markdown and become the article representation after directive wrapper lines are removed.

Alternative considered: current `SlideDeckData` as the source. Rejected because TypeScript objects are presentation-shaped, verbose for prose, and do not preserve normal Markdown authoring. MDX was also considered but adds a JSX execution/compilation surface that this static content system does not need.

### Derive cover and chapters from shared metadata

The compiler derives the cover Slide from article frontmatter and `slides` metadata. Chapter definitions remain explicit in frontmatter because the player needs stable ids, labels, titles, and summaries. Slide order and chapter membership come from directive order and directive attributes.

### Parse into a neutral RinDocument before projecting views

`lib/rin-documents.ts` owns file parsing, frontmatter validation, directive extraction, and the neutral `RinDocument` model. It does not import React or the Slide player. `lib/articles.ts` renders the article projection. `app/slides/compile-rin-deck.ts` maps a document into `SlideDeckData`.

The source document is authoritative. Article HTML and Slide data are derived values and are never written back to disk.

### Compile layout bodies by Markdown structure

The compiler parses each directive body into Markdown AST and validates a small convention:

- first level-two heading: Slide title;
- first following paragraph: introduction;
- level-three sections named `LABEL — Title`: card/legend/contract items;
- first three-column table: matrix rows;
- first ordered list: flow or checklist items;
- first display math block: formula;
- first fenced code block: code language and source;
- first blockquote: closing statement;
- prose: arbitrary rendered Markdown body.

Unknown kinds, invalid JSON, unclosed directives, duplicate slugs, missing chapters, and missing layout-required blocks fail the build with the source path.

### Keep article rendering semantic and Slide rendering visual

Article rendering strips RIN wrapper lines and renders the remaining Markdown through the existing GFM, KaTeX, heading, and Shiki pipeline. This retains all body content without reproducing Slide chrome. Slide compilation converts the same blocks into the existing visual layouts. A new `prose` Slide kind is the only new low-semantic visual component.

### Resolve routes from standalone and derived decks

The Slide route combines standalone registry slugs with RIN documents that enable Slides. A derived deck receives `articleHref` automatically and never receives a standalone `listing`. The section page lists the article once and uses its article route as the primary href. Existing article-header and player book controls provide the two-way switch, with user-facing labels updated to clearly describe the alternate view.

## Risks / Trade-offs

- [Directive syntax is custom] → Keep it line based, JSON attributed, documented, and validated with source-specific errors.
- [Article prose may feel segmented] → Strip wrappers entirely and render headings/body normally; do not render Slide borders in article mode.
- [Dense Slide body may overflow] → Keep author-controlled page boundaries and validate component cardinality; visual QA the largest migrated pages.
- [Shared parser creates a new central boundary] → Keep it pure and server-only, with production behavior tests at the exported HTML boundary.
- [Existing hand-authored deck types are mixed with derived types] → Extract shared types but preserve standalone registry behavior; defer broad migrations.

## Migration Plan

1. Add the parser and dual-view compiler behind `format: rin-note` so existing Markdown and decks are unchanged.
2. Migrate the component guide into `content/me/component-guide.md` and remove its standalone data object.
3. Delete `content/mathematics/eigenvalues.md` and update static export expectations.
4. Verify both routes, view switches, list uniqueness, formula/code rendering, base paths, desktop, and mobile layouts.
5. Update author documentation and the installed ChatGPT-to-RIN-notes Skill.

Rollback consists of restoring the standalone component-guide deck and removing the new RIN document/compiler path; other standalone content remains untouched.

## Open Questions

None. The article route is the default section entry, directive boundaries are explicit, and existing standalone decks remain supported.
