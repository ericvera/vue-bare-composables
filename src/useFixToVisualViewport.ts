import { onUnmounted, ref, Ref, toValue, watchEffect } from 'vue'

export interface UseFixToVisualViewportOptionsBase {
  layoutViewportId: string
}

export interface UseFixToVisualViewportOptionsStatic
  extends UseFixToVisualViewportOptionsBase {
  location: 'bottom' | 'top'
  relativeElement?: never
  distance?: never
}

export interface UseFixToVisualViewportOptionsRelative
  extends UseFixToVisualViewportOptionsBase {
  location: 'above'
  relativeElement: HTMLElement | null
  distance: number
}

export type UseFixToVisualViewportOptions =
  | UseFixToVisualViewportOptionsStatic
  | UseFixToVisualViewportOptionsRelative

const updateElementPositionToViewportChanges = (
  element: HTMLElement | null,
  layoutViewport: HTMLElement | null,
  visualViewport: VisualViewport | null,
  { location, relativeElement, distance }: UseFixToVisualViewportOptions,
) => {
  const elementValue = toValue(element)

  if (
    visualViewport === null ||
    elementValue === null ||
    layoutViewport === null ||
    document.scrollingElement === null
  ) {
    return
  }

  // Ref: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
  // Since the bar is position: fixed we need to offset it by the visual
  // viewport's offset from the layout viewport origin.

  let newValue: number

  switch (location) {
    case 'bottom': {
      const agent = navigator.userAgent.toLowerCase()

      // NOTE: Check this works as gecko is not enough as many browsers use
      // "like Gecko"
      const isGeckoEngine = agent.includes('gecko') && agent.includes('firefox')

      const layoutViewportRect = layoutViewport.getBoundingClientRect()

      // In Gecko (Firefox rendering engine) this difference is necessary,
      // otherwise the bottom calculation is off. The other case was tested for
      // WebKit and Blink engines (iOS browsers and Chromium respectively).
      newValue = isGeckoEngine
        ? Math.max(layoutViewportRect.height - layoutViewportRect.top, 0) -
          visualViewport.offsetTop
        : layoutViewportRect.height -
          visualViewport.height -
          visualViewport.offsetTop
      break
    }
    case 'top':
      newValue = visualViewport.offsetTop * -1
      break
    case 'above': {
      if (relativeElement === null) {
        return
      }

      const computedStyles = window.getComputedStyle(relativeElement)
      const relBottom = parseInt(computedStyles.getPropertyValue('bottom'), 10)
      const relHeight = parseInt(computedStyles.getPropertyValue('height'), 10)

      newValue = relBottom + relHeight + distance

      break
    }
    default: {
      throw new Error(
        `Unexpected location option in useVisualViewportFixed: ${location as string}`,
      )
    }
  }

  requestAnimationFrame(() => {
    if (location === 'bottom' || location === 'above') {
      elementValue.style.bottom = `${newValue.toString()}px`
    } else {
      elementValue.style.top = `${newValue.toString()}px`
    }
  })
}

export const useFixToVisualViewport = (
  elementGetter:
    | (() => HTMLElement | null)
    | (HTMLElement | null)
    | Ref<HTMLElement | null>,
  options: UseFixToVisualViewportOptions | Ref<UseFixToVisualViewportOptions>,
): void => {
  const layoutViewport = ref<HTMLElement | null>(null)
  const visualViewport = ref<VisualViewport | null>(null)
  const observer = ref<MutationObserver | undefined>(undefined)

  const timeout = ref<ReturnType<typeof setTimeout> | undefined>(undefined)

  const updatePosition = () => {
    if (timeout.value !== undefined) {
      clearTimeout(timeout.value)
    }

    timeout.value = setTimeout(() => {
      updateElementPositionToViewportChanges(
        toValue(elementGetter),
        layoutViewport.value,
        visualViewport.value,
        toValue(options),
      )
    }, 100)
  }

  // Initialize events and DOM elements
  watchEffect(() => {
    if (toValue(elementGetter) === null) {
      return
    }

    const optionsValue = toValue(options)

    if (!optionsValue.layoutViewportId) {
      console.error(
        'useFixToVisualViewport: layoutViewportId is not defined in options',
      )
      return
    }

    layoutViewport.value = document.getElementById(
      optionsValue.layoutViewportId,
    )

    if (!layoutViewport.value) {
      throw new Error(
        `Layout viewport element with id "${optionsValue.layoutViewportId}" not found`,
      )
    }

    visualViewport.value = window.visualViewport

    const { location, relativeElement } = optionsValue

    if (location === 'above') {
      if (relativeElement !== null) {
        observer.value = new MutationObserver(() => {
          updatePosition()
        })

        observer.value.observe(relativeElement, {
          childList: false,
          subtree: true,
          attributes: true,
        })

        updatePosition()
      }
    } else {
      window.addEventListener('resize', updatePosition, true)
      window.addEventListener('scroll', updatePosition, true)
      document.scrollingElement?.addEventListener(
        'resize',
        updatePosition,
        true,
      )
      document.scrollingElement?.addEventListener(
        'scroll',
        updatePosition,
        true,
      )
      window.visualViewport?.addEventListener('resize', updatePosition, true)
      window.visualViewport?.addEventListener('scroll', updatePosition, true)
    }
  })

  onUnmounted(() => {
    if (observer.value !== undefined) {
      observer.value.disconnect()
    }

    const optionsValue = toValue(options)

    if (optionsValue.location !== 'above') {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
      document.scrollingElement?.removeEventListener('resize', updatePosition)
      document.scrollingElement?.removeEventListener('scroll', updatePosition)
      window.visualViewport?.removeEventListener('resize', updatePosition)
      window.visualViewport?.removeEventListener('scroll', updatePosition)
    }
  })
}
