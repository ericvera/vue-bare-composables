import { ref, watch, type Ref, type UnwrapRef } from 'vue'

type ValueRefs<T> = {
  [key in keyof T]: Ref<UnwrapRef<T[key]>>
}

type ErrorRefs<T> = {
  [key in keyof T]: Ref<string | undefined>
}

type Errors<T> = {
  [key in keyof T]?: string
}

type SetError<T> = (key: keyof T, error: string) => void

type Validator = (
  value: unknown,
) => (string | undefined) | Promise<string | undefined>

type Validators<T> = {
  [key in keyof T]?: Validator
}

interface ErrorSetters<T> {
  setError: SetError<T>
  setGlobalError: (error: string | undefined) => void
}

type GlobalValidator<T> = (
  values: T,
  errorSetters: ErrorSetters<T>,
) => void | Promise<void>

export const useForm = <T extends object>(
  initialValues: T | (() => T),
  options: {
    validate?: Validators<T>
    globalValidate?: GlobalValidator<T>
  } = {},
) => {
  const values: ValueRefs<T> = {} as ValueRefs<T>
  const errors: ErrorRefs<T> = {} as ErrorRefs<T>
  const globalError = ref<string | undefined>()
  const submitting = ref(false)

  let internalErrors: Errors<T> = {}

  const setError = (key: keyof T, error: string | undefined, show = true) => {
    internalErrors[key] = error

    if (show) {
      errors[key].value = error
    }
  }

  const setGlobalError = (error: string | undefined) => {
    globalError.value = error
  }

  const getInitialValues = (): T => {
    if (typeof initialValues === 'function') {
      return initialValues()
    }

    return initialValues
  }

  const setAllValues = (newValues: T) => {
    for (const key in newValues) {
      if (typeof values[key] !== 'undefined') {
        values[key].value = newValues[key] as UnwrapRef<
          T[Extract<keyof T, string>]
        >
        errors[key].value = undefined
      }
    }
  }

  // Reset initial values when they change (should be when loaded)
  watch(
    () => getInitialValues(),
    (initValues) => {
      setAllValues(initValues)
    },
  )

  const reset = () => {
    internalErrors = {}
    globalError.value = undefined

    const initValues = getInitialValues()
    setAllValues(initValues)
  }

  // Creates refs
  const init = () => {
    const initValues = getInitialValues()

    for (const key in initValues) {
      values[key] = ref(initValues[key]) as Ref<
        UnwrapRef<T[Extract<keyof T, string>]>
      >

      errors[key] = ref<string | undefined>(undefined)
    }
  }

  init()

  const validateAll = async () => {
    internalErrors = {}

    for (const key in values) {
      const validator = options.validate?.[key]

      if (typeof validator === 'function') {
        setError(key, await validator(values[key].value), false)
      }
    }

    // Only run the global validator if there are no errors resulting from
    // the field validators.
    if (!hasErrors()) {
      await options.globalValidate?.(getData(), { setError, setGlobalError })
    }
  }

  const hasErrors = () =>
    Object.values(internalErrors).some((error) => error !== undefined)

  const showErrors = () => {
    for (const key in internalErrors) {
      errors[key].value = internalErrors[key]
    }
  }

  const getData = (): T => {
    const data = {} as T

    for (const key in values) {
      data[key] = values[key].value as T[typeof key]
    }

    return data
  }

  return {
    state: {
      submitting,
      values,
      errors,
      globalError,
    },

    reset,

    handleSubmit: (callback: (data: T) => Promise<void>) => async () => {
      submitting.value = true
      await validateAll()

      if (hasErrors()) {
        showErrors()
        submitting.value = false
        return
      }

      const data = getData()
      await callback(data)
      submitting.value = false
    },

    getListeners: (key: keyof T) => {
      return {
        'update:modelValue': async (value: UnwrapRef<T[typeof key]>) => {
          if (values[key].value === value) {
            return
          }

          values[key].value = value

          // Always clear the global error when a field is updated.
          setGlobalError(undefined)

          // In the case where there is already an error being displayed,
          // validate the field and remove the error only when the error
          // is addressed or chanages.
          if (errors[key].value) {
            const validator = options.validate?.[key]

            if (typeof validator === 'function') {
              // Only update visible error if the error has changed
              setError(key, await validator(value), false)
            }

            if (internalErrors[key] !== errors[key].value) {
              errors[key].value = undefined
            }
          }
        },
      }
    },

    getProps: <TKey extends keyof T>(key: TKey) => {
      return {
        name: key,
        value: values[key].value,
      }
    },

    setError,
    setGlobalError,
  }
}
