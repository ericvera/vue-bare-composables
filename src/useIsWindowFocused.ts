import { onMounted, onUnmounted, ref } from 'vue'

export const useIsWindowFocused = () => {
  const isFocused = ref(document.hasFocus())

  const focused = () => {
    isFocused.value = true
  }

  const blurred = () => {
    isFocused.value = false
  }

  onMounted(() => {
    window.addEventListener('focus', focused)
    window.addEventListener('blur', blurred)
  })

  onUnmounted(() => {
    window.removeEventListener('focus', focused)
    window.removeEventListener('blur', blurred)
  })

  return isFocused
}
