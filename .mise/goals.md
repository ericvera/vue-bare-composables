[infra] add setValue to useForm so programmatic updates re-validate / Description:

useForm lives in vue-bare-composables. Setting a field from code today means calling form.getListeners(field)['update:modelValue'](value), because only the listener clears the global error and re-checks a field error that is showing. Assigning values.field.value directly leaves a shown "Requerido" error up until the next save.

Add setValue(key, value) that runs the listener path, then replace the listener calls in hosting/composables/useOrderLocationPopUpPage.ts (setStartDate) with it.

Raised in review of feat/pop-up-config.

## Investigation

- Listener body lives in `getListeners` at `src/useForm.ts:220-249`: early return on unchanged value (`===`, :223), assign (:227), clear global error (:230), re-validate only if an error is showing (:235-241), hide error if changed/cleared (:243-245). Lift into a named `setValue(key, value)` and have `getListeners` delegate to it so both paths stay identical.
- Pattern: helpers are const arrows in the closure (`setError` :65, `setGlobalError` :73), exported in the return object (:258-259). `getProps` (:251) uses the generic `<K extends keyof T>` style.
- Behavior inherited from the listener: same-value is a no-op; value not trimmed (only `validateAll`/submit trim, :136, :199); no validation when no error showing; `internalErrors` updated with `show=false`.
- Tests go in `src/useForm.test.ts` (flat `it()` calls). Model on "should update field value and clear errors on input" (:139-165); add cases for clearing the global error and same-value no-op.
- Docs: `README.md:43-160` documents useForm (destructure example :49, feature list :128-139); add a short `setValue` mention.
- `src/index.ts:2` re-exports all of useForm; no export changes needed.
- Public API addition to the published npm package (v3.6.4); commit as `feat:` for a minor bump.
- The consumer `useOrderLocationPopUpPage.ts` is in a different repo: `/Users/eric/Code/okven/hosting/composables/useOrderLocationPopUpPage.ts` (`setStartDate` :267, listener calls at :268 and :273), depending on `vue-bare-composables@^3.6.4`. It can only switch after this package is released.

## Open questions

- Is the okven `setStartDate` replacement in or out of this run's scope?
