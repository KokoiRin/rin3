## ADDED Requirements

### Requirement: RIN document is the single content source
The system SHALL support a `format: rin-note` Markdown document whose frontmatter owns the shared content metadata and whose body contains explicit Slide boundaries and layout kinds. The system MUST derive both article and Slide representations from that file without storing a second copy of the substantive content.

#### Scenario: Valid RIN document produces two views
- **WHEN** a published RIN document declares article and Slide views and contains valid Slide directives
- **THEN** the static build produces one article route and one Slide route with the same title, summary, language, section, slug, and substantive content

#### Scenario: Unknown Slide layout fails the build
- **WHEN** a RIN document declares a Slide kind that the compiler does not support
- **THEN** the build fails with an error that identifies the source file and unknown kind

### Requirement: Slide boundaries and layouts are author controlled
The system SHALL treat each explicit RIN Slide directive as one Slide and SHALL validate its Markdown body against the declared layout contract. The system MUST NOT split pages by runtime measurement or inferred content length.

#### Scenario: Author creates two explicit pages
- **WHEN** a chapter contains two valid Slide directives
- **THEN** the derived deck contains two Slides in the same source order

#### Scenario: Required content is missing
- **WHEN** a formula Slide has no display formula or a matrix Slide has no valid three-column table
- **THEN** the build fails with a source-specific validation error

### Requirement: Supported content maps to article and Slide semantics
The system SHALL support prose, cards, matrix, flow, contract, checklist, formula, code, and closing Slide kinds. Each kind MUST define both a Slide compilation rule and an article rendering meaning that preserves all substantive content.

#### Scenario: Formula is rendered in both views
- **WHEN** a RIN formula Slide contains an introduction, display formula, and explanatory items
- **THEN** the article contains KaTeX-rendered formula content and the Slide view contains the existing formula layout with the same explanation

#### Scenario: Plain narrative remains readable
- **WHEN** a RIN prose Slide contains headings, paragraphs, links, lists, or inline formatting
- **THEN** the article renders them as normal prose and the Slide renders them in a bounded rich-text layout

### Requirement: Dual-view content has one discoverable entry
The system SHALL list a dual-view RIN document once in its section and SHALL use the article route as the default entry. The article and Slide views MUST each expose a direct switch to the other view.

#### Scenario: Section lists dual-view content once
- **WHEN** a published RIN document has both views
- **THEN** its section page contains one entry linking to the article and marks that a Slide view is available

#### Scenario: User switches between views
- **WHEN** the user activates the Slide control on the article or the document control in the Slide player
- **THEN** navigation opens the corresponding route for the same content

### Requirement: Existing standalone decks remain supported
The system SHALL continue to render explicitly registered standalone decks that have no RIN article source.

#### Scenario: Standalone deck remains available
- **WHEN** a deck remains registered in the standalone deck registry
- **THEN** its static Slide route, section listing behavior, and existing controls remain available

### Requirement: Demonstration content is migrated
The system SHALL publish `RIN III Slides 组件使用说明` as a dual-view RIN document in the `me` section and SHALL remove `Eigenvalues: Scale Along Stable Directions` from published content.

#### Scenario: Component guide demonstrates both views
- **WHEN** the site is built
- **THEN** `/me/component-guide/` and `/slides/component-guide/` both exist, link to each other, and the `me` section lists the guide once

#### Scenario: Eigenvalues content is removed
- **WHEN** the site is built
- **THEN** the mathematics section does not list Eigenvalues and `/mathematics/eigenvalues/` is not exported
