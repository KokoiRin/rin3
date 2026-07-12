## ADDED Requirements

### Requirement: Framework-independent document compilation
The system SHALL expose RIN parsing, validation, article rendering, Slides compilation, and rich-content rendering through a package that does not require Next.js, React, Reveal, site routes, or the site filesystem.

#### Scenario: Compile a document outside the website
- **WHEN** a consumer passes a valid RIN Markdown string, source path, section identity, and slug through the package public interface
- **THEN** the package produces metadata, article content, and Slides data without loading RIN III application modules

### Requirement: Host-owned content discovery and navigation
The document package SHALL treat section names, slugs, asset references, and alternate-view identities as neutral data, while the host application MUST own filesystem discovery, public URLs, base paths, and section presentation.

#### Scenario: Website adapts a compiled deck
- **WHEN** the RIN III website compiles a document for its Slides route
- **THEN** the website adds section labels, article URLs, and deploy-safe asset paths without those rules being implemented by the document package

### Requirement: Existing dual-view behavior remains stable
The refactored system MUST preserve the existing RIN document format and SHALL continue to produce one article route and one same-slug Slides route from each published dual-view document.

#### Scenario: Existing content builds after extraction
- **WHEN** the existing model-theory and component-guide RIN documents are built
- **THEN** their article and Slides routes, shared metadata, substantive content, rich rendering, and two-way navigation remain available

### Requirement: Public interface is the package test surface
The package SHALL expose its supported compiler contract from one public entrypoint, and tests MUST verify observable projections and source-specific validation errors through that entrypoint.

#### Scenario: Invalid source reports its origin
- **WHEN** a consumer compiles a RIN document with an unknown layout, missing required structure, or invalid chapter reference
- **THEN** the public interface fails with an error that identifies the source path and invalid construct
