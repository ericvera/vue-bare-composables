import { vi } from 'vitest'

// Mock requestAnimationFrame and related functions
window.requestAnimationFrame = vi.fn((callback: (time: number) => void) => {
  callback(0)
  return 0
})

window.cancelAnimationFrame = vi.fn()

// Mock visualViewport
Object.defineProperty(window, 'visualViewport', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    height: 800,
    width: 600,
    offsetTop: 0,
    offsetLeft: 0,
  },
  writable: true,
})

// Mock scrollingElement
Object.defineProperty(document, 'scrollingElement', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  writable: true,
})
