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
- **Commits and PR titles:** Conventional Commits (`feat:`, `fix:`, `chore:`, with `!` for breaking changes). `semantic-release` derives versions from them, so the prefix matters. PRs are squash-merged, so the PR title becomes the commit on `master` and needs the same prefix.
- **Agent instructions:** when you edit `AGENTS.md` or other instruction files, use unordered lists rather than tables.
- **Configuration API:** user-facing options are read from `Cypress.expose()` (the `expose` section of `cypress.config.js`), not `Cypress.env()`. That change was a breaking release, so don't reintroduce `Cypress.env` reads.

### Code comments

- **Prefer none** — Always prefer no code comment if the code is self-explanatory.
- **Explain the why** — When a comment is necessary, use it to explain the *why* and anything relevant that is not directly expressed by the code itself.
- **Don't repeat yourself** — Do not restate the same comment multiple times in a file as the code flows through each step.
- **Present state only** — Keep comments relevant to the current state of the code. Do not describe what changed or how the code used to be different.
- **Name the reason, not the predecessor** — "Matches what the old plugin did" is not a *why*, and it rots once that plugin is deleted. State the reason the old code had, and put parity with replaced tooling in the commit message or guide.

Bad examples:

```js
// never wipe the entire jar - the old hack called clearCookies() with no filter
// we no longer need to clear the state here, CDP added automatically clearing
// Firefox previously relied on os-level focus, now we use WebDrive BiDi to focus
```

Good examples:

```js
// Close any extra pages so they don't leak into other tests
// Firefox doesn't support this in native BiDi, so we pull remote.location from current frame
// `cookie`'s serializer rejects an IPv6 literal Domain (e.g. `[::1]`), crashing
// the proxy. Browsers scope cookies for IP hosts to that host anyway, so omit
// Domain and let the cookie default to host-only.
```

## When you change things

- A change in `lib/*-utils.ts` should come with a unit test in `test/lib/`.
- A change in behavior that users see in a Cypress run should be covered by a test app. Extend an existing app if it fits. If you add a new one, also add it to the `verify-test-apps` matrix in `.circleci/config.yml` and to the "Internal test apps" list in `README.md`.
- If you add, rename, or change an option, update `README.md`, since it's the plugin's user-facing documentation.
- If you add a new entry point, add it to `exports` in `package.json` too.
- Before you push, run `npm test` and `npm run format:check`.
- When you open a PR, fill in every section of `.github/pull_request_template.md`. Under "How has the user experience changed?", write "No change" if nothing users see or do is different.

## CI

CircleCI (`.circleci/config.yml`) runs the format and Markdown checks, the unit tests, a build, every test app in a matrix, and a Windows run of `test-apps/all-files`. It publishes to npm from `master`, `next`, `beta`, and `dev`. GitHub Actions only handle Snyk scans and issue triage.
