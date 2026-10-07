# Spec: Node 24 throughout

## What

Every place the repo pins a Node version moves from 22 to 24: both GitHub Actions workflows run on Node 24, `package.json` `engines.node` requires `>=24`, and the README states "Node.js 24 or higher". No version file (.nvmrc etc.) is added; `@types/node` (already `^24.10.13`) is untouched.

## Design

Four one-line edits, no code or test changes:

- `.github/workflows/publish.yml:26` `node-version: 22` -> `node-version: 24` (the "Set Node version" step, `actions/setup-node@v4`; `registry-url` on :27 unchanged).
- `.github/workflows/dependabot.yml:30` `node-version: 22` -> `node-version: 24`.
- `package.json:15` `"node": ">=22"` -> `"node": ">=24"`.
- `README.md:32` `- Node.js 22 or higher` -> `- Node.js 24 or higher`.

All four ship in a single commit with a `feat!:` subject (e.g. `feat!: require Node.js 24`) plus a `BREAKING CHANGE: requires Node.js >= 24` footer, so the publish workflow cuts a major release. Nothing is removed.

## Hard-to-undo

- Public API / compatibility change: `package.json` `engines.node` raised from `>=22` to `>=24`; Node 22 consumers lose support. Released as a major version via `feat!:` on push to `main` (publish.yml publishes to npm, which cannot be unpublished freely).

## Task index

| Task file             | What it does                                            | Files                                                                                    |
| --------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 01_01_node_24_pins.md | Bump all four Node 22 pins to 24 in one `feat!:` commit | .github/workflows/publish.yml, .github/workflows/dependabot.yml, package.json, README.md |
