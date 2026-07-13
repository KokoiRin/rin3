## ADDED Requirements

### Requirement: Content roles control view projection

The system SHALL model content role, projection target, and Slide presentation separately. Core content SHALL appear in both article and Slides projections, while explicitly marked detail content SHALL remain in source order in the article and SHALL NOT appear in the Slides projection.

#### Scenario: Long explanation remains article-only

- **WHEN** a valid Slide directive contains shared core Markdown followed by a valid detail block
- **THEN** the article contains both sections in source order and the Slide contains only the shared core content

#### Scenario: Existing Slide has no role marker

- **WHEN** an existing valid Slide directive contains only ordinary Markdown
- **THEN** all of its body is treated as core content and both projections remain unchanged

### Requirement: Detail blocks are explicit and structurally valid

The system SHALL use explicit detail markers rather than content length heuristics and MUST fail with source context when a detail block is not closed inside its Slide.

#### Scenario: Unclosed detail block

- **WHEN** a Slide opens a detail block without closing it before the document ends
- **THEN** parsing fails with the source path and detail block line

#### Scenario: Detail marker appears in fenced code

- **WHEN** a fenced code example contains detail marker text
- **THEN** the marker text remains code content and does not change projection
