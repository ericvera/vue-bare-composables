import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, expect, it, vi } from 'vitest'
import { useSnackbarStore } from './useSnackbarStore.js'

beforeEach(() => {
  setActivePinia(createPinia())
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

it('should initialize with empty state', async () => {
  const store = useSnackbarStore()

  await vi.waitFor(() => {
    expect(store.message).toBeUndefined()
    expect(store.actions).toBeUndefined()
  })
})

it('should enqueue and show a message without actions', async () => {
  const store = useSnackbarStore()
  store.enqueueMessage({ message: 'Test message' })

  // Message shouldn't show immediately
  expect(store.message).toBeUndefined()

  // Advance timer to trigger the watch callback and dequeue
  vi.advanceTimersByTime(1000)

  await vi.waitFor(() => {
    expect(store.message).toBe('Test message')
    expect(store.actions).toBeUndefined()
  })
})

it('should dismiss message after timeout', async () => {
  const store = useSnackbarStore()
  store.enqueueMessage({ message: 'Test message' })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('Test message')
  })

  // Default timeout
  vi.advanceTimersByTime(8000)

  await vi.waitFor(() => {
    expect(store.message).toBeUndefined()
    expect(store.actions).toBeUndefined()
  })
})

it('should handle custom actions', async () => {
  const store = useSnackbarStore()

  const customAction = {
    text: 'Custom',
    callback: vi.fn(),
  }

  store.enqueueMessage({
    message: 'Test message',
    actions: [customAction],
  })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.actions).toHaveLength(1)
    expect(store.actions?.[0]).toEqual(customAction)

    store.actions?.[0]?.callback()
    expect(customAction.callback).toHaveBeenCalled()
  })
})

it('should handle route-specific messages', async () => {
  const store = useSnackbarStore()
  store.setRouteFullPath('/home')

  // Enqueue messages for different routes
  store.enqueueMessage({
    message: 'Home message',
    route: '/home',
  })
  store.enqueueMessage({
    message: 'Other message',
    route: '/other',
  })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('Home message')
  })

  // Change route
  store.setRouteFullPath('/other')
  store.dismiss()

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('Other message')
  })
})

it('should clean up old messages', async () => {
  const store = useSnackbarStore()
  const now = Date.now()
  vi.setSystemTime(now)

  store.enqueueMessage({ message: 'Old message' })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('Old message')
  })

  // After 31 seconds, the message should be cleaned up
  vi.advanceTimersByTime(31000)

  store.enqueueMessage({ message: 'New message' })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('New message')
  })
})

it('should manually dismiss message', async () => {
  const store = useSnackbarStore()
  store.enqueueMessage({ message: 'Test message' })

  vi.advanceTimersByTime(600)

  await vi.waitFor(() => {
    expect(store.message).toBe('Test message')
  })

  store.dismiss()

  await vi.waitFor(() => {
    expect(store.message).toBeUndefined()
    expect(store.actions).toBeUndefined()
  })
})
