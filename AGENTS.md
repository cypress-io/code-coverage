# Agent guide

`@cypress/code-coverage` is a Cypress plugin that collects Istanbul coverage during Cypress runs, merges it across specs (and optionally from instrumented backends), and writes reports with `nyc`. It's written in TypeScript and published to npm from `dist/`.

## Layout

- `lib/` — the plugin source. Each entry point maps to a `package.json` `exports` path:
  - `task.ts` — Node side. Registers the `cy.task` handlers that reset, combine, and report coverage (`./task`).
  - `support.ts` — browser side. Hooks into the test lifecycle and sends `window.__coverage__` to the tasks (`./support`).
  - `plugins.ts`, `use-babelrc.ts` — helper entry points (`./plugins`, `./use-babelrc`).
  - `common-utils.ts`, `support-utils.ts`, `task-utils.ts` — shared logic. Put testable logic here, not in the entry points.
- `middleware/` — Express, Hapi, and Next.js handlers that expose backend coverage at `/__coverage__`.
- `test/lib/` — Vitest unit tests, with fixtures in `test/lib/__fixtures__/`.
- `test-apps/` — end-to-end example apps. Each one is a real Cypress project that exercises one scenario and checks the resulting coverage.
- `scripts/test-apps-and-verify-coverage.sh` — runs every test app locally.

## Commands

Run these from the repo root with Node 20 or later (CI uses Node 22).

- Install: `npm ci`
- Build to `dist/`: `npm run build`
- Unit tests: `npm test`
- Unit tests with coverage (80% line threshold): `npm run coverage`
- Format check (CI runs this): `npm run format:check`
- Fix formatting: `npm run format`
- Markdown link check (CI runs this): `npm run check:markdown`
- All test apps: `npm run apps:test:coverage:verify`

The README's Contributing section mentions `npm run test:ci`, but that script doesn't exist in `package.json`. Use the commands above instead.

### Running a single test app

Test apps load the plugin through `@cypress/code-coverage`, which the root `package.json` links to the repo itself (`"file:."`). Its `exports` point at `dist/`, so **run `npm run build` first**, or the apps will test stale code.

```shell
npm run build
cd test-apps/<app>
npm i
npm test                      # starts the app and runs Cypress
npm run coverage:verify       # checks the expected coverage percentage
npm run coverage:check-files  # checks only the expected files appear in the report
```

## Conventions

- **Formatting:** Prettier with no semicolons, single quotes, two-space indent, and no trailing commas (`.prettierrc.json`). Run `npm run format` before committing.
- **TypeScript:** `strict` is on. Keep types sound rather than reaching for `any`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, with `!` for breaking changes). `semantic-release` derives versions from them, so the prefix matters.
- **Agent instructions:** when you edit `AGENTS.md` or other instruction files, use unordered lists rather than tables.
- **Configuration API:** user-facing options are read from `Cypress.expose()` (the `expose` section of `cypress.config.js`), not `Cypress.env()`. That change was a breaking release, so don't reintroduce `Cypress.env` reads.

## When you change things

- A change in `lib/*-utils.ts` should come with a unit test in `test/lib/`.
- A change in behavior that users see in a Cypress run should be covered by a test app. Extend an existing app if it fits. If you add a new one, also add it to the `verify-test-apps` matrix in `.github/workflows/ci.yml` and to the "Internal test apps" list in `README.md`.
- If you add, rename, or change an option, update `README.md`, since it's the plugin's user-facing documentation.
- If you add a new entry point, add it to `exports` in `package.json` too.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs the format and Markdown checks, the unit tests, a build, every test app in a matrix, and a Windows run of `test-apps/all-files`. Other workflows in `.github/workflows/` handle Snyk scans and issue triage.

CircleCI (`.circleci/config.yml`) only publishes to npm from `master`, `next`, `beta`, and `dev`.
