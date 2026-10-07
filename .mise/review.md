# Review

## Tasks

- 01_01 (3e79700): moved the `getListeners` update body into an exported generic `setValue<K>(key, value)` in `src/useForm.ts`; the listener now delegates to it. Added 6 `setValue` tests to `src/useForm.test.ts` and a "Programmatic updates" bullet to `README.md`. Verify: `yarn test`; the existing listener test still passes unchanged.
- Baseline fix (c05b614): added `.claude/` to `.prettierignore` so `yarn prettier --check .` skips the gitignored local settings file.

## Open assumptions

- Signature `<K extends keyof T>(key: K, value: UnwrapRef<T[K]>) => Promise<void>`, matching `getProps`; `getListeners` is now generic too.
- Keeps listener behavior unchanged: same-value no-op, no trimming, validates only when an error is showing, clears the global error.
- Ships as a `feat:` commit (minor bump).
- Out of scope: switching okven `useOrderLocationPopUpPage.ts` (`setStartDate`, :268 and :273) to `setValue` after release.

## Amendments

- None.
