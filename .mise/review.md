# Review

- 01_01 (8dbc3a7 `feat!: require Node.js 24`, `BREAKING CHANGE:` footer): Node 22 → 24 in `.github/workflows/publish.yml:26` and `.github/workflows/dependabot.yml:30` (`node-version: 24`), `package.json:15` (`engines.node` `>=24`), `README.md:32` ("Node.js 24 or higher"). Verify: `git show 8dbc3a7 --stat` touches only those 4 files; `git grep -nE 'node-version|"node":|Node\.js 2'` shows only 24s; `yarn lint && yarn build && yarn prettier --check . && yarn test` pass.
- Review fix (664b9c3 `chore: update dependencies`): your package updates, plus fixes. Typed ref in `useFixToVisualViewport.test.ts` instead of an `as`, removed the unused eslint-disable in `vite.config.ts`, dropped `esModuleInterop: false` from `tsconfig.json` (dist byte-identical), formatted `useFixToVisualViewport.ts`, added `@vue/devtools-api` dev dep (pinia 4 no longer bundles it). Verify: all four quality commands pass.

## Open assumptions

- Raising `engines.node` is breaking for Node 22 consumers, so it releases as a major via `feat!:` + `BREAKING CHANGE:`. The PR title must also be `feat!: require Node.js 24` so a squash merge bumps major.
- `peerDependencies.pinia` is still `3.x` while dev runs pinia 4 — pending owner decision.

## Amendments

None.
