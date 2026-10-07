Never open a pull request for, or merge into another branch, any branch whose tree contains `.mise/` — that work is still in flight; run `/mise:next` on that branch to finish it first.

## Commits and releases

Every push to `main` runs `.github/workflows/publish.yml`, which uses `TriPSs/conventional-changelog-action` to pick the next version from Conventional Commit subjects since the last tag, then publishes to npm. Commits that don't match the convention don't count toward the bump.

- Code commits use a bare Conventional Commit subject, with nothing in front of the type: `feat: add setValue to useForm`, not `Task 01_01: feat: …` or `Fix: …`.
- `feat:` adds public API (minor bump), `fix:` corrects behavior (patch bump), `feat!:` or a `BREAKING CHANGE:` footer breaks API (major bump), and `chore:`/`docs:`/`test:`/`refactor:` release nothing.
- PR titles use the same form as the main change, so the version comes out right if the PR is squash-merged.
