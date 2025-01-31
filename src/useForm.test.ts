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
