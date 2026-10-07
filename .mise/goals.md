[infra] add setValue to useForm so programmatic updates re-validate / Description:

useForm lives in vue-bare-composables. Setting a field from code today means calling form.getListeners(field)['update:modelValue'](value), because only the listener clears the global error and re-checks a field error that is showing. Assigning values.field.value directly leaves a shown "Requerido" error up until the next save.

Add setValue(key, value) that runs the listener path, then replace the listener calls in hosting/composables/useOrderLocationPopUpPage.ts (setStartDate) with it.

Raised in review of feat/pop-up-config.
