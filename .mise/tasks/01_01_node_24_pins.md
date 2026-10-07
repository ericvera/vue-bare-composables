# 01_01 Bump Node 22 pins to Node 24

## Goal

Make the repo use Node 24 everywhere a Node version is pinned: CI workflows, `package.json` `engines`, and the README requirements line.

## Files to modify/create

- /Users/eric/Code/vue-bare-composables/.github/workflows/publish.yml
- /Users/eric/Code/vue-bare-composables/.github/workflows/dependabot.yml
- /Users/eric/Code/vue-bare-composables/package.json
- /Users/eric/Code/vue-bare-composables/README.md

## Background

- No prior tasks. This is the only task.
- The repo is `vue-bare-composables`, an npm library. Every push to `main` runs `.github/workflows/publish.yml`, which picks the version bump from Conventional Commit subjects and publishes to npm.
- Current pins (all Node 22):
  - `.github/workflows/publish.yml:26` `node-version: 22` inside the "Set Node version" step (`actions/setup-node@v4` at :24, `registry-url: 'https://registry.npmjs.org'` at :27).
  - `.github/workflows/dependabot.yml:30` `node-version: 22` inside the "Set Node version" step (`actions/setup-node@v4` at :28).
  - `package.json:14-16` `"engines": { "node": ">=22" }`.
  - `README.md:32` `- Node.js 22 or higher` under `## Requirements`.
- Decisions: change only these four; do not add `.nvmrc`/`.node-version`/`.tool-versions`/`mise.toml`; leave `@types/node` (`^24.10.13`) alone.
- Raising `engines.node` is a breaking change for Node 22 consumers, so it ships as a major release.

## Guides

- CLAUDE.md (doc, required): every commit subject and PR title, so releases bump the right version

## Implementation details

1. `publish.yml:26`: `node-version: 22` -> `node-version: 24` (keep indentation and the bare-major form; no quotes).
2. `dependabot.yml:30`: `node-version: 22` -> `node-version: 24`.
3. `package.json:15`: `"node": ">=22"` -> `"node": ">=24"`.
4. `README.md:32`: `- Node.js 22 or higher` -> `- Node.js 24 or higher`.
5. Commit all four in one commit with subject `feat!: require Node.js 24` and body footer `BREAKING CHANGE: requires Node.js >= 24` (bare Conventional Commit subject, no prefix such as `Task 01_01:`), ending with the attribution line required by the session.

## Gotchas

- Do not touch `yarn.lock` or run `yarn install`/`yarn up`; no dependency changes are needed.
- Do not change `registry-url` or any other workflow step.
- The commit subject must start with `feat!:` exactly; `chore:` or `fix:` would publish an incompatible `engines` without a major bump.
- `grep -rn "22"` hits in `yarn.lock` are unrelated package versions; ignore them.

## Verification

- No tests cover config/doc pins; no new tests are written.
- Substitute check: `grep -rnE "node-version: 2[0-9]|\"node\": \">=|Node\.js [0-9]+ or higher" .github package.json README.md` shows only `24` values (4 lines).
- Run Check: `yarn lint`, `yarn build`, `yarn prettier --check .`.
- Run Unit tests: `yarn test` (must stay green; local Node is v24.18.0, satisfying `>=24`).
- `git log -1 --format=%B` shows the `feat!:` subject and `BREAKING CHANGE:` footer.
