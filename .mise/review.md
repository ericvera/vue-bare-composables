# Review

- 01_01 (8dbc3a7 `feat!: require Node.js 24`, `BREAKING CHANGE:` footer): Node 22 → 24 in `.github/workflows/publish.yml:26` and `.github/workflows/dependabot.yml:30` (`node-version: 24`), `package.json:15` (`engines.node` `>=24`), `README.md:32` ("Node.js 24 or higher"). Verify: `git show 8dbc3a7 --stat` touches only those 4 files; `git grep -nE 'node-version|"node":|Node\.js 2'` shows only 24s; `yarn lint && yarn build && yarn prettier --check . && yarn test` pass.

## Open assumptions

- Raising `engines.node` is breaking for Node 22 consumers, so it releases as a major via `feat!:` + `BREAKING CHANGE:`. The PR title must also be `feat!: require Node.js 24` so a squash merge bumps major.

## Amendments

None.
