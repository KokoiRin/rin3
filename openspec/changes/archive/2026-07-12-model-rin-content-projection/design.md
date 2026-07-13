## Context

The source directive's `kind` currently chooses both how Markdown is interpreted and how the Slide is rendered. The body is stored as one string, validation and compilation parse it separately, and article-only elaboration cannot live inside a Slide boundary without reaching the Slide UI.

## Goals / Non-Goals

**Goals:**

- Model content role, projection target, and Slide presentation as separate concepts.
- Let authors keep a concise shared claim and a long article-only explanation together in source order.
- Preserve existing `kind` syntax, all current content, and all UI output when no detail block is present.

**Non-Goals:**

- Build a replacement Markdown AST or generic plugin system.
- Add speaker notes, automatic summarization, length-based hiding, or new Slide layouts.
- Change the article or Slides visual design.

## Decisions

### Content roles own projection policy

The domain model will contain `core` and `detail` blocks. A pure projection rule maps `core` to article and Slides and `detail` to article only. Blocks do not store duplicated role and target fields, avoiding illegal combinations.

### Presentation remains explicit author intent

The source JSON continues to use `kind` for compatibility. The parser adapts that value to the domain model's `presentation` field, separating source syntax from internal meaning without migrating content.

### Markdown remains the syntax tree implementation

RIN will not define HeadingBlock, LinkBlock, or ParagraphBlock. Remark/mdast remains internal syntax machinery; RIN only models the stable roles and page-level presentation needed by its projections.

### Detail is an explicitly nested semantic directive

Inside `:::slide`, `:::detail ... :::` marks article-only explanation. The parser removes the marker in article output, excludes its body from Slides projection, preserves source order, and rejects an unclosed detail block.

## Risks / Trade-offs

- Nested directives make the hand-written boundary scanner more complex. → Keep nesting to one supported semantic directive and cover fences/unclosed blocks with focused tests.
- `detail` is not visible on Slides by design. → Require the Slide-visible core to remain independently valid for its presentation.
- The model only has two roles initially. → Add roles only when a real projection behavior appears.
