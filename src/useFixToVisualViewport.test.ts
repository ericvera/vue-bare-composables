import { mount } from '@vue/test-utils'
import { assert, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { useFixToVisualViewport } from './useFixToVisualViewport.js'

let originalMutationObserver: typeof window.MutationObserver

beforeAll(() => {
  originalMutationObserver = window.MutationObserver
})

afterAll(() => {
  window.MutationObserver = originalMutationObserver
})

type WrapperOptions =
  | {
      element?: HTMLElement | null
      layoutViewportId?: string
      location: 'bottom' | 'top'
      relativeElement?: never
      distance?: never
      useRefOptions?: boolean
    }
  | {
      element?: HTMLElement | null
      layoutViewportId?: string
      location: 'above'
      relativeElement: HTMLElement | null
      distance: number
      useRefOptions?: boolean
    }

const createWrapper = (options: WrapperOptions) => {
  const {
    element = document.createElement('div'),
    layoutViewportId = 'viewport',
    location,
    useRefOptions = false,
  } = options

  const TestComponent = defineComponent({
    setup() {
      const elementRef = ref(element)

      if (location === 'above') {
        if (useRefOptions) {
          const optionsRef = ref({
            layoutViewportId,
            location,
            relativeElement: options.relativeElement,
            distance: options.distance,
          })
          useFixToVisualViewport(elementRef, optionsRef)
        } else {
          useFixToVisualViewport(elementRef, {
            layoutViewportId,
            location,
            relativeElement: options.relativeElement,
            distance: options.distance,
          })
        }
      } else {
        if (useRefOptions) {
          const optionsRef = ref({
            layoutViewportId,
            location,
          })
          useFixToVisualViewport(elementRef, optionsRef)
        } else {
          useFixToVisualViewport(elementRef, {
            layoutViewportId,
            location,
          })
        }
      }

      return () => h('div')
    },
  })

  return mount(TestComponent)
}

it('should handle null element', () => {
  expect(() => {
    const wrapper = createWrapper({
      element: null,
      location: 'bottom',
    })
    wrapper.unmount()
  }).not.toThrow()
})

it('should handle missing layout viewport element', () => {
  expect(() => {
    createWrapper({
      layoutViewportId: 'non-existent',
      location: 'bottom',
    })
  }).toThrow('Layout viewport element with id "non-existent" not found')
})

it('should set up event listeners for bottom position', () => {
  const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const wrapper = createWrapper({ location: 'bottom' })

  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function),
    true,
  )
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'scroll',
    expect.any(Function),
    true,
  )

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should set up mutation observer for above position', () => {
  const viewport = document.createElement('div')
  const relativeElement = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const mockObserve = vi.fn()
  const mockDisconnect = vi.fn()
  const MockMutationObserver = vi.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
  }))

  vi.stubGlobal('MutationObserver', MockMutationObserver)

  const wrapper = createWrapper({
    location: 'above',
    relativeElement,
    distance: 10,
  })

  expect(MockMutationObserver).toHaveBeenCalled()
  expect(mockObserve).toHaveBeenCalledWith(relativeElement, {
    childList: false,
    subtree: true,
    attributes: true,
  })

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should handle cleanup on unmount for bottom position', () => {
  const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const wrapper = createWrapper({ location: 'bottom' })
  wrapper.unmount()

  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function),
  )
  expect(removeEventListenerSpy).toHaveBeenCalledWith(
    'scroll',
    expect.any(Function),
  )

  document.body.removeChild(viewport)
})

