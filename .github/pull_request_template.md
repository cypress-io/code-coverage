<!--
PRs are squash-merged, so the PR title becomes the commit message on master.
semantic-release reads it to pick the next version, so use a Conventional Commits title:
  feat: ...   fix: ...   chore: ...   docs: ...   feat!: ... (breaking)
-->

## Summary

<!-- What does this change, and why? -->

Closes #

## How it was tested

<!-- Unit tests, test apps, or manual steps. Note any test app you added or extended. -->

## Checklist

- [ ] The PR title follows [Conventional Commits](https://www.conventionalcommits.org/), with `!` for breaking changes
- [ ] `npm test` and `npm run format:check` pass
- [ ] Logic changes in `lib/*-utils.ts` come with a unit test in `test/lib/`
- [ ] Behavior users see in a Cypress run is covered by a test app in `test-apps/` (a new app is also added to `.circleci/config.yml` and the README)
- [ ] New or changed options are documented in `README.md` and read with `Cypress.expose()`, not `Cypress.env()`
