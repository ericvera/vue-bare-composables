import { expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import { useForm } from './useForm.js'

interface TestForm {
  name: string
  email: string
  age: number
}

const initialValues: TestForm = {
  name: 'John',
  email: 'john@example.com',
  age: 25,
}

it('should initialize with correct values', () => {
  const { state } = useForm<TestForm>(initialValues)

  expect(state.values.name.value).toBe('John')
  expect(state.values.email.value).toBe('john@example.com')
  expect(state.values.age.value).toBe(25)
})

it('should initialize with function values', () => {
  const { state } = useForm<TestForm>(() => initialValues)

  expect(state.values.name.value).toBe('John')
  expect(state.values.email.value).toBe('john@example.com')
  expect(state.values.age.value).toBe(25)
})

it('should reset form to initial values', () => {
  const { state, reset } = useForm<TestForm>(initialValues)

  // Change values
  state.values.name.value = 'Jane'
  state.values.email.value = 'jane@example.com'

  // Reset form
  reset()

  expect(state.values.name.value).toBe('John')
  expect(state.values.email.value).toBe('john@example.com')
})

it('should handle field validation', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    validate: {
      name: (value: unknown) => (value === '' ? 'Name is required' : undefined),
      email: (value: unknown) =>
        typeof value !== 'string' || !value.includes('@')
          ? 'Invalid email'
          : undefined,
    },
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Trigger validation by submitting with invalid values
  state.values.name.value = ''
  state.values.email.value = 'invalid-email'

  await onSubmit()

  expect(state.errors.name.value).toBe('Name is required')
  expect(state.errors.email.value).toBe('Invalid email')
  expect(submit).not.toHaveBeenCalled()
})

it('should handle global validation', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    globalValidate: (values: TestForm, { setError, setGlobalError }) => {
      if (values.age < 18) {
        setError('age', 'Must be 18 or older')
        setGlobalError('Form has validation errors')
      }
    },
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  state.values.age.value = 16

  await onSubmit()

  expect(state.errors.age.value).toBe('Must be 18 or older')
  expect(state.globalError.value).toBe('Form has validation errors')
  expect(submit).not.toHaveBeenCalled()
})

it('should handle successful submission', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues)
  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  await onSubmit()

  expect(submit).toHaveBeenCalledWith(initialValues)
  expect(state.submitting.value).toBe(false)
})

it('should update field value and clear errors on input', async () => {
  const { state, handleSubmit, getListeners } = useForm<TestForm>(
    initialValues,
    {
      validate: {
        name: (value: unknown) =>
          value === '' ? 'Name is required' : undefined,
      },
    },
  )

  // Set error first
  const onSubmit = handleSubmit(async () => {})
  state.values.name.value = ''
  await onSubmit()
  expect(state.errors.name.value).toBe('Name is required')

  // Update value through listener
  const listeners = getListeners('name')
  await listeners['update:modelValue']('John Doe')
  await nextTick()

  expect(state.values.name.value).toBe('John Doe')
  expect(state.errors.name.value).toBeUndefined()
})

it('should provide correct props for form fields', () => {
  const { getProps } = useForm<TestForm>(initialValues)
  const nameProps = getProps('name')

  expect(nameProps.name).toBe('name')
  expect(nameProps.value).toBe('John')
})

it('should trim strings during validation when trimStrings is enabled', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    trimStrings: true,
    validate: {
      name: (value: unknown) =>
        typeof value === 'string' && value.length > 4
          ? 'Name is too long'
          : undefined,
    },
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set value with leading/trailing spaces
  state.values.name.value = '  John  '
  await onSubmit()

  // Should pass validation because spaces are trimmed
  expect(state.errors.name.value).toBeUndefined()
  expect(submit).toHaveBeenCalled()
})

it('should trim strings in submitted data when trimStrings is enabled', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    trimStrings: true,
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set values with leading/trailing spaces
  state.values.name.value = '  John  '
  state.values.email.value = '  john@example.com  '
  await onSubmit()

  // Check that the submitted data has trimmed strings
  expect(submit).toHaveBeenCalledWith({
    name: 'John',
    email: 'john@example.com',
    age: 25,
  })
})

it('should not affect non-string values when trimStrings is enabled', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    trimStrings: true,
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set values with leading/trailing spaces
  state.values.name.value = '  John  '
  state.values.email.value = '  john@example.com  '
  state.values.age.value = 30
  await onSubmit()

  // Check that non-string values remain unchanged
  expect(submit).toHaveBeenCalledWith({
    name: 'John',
    email: 'john@example.com',
    age: 30,
  })
})

it('should not trim strings by default', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    validate: {
      name: (value: unknown) =>
        typeof value === 'string' && value.length > 4
          ? 'Name is too long'
          : undefined,
    },
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set value with leading/trailing spaces
  state.values.name.value = '  John  '
  await onSubmit()

  // Should fail validation because spaces are not trimmed
  expect(state.errors.name.value).toBe('Name is too long')
  expect(submit).not.toHaveBeenCalled()
})

it('should respect trimStringExclude when trimming strings', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    trimStrings: true,
    trimStringExclude: ['name'], // Exclude name from trimming
    validate: {
      name: (value: unknown) =>
        typeof value === 'string' && value.length > 4
          ? 'Name is too long'
          : undefined,
    },
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set values with leading/trailing spaces
  state.values.name.value = '  John  '
  state.values.email.value = '  john@example.com  '
  await onSubmit()

  // Name should not be trimmed (validation should fail)
  expect(state.errors.name.value).toBe('Name is too long')
  expect(submit).not.toHaveBeenCalled()
})

it('should handle empty trimStringExclude array', async () => {
  const { state, handleSubmit } = useForm<TestForm>(initialValues, {
    trimStrings: true,
    trimStringExclude: [], // Empty array should not exclude any fields
  })

  const submit = vi.fn()
  const onSubmit = handleSubmit(submit)

  // Set values with leading/trailing spaces
  state.values.name.value = '  John  '
  state.values.email.value = '  john@example.com  '
  await onSubmit()

  // All string fields should be trimmed
  expect(submit).toHaveBeenCalledWith({
    name: 'John',
    email: 'john@example.com',
    age: 25,
  })
})

// Type tests
it('should enforce type constraints for trimStringExclude', () => {
  // This should compile
  useForm<TestForm>(initialValues, {
    trimStrings: true,
    trimStringExclude: ['name'],
  })

  // This should compile
  useForm<TestForm>(initialValues, {
    trimStrings: false,
  })

  // This should compile
  useForm<TestForm>(initialValues, {
    trimStrings: false,
    // @ts-expect-error trimStringExclude should not be allowed when trimStrings is false
    trimStringExclude: ['name'],
  })

  // This should compile
  useForm<TestForm>(initialValues, {
    trimStrings: true,
    // @ts-expect-error trimStringExclude should only accept keys of T
    trimStringExclude: ['invalidKey'],
  })
})
