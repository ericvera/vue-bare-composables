# 01_01 Add `setValue` to useForm

## Goal

Add an exported `setValue(key, value)` to the object returned by `useForm` in `/Users/eric/Code/vue-bare-composables/src/useForm.ts`. It sets a field from code with exactly the behavior of the `update:modelValue` listener (clears the global error, re-validates a field whose error is showing). `getListeners` delegates to it so both paths stay identical. Add tests and a short README mention.

## Files to modify/create

- `src/useForm.ts`
- `README.md`
- `src/useForm.test.ts` (tests)

## Background

- No prior tasks. This is a single-task change in the `vue-bare-composables` npm package (currently v3.6.4).
- Today the only way to set a field programmatically with error handling is `form.getListeners(field)['update:modelValue'](value)`. Assigning `state.values.field.value` directly leaves a shown error (e.g. "Requerido") up until the next save.
- The listener body lives inside `getListeners` at `src/useForm.ts:220-249`, in the returned object literal that starts at `src/useForm.ts:175`:
  - early return when `values[key].value === value` (:223)
  - assign `values[key].value = value` (:227)
  - `setGlobalError(undefined)` (:230)
  - only if `errors[key].value` is truthy (an error is showing): run `options.validate?.[key]` if it is a function and store the result with `setError(key, result, false)` (:235-241); then if `internalErrors[key] !== errors[key].value`, set `errors[key].value = undefined` (:243-245)
- Patterns to follow:
  - Helpers are `const` arrows defined in the `useForm` closure before `return` (`setError` at `src/useForm.ts:65`, `setGlobalError` at :73) and exposed in the return object by shorthand (:258-259).
  - `getProps` at `src/useForm.ts:251` uses the generic `<TKey extends keyof T>(key: TKey)` style.
- `src/index.ts:2` re-exports all of `useForm`; no export changes needed.
- Design decisions (approved in goals):
  - Signature: `const setValue = async <K extends keyof T>(key: K, value: UnwrapRef<T[K]>): Promise<void>`.
  - Behavior is the listener's, unchanged: same-value is a no-op; the value is not trimmed (only validation/submit trim, :136, :199); no validation when no error is showing; `internalErrors` is updated with `show = false`.
  - Ships as a `feat:` commit (minor version bump).
  - Out of scope: switching the consumer in the separate okven repo (`hosting/composables/useOrderLocationPopUpPage.ts`, `setStartDate`) to `setValue`. The owner does that after release.

## Guides

None (the mise config defines no Skills & guides).

## Implementation details

1. In `src/useForm.ts`, after `setGlobalError` (around :75) and before `return {` (:175), define `setValue` as an `async` generic const arrow and move the listener body into it verbatim, including the comments (fix the existing typo "chanages" to "changes" while moving).
2. Replace the `getListeners` listener body with delegation:
   ```ts
   getListeners: <K extends keyof T>(key: K) => {
     return {
       'update:modelValue': (value: UnwrapRef<T[K]>) => setValue(key, value),
     }
   },
   ```
   Keep the listener returning the promise so existing `await listeners['update:modelValue'](...)` callers still wait for validation. Making `getListeners` generic is fine; if it causes a type error anywhere, keep `(key: keyof T)` and type the value as `UnwrapRef<T[typeof key]>` as before.
3. Add `setValue` to the return object next to `setError` and `setGlobalError`.
4. `README.md`: add `setValue` to the destructure example (:49) is optional; required is a feature-list bullet in the list at :128-139, e.g. "**Programmatic updates**: `setValue(key, value)` sets a field from code with the same behavior as user input (clears the global error and re-validates a field whose error is showing)". Keep it short.

## Gotchas

- Do not change listener behavior: no trimming, no validation when no error is showing, `===` same-value early return (same value must not clear the global error either).
- `setValue` must be defined before the return object because `getListeners` references it; defining it inside the object literal would not be reachable by name.
- Run `yarn prettier --write` on changed files; Check runs `yarn prettier --check .`.
- Do not touch the okven repo.

## Verification

- Run `yarn lint`, `yarn build`, `yarn prettier --check .`, `yarn test`; all must pass.
- Existing test "should update field value and clear errors on input" (`src/useForm.test.ts:139-165`) must pass unchanged (covers the delegating listener).
- Add flat `it()` tests in `src/useForm.test.ts` after that test, modeled on it:
  - `setValue` updates the value and clears a shown field error: make `name` error show via `handleSubmit` with `name = ''`, then `await setValue('name', 'John Doe')`; expect value `'John Doe'` and `state.errors.name.value` undefined.
  - `setValue` keeps a shown error when the new value still fails validation the same way (e.g. error showing for `''`, `setValue('name', 'x')` with a validator that returns 'Name is required' for both) and hides it when the validator's message changes. At minimum cover the "still same error stays shown" case.
  - `setValue` clears the global error: use a `globalValidate` like the test at `src/useForm.test.ts:106-126` to set `state.globalError`, then `await setValue('age', 20)`; expect `state.globalError.value` undefined.
  - Same-value no-op: set the global error as above, then `await setValue('age', state.values.age.value)`; expect `state.globalError.value` still set.
  - `setValue` does not validate when no error is showing: with a `vi.fn()` validator on `name`, `await setValue('name', '')`; expect the validator not called and `state.errors.name.value` undefined.
