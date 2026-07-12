# slides-runtime-regression Specification

## Purpose
TBD - created by archiving change split-slides-player-and-add-runtime-regressions. Update Purpose after archive.
## Requirements
### Requirement: Slides runtime initializes a single active page

The exported Slides route SHALL initialize Reveal in a real browser and expose exactly one active slide after readiness.

#### Scenario: Open an exported deck

- **WHEN** a browser opens a generated Slides route
- **THEN** the Reveal root becomes ready and exactly one direct slide is active

### Requirement: Slides navigation advances the presentation

The Slides player SHALL allow a user to advance through the deck with its visible next-page control while keeping the displayed counter synchronized.

#### Scenario: Advance from the cover

- **WHEN** the user activates the next-slide control on the first page
- **THEN** the second page becomes active and the counter displays the second position

### Requirement: Hidden entrance remains gesture-gated

The home page SHALL reveal the fourth entrance only after three separate horizontal wheel gestures and SHALL ignore vertical scrolling for this gesture count.

#### Scenario: Reveal the hidden entrance

- **WHEN** the user performs a vertical wheel gesture followed by three distinct horizontal wheel gestures
- **THEN** the fourth entrance stays hidden before the third horizontal gesture and becomes visible after it

### Requirement: Slide documents reject invalid chapter structure

The document parser SHALL reject duplicate chapter identifiers and slides that reference an undeclared chapter before a site build proceeds.

#### Scenario: Duplicate chapter identifier

- **WHEN** a RIN document declares the same chapter identifier more than once
- **THEN** parsing fails with the source path and duplicate identifier

#### Scenario: Undeclared chapter reference

- **WHEN** a slide references a chapter absent from frontmatter
- **THEN** parsing fails with the source path and unknown chapter

