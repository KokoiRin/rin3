## Why

RIN currently treats each Slide body as one undifferentiated Markdown string, so substantive article detail must also fit on the projected Slide. The document model needs to distinguish content meaning, projection target, and Slide presentation before more layouts are added.

## What Changes

- Add explicit `core` and `detail` content roles inside a Slide page.
- Project core content to both article and Slides, while projecting detail content only to the article.
- Keep the existing `kind` authoring attribute as the adapter for Slide presentation.
- Parse role boundaries once into domain blocks and make article/Slides projections consume those blocks.
- Document the new `:::detail` authoring block and its invariants.
- **BREAKING**: The pre-1.0 intermediate `RinSlideSource` shape now exposes `presentation` and `blocks` instead of `kind` and one undifferentiated `markdown` string.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `rin-document-dual-view`: Add role-based selective projection while preserving one substantive source document.

## Impact

Affected areas are the portable RIN domain model, parser, Slide compiler, public types, authoring documentation, and compiler/parser tests. Existing content and rendered UI remain compatible.
