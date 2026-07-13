## 1. Domain Model

- [x] 1.1 Add content roles, projection policy, content blocks, and Slide presentation to the portable domain model
- [x] 1.2 Adapt existing `kind` syntax into the domain presentation field without changing existing documents

## 2. Projection Behavior

- [x] 2.1 Parse nested `:::detail` blocks while preserving article source order
- [x] 2.2 Compile Slides from core blocks only and keep existing layout validation behavior
- [x] 2.3 Reject unclosed detail blocks and preserve marker text inside fenced code

## 3. Documentation and Verification

- [x] 3.1 Document core/detail authoring and projection behavior
- [x] 3.2 Run focused RED/GREEN tests, the package suite, one full build, lint, and strict OpenSpec validation
- [x] 3.3 Review and archive the completed change
