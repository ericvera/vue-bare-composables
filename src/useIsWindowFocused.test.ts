import { mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { defineComponent, h, nextTick } from 'vue'
import { useIsWindowFocused } from './useIsWindowFocused.js'

const createWrapper = () => {
  const TestComponent = defineComponent({
    setup() {
      const isFocused = useIsWindowFocused()
      return () => h('div', { 'data-focused': isFocused.value })
    },
  })

  return mount(TestComponent)
}

it('should initialize with correct focus state', () => {
  const hasFocusSpy = vi.spyOn(document, 'hasFocus')
  hasFocusSpy.mockReturnValue(true)

  const wrapper = createWrapper()
  expect(wrapper.attributes('data-focused')).toBe('true')

  hasFocusSpy.mockReturnValue(false)
  const wrapper2 = createWrapper()
  expect(wrapper2.attributes('data-focused')).toBe('false')

  wrapper.unmount()
  wrapper2.unmount()
  hasFocusSpy.mockRestore()
})

it('should update state on window focus/blur events', async () => {
  const wrapper = createWrapper()

  // Simulate blur
  window.dispatchEvent(new Event('blur'))
  await nextTick()
  expect(wrapper.attributes('data-focused')).toBe('false')

  // Simulate focus
  window.dispatchEvent(new Event('focus'))
  await nextTick()
  expect(wrapper.attributes('data-focused')).toBe('true')

  wrapper.unmount()
})

it('should clean up event listeners on unmount', () => {
  const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  const wrapper = createWrapper()

  wrapper.unmount()

  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'focus',
    expect.any(Function),
  )
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'blur',
    expect.any(Function),
  )

  removeEventListenerSpy.mockRestore()
})
