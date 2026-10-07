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

## Open questions

1. Does "throughout" include the published `engines.node` floor and README requirement (breaking, major release), or only CI and dev tooling?
2. Add a root version file (.nvmrc) pinning 24?
