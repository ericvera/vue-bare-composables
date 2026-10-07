ensure that we are using node version 24 throughout

## Investigation

Local node is v24.18.0. Node 22 is pinned in four tracked places:

- .github/workflows/publish.yml:26 — `node-version: 22` (setup-node@v4 at :24, `registry-url` at :27); the job that publishes on push to main.
- .github/workflows/dependabot.yml:30 — `node-version: 22` (setup-node@v4 at :28).
- package.json:14-16 — `"engines": { "node": ">=22" }`.
- README.md:32 — "Node.js 22 or higher".

Already on 24: package.json:35 `@types/node` `^24.10.13` (yarn.lock resolves 24.10.13).

No version file exists (.nvmrc, .node-version, .tool-versions, mise.toml, volta). If added, it goes at repo root and matches the setup-node value.

Not Node-tied: tsconfig target ESNext / NodeNext; .yarnrc.yml nodeLinker; packageManager yarn@4.12.0.

Hard to undo: raising `engines.node` to `>=24` is a public compatibility change; per CLAUDE.md it needs `feat!:` or a `BREAKING CHANGE:` footer to release as a major. CI/README-only changes are `chore:`/`docs:` and release nothing.

Patterns: both workflows use a "Set Node version" step with a bare major (`node-version: 22`) → change to `24`. Prettier covers YAML, single quotes.

## Decisions

- Change Node 22 → 24 only where a Node version is pinned today: publish.yml, dependabot.yml (`node-version: 24`), package.json `engines.node` (`>=24`), README.md:32 ("Node.js 24 or higher").
- Do not add a version file (.nvmrc etc.); `@types/node` is already on 24 and stays as is.

## Assumptions

- Raising `engines.node` to `>=24` is breaking for Node 22 consumers, so the change ships under a `feat!:` subject (major release) per CLAUDE.md.

## Proposal

Issue: CI, `engines.node` and the README pin Node 22; the repo should use Node 24 throughout.
Approach: bump those four pins to 24 (`node-version: 24`, `>=24`, README text), committed as `feat!:` so it releases as a major.
Skips: none — the `engines` bump is a public compatibility change, so spec and critic run.
