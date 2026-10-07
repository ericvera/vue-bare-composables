# Review

- 01_01 (8dbc3a7 `feat!: require Node.js 24`, `BREAKING CHANGE:` footer): Node 22 → 24 in `.github/workflows/publish.yml:26` and `.github/workflows/dependabot.yml:30` (`node-version: 24`), `package.json:15` (`engines.node` `>=24`), `README.md:32` ("Node.js 24 or higher"). Verify: `git show 8dbc3a7 --stat` touches only those 4 files; `git grep -nE 'node-version|"node":|Node\.js 2'` shows only 24s; `yarn lint && yarn build && yarn prettier --check . && yarn test` pass.
- Review fix (664b9c3 `chore: update dependencies`): your package updates, plus fixes. Typed ref in `useFixToVisualViewport.test.ts` instead of an `as`, removed the unused eslint-disable in `vite.config.ts`, dropped `esModuleInterop: false` from `tsconfig.json` (dist byte-identical), formatted `useFixToVisualViewport.ts`, added `@vue/devtools-api` dev dep (pinia 4 no longer bundles it). Verify: all four quality commands pass.
- 02_01 (a567b52 `feat!: require pinia 4`, `BREAKING CHANGE:` footer): `peerDependencies.pinia` `3.x` → `4.x` in `package.json`, matching one-line `yarn.lock` workspace change, README Requirements gains "Pinia 4.x (only for useSnackbarStore)". Verify: `yarn install --immutable` and all quality commands pass.

## Open assumptions

- Raising `engines.node` is breaking for Node 22 consumers, so it releases as a major via `feat!:` + `BREAKING CHANGE:`. The PR title must also be `feat!: require Node.js 24` so a squash merge bumps major.
- The release is one major covering both Node 24 and pinia 4.

## Amendments

- 2026-10-07 Require pinia 4 only, and update references — tasks: 02_01
