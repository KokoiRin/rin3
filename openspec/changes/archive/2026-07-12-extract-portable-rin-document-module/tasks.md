## 1. Portable document package

- [x] 1.1 Configure the root npm workspace and create the `@rin/document` package public entrypoint.
- [x] 1.2 Move the neutral RIN model, parser, Slides model, compiler, and rich renderers into the package without site-framework dependencies.
- [x] 1.3 Add public-interface tests covering dual projections and source-specific validation failures.

## 2. Website adapters

- [x] 2.1 Move section, route, and asset ownership into `lib/site` and update website imports.
- [x] 2.2 Replace `lib/articles.ts` with a content catalog that discovers local files and adapts package output to website article routes.
- [x] 2.3 Add the website Slides catalog/adapter that combines derived and standalone decks and supplies site navigation fields.

## 3. Runtime UI organization

- [x] 3.1 Move the Reveal player into `components/slides` while preserving its rendered-data interface and current behavior.
- [x] 3.2 Update Next.js routes and layouts to depend only on website catalog, site configuration, and UI modules.

## 4. Verification and documentation

- [x] 4.1 Update author and project documentation to describe the package, host adapter, and dependency direction.
- [x] 4.2 Run package tests, full static build tests, lint, OpenSpec validation, and diff checks.
- [x] 4.3 Start the local preview and verify that the required article and Slides URLs are accessible.
