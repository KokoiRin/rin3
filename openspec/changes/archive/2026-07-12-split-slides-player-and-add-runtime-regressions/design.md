## Context

`components/slides/player.tsx` has two independent reasons to change: adding a new visual layout and changing player interaction/runtime behavior. Keeping both in one client component obscures that boundary. Static HTML tests verify export content but cannot prove that Reveal initializes in a browser.

## Goals / Non-Goals

**Goals:**

- Give layout projection and player runtime separate modules.
- Preserve all current routes, rendered markup contracts, and interactions.
- Run high-value browser smoke tests through the existing `npm test` command and GitHub Pages workflow.

**Non-Goals:**

- Redesign the Slides UI or split the cohesive route-scoped stylesheet by line count.
- Change the portable document package API or Markdown authoring syntax.
- Exhaustively test Reveal.js itself.

## Decisions

### Extract a pure layout component

`slide-layouts.tsx` will own the exhaustive `RenderedSlideContent.kind` switch and return JSX. `player.tsx` will own only browser state, Reveal lifecycle, navigation, and the surrounding shell. This follows the two independent change axes without adding a generic component framework.

Alternative considered: one file per layout. Rejected because most layouts are small, share the same deck/content types, and currently change as one visual vocabulary.

### Keep the stylesheet intact

`slides.css` is large, but it is route-scoped and cohesive around one visual system. Splitting it now would add ordering/import concerns without isolating an independently changing responsibility.

### Exercise the production static export in Chromium

A Node test will serve `out/` from an in-process HTTP server and use `playwright-chromium` to verify Reveal readiness, one active slide, button navigation, and the entrance gesture sequence. This reaches the same built assets that GitHub Pages deploys and avoids coupling tests to a development server.

Alternative considered: DOM emulation. Rejected because Reveal relies on real layout and browser APIs, which was the source of the earlier regression.

## Risks / Trade-offs

- Browser tests add install size and test duration. → Keep the suite to two focused smoke scenarios and reuse one Chromium process.
- Static-export paths differ in GitHub Actions because of `/rin3`. → Derive the test base path from the same environment convention used by the build.
- Visual JSX remains one moderately sized module. → Reassess only when individual layouts gain independent behavior or ownership.

## Migration Plan

1. Extract layout rendering without changing markup.
2. Add parser/compiler and browser regressions.
3. Run build, test, lint, type checking, and OpenSpec validation.
4. Push `main`; the existing Pages workflow builds and deploys the tested export.

Rollback is a normal commit revert; no data or content migration is involved.

## Open Questions

None.
