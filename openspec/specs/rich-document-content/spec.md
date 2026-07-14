# rich-document-content Specification

## Purpose
TBD - created by archiving change add-rich-document-media-and-lists. Update Purpose after archive.
## Requirements
### Requirement: Authors can embed Mermaid diagrams
The system SHALL interpret fenced `mermaid` code blocks as diagrams in article and prose-slide projections while keeping raw HTML disabled and Mermaid security strict.

#### Scenario: A valid Mermaid fence appears in both projections
- **WHEN** a RIN prose page contains a fenced `mermaid` block
- **THEN** the article and prose slide expose a Mermaid diagram node that the page runtime renders as SVG

#### Scenario: A page has no Mermaid content
- **WHEN** an article or slide deck contains no Mermaid diagram node
- **THEN** the page runtime does not download the Mermaid rendering library

### Requirement: Authors can embed portable Markdown images
The system SHALL render standard Markdown images responsively and SHALL allow the host to resolve image source paths without coupling `@rin/document` to a deployment base path.

#### Scenario: A root-relative public image is deployed under a base path
- **WHEN** Markdown references a root-relative image and the host provides an image-source resolver
- **THEN** both article and prose-slide HTML use the host-resolved URL

#### Scenario: An external image is used
- **WHEN** Markdown references an absolute external image URL
- **THEN** the host asset adapter leaves the external URL unchanged

### Requirement: Markdown lists use editorial markers
The system SHALL preserve semantic ordered and unordered list HTML and present their markers as visually prominent numbered or bullet items in article and prose-slide views.

#### Scenario: An author writes an ordered list
- **WHEN** Markdown contains items using `1.` syntax
- **THEN** the rendered view uses an ordered list with prominent numeric markers and readable item spacing

#### Scenario: An author writes an unordered list
- **WHEN** Markdown contains items using `-` syntax
- **THEN** the rendered view uses an unordered list with prominent dot markers and readable item spacing