it('should handle Firefox specific calculations', () => {
  vi.useFakeTimers()
  const viewport = document.createElement('div')

  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const userAgentGetter = vi.spyOn(window.navigator, 'userAgent', 'get')

  userAgentGetter.mockReturnValue(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/115.0',
  )

  const getBoundingClientRectSpy = vi.spyOn(viewport, 'getBoundingClientRect')

  getBoundingClientRectSpy.mockReturnValue({
    height: 1000,
    top: 100,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  })

  const element = document.createElement('div')
  const wrapper = createWrapper({
    element,
    location: 'bottom',
  })

  // Trigger a resize to force position update
  window.dispatchEvent(new Event('resize'))
  vi.runAllTimers()

  expect(element.style.bottom).toBeDefined()

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should set up event listeners for top position', () => {
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const element = document.createElement('div')
  const wrapper = createWrapper({
    element,
    location: 'top',
  })

  // Verify top position is set correctly
  window.dispatchEvent(new Event('resize'))
  vi.runAllTimers()
  // Since visualViewport.offsetTop is 0 in mock
  expect(element.style.top).toBe('0px')

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should debounce position updates', () => {
  vi.useFakeTimers()
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const element = document.createElement('div')
  const wrapper = createWrapper({
    element,
    location: 'bottom',
  })

  // Trigger multiple updates
  window.dispatchEvent(new Event('resize'))
  window.dispatchEvent(new Event('resize'))
  window.dispatchEvent(new Event('resize'))

  // Should only update once after debounce
  vi.runAllTimers()
  expect(element.style.bottom).toBeDefined()

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should set up visual viewport event listeners', () => {
  if (!window.visualViewport) {
    assert.fail('window.visualViewport is not defined')
  }

  const visualViewportAddEventListenerSpy = vi.spyOn(
    window.visualViewport,
    'addEventListener',
  )
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const wrapper = createWrapper({ location: 'bottom' })

  expect(visualViewportAddEventListenerSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function),
    true,
  )
  expect(visualViewportAddEventListenerSpy).toHaveBeenCalledWith(
    'scroll',
    expect.any(Function),
    true,
  )

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should handle cleanup on unmount for above position', () => {
  const viewport = document.createElement('div')
  const relativeElement = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const mockDisconnect = vi.fn()
  const MockMutationObserver = vi.fn(() => ({
    observe: vi.fn(),
    disconnect: mockDisconnect,
  }))

  vi.stubGlobal('MutationObserver', MockMutationObserver)

  const wrapper = createWrapper({
    location: 'above',
    relativeElement,
    distance: 10,
  })

  wrapper.unmount()
  expect(mockDisconnect).toHaveBeenCalled()

  document.body.removeChild(viewport)
})

it('should handle ref-based options for bottom position', () => {
  const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const wrapper = createWrapper({
    location: 'bottom',
    useRefOptions: true,
  })

  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'resize',
    expect.any(Function),
    true,
  )
  expect(addEventListenerSpy).toHaveBeenCalledWith(
    'scroll',
    expect.any(Function),
    true,
  )

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should handle ref-based options for above position', () => {
  const viewport = document.createElement('div')
  const relativeElement = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const mockObserve = vi.fn()
  const mockDisconnect = vi.fn()
  const MockMutationObserver = vi.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
  }))

  vi.stubGlobal('MutationObserver', MockMutationObserver)

  const wrapper = createWrapper({
    location: 'above',
    relativeElement,
    distance: 10,
    useRefOptions: true,
  })

  expect(MockMutationObserver).toHaveBeenCalled()
  expect(mockObserve).toHaveBeenCalledWith(relativeElement, {
    childList: false,
    subtree: true,
    attributes: true,
  })

  wrapper.unmount()
  document.body.removeChild(viewport)
})

it('should update when ref options change', () => {
  vi.useFakeTimers()
  const viewport = document.createElement('div')
  viewport.id = 'viewport'
  document.body.appendChild(viewport)

  const TestComponentWithChangingOptions = defineComponent({
    setup() {
      const element = ref(document.createElement('div'))

      // Use a properly typed options ref that can accept both location values
      const options = ref({
        layoutViewportId: 'viewport',
        location: 'bottom' as 'bottom' | 'top',
      })

      useFixToVisualViewport(element, options)

      // Change options after mounting
      setTimeout(() => {
        options.value = {
          layoutViewportId: 'viewport',
          location: 'top',
        }
      }, 100)

      return () => h('div')
    },
  })

  const wrapper = mount(TestComponentWithChangingOptions)

  // Run initial timers
  vi.advanceTimersByTime(100)

  // Trigger a resize to force position update
  window.dispatchEvent(new Event('resize'))
  vi.runAllTimers()

  wrapper.unmount()
  document.body.removeChild(viewport)
})
