## Why

The Slides player currently combines all visual layout projection with Reveal lifecycle and navigation state in one 472-line client component. That coupling makes layout additions risky, and the existing static-export tests cannot catch runtime regressions such as an uninitialized player or broken navigation.

## What Changes

- Extract the pure mapping from rendered slide data to visual JSX into a dedicated layout module.
- Keep Reveal lifecycle, navigation, chapter selection, fullscreen, and shell state in the player module.
- Add browser-level regression coverage for player initialization, button navigation, and the fourth entrance gesture.
- Add parser/compiler edge cases around chapter references and required slide structures.

## Capabilities

### New Capabilities

- `slides-runtime-regression`: Defines the runnable Slides player behavior and the automated regressions that protect it.

### Modified Capabilities

None.

## Impact

Affected areas are `components/slides`, the Node test suite, the package parser/compiler tests, and CI dependency installation. Public URLs, authoring syntax, compiled deck types, and visual styling remain unchanged.
