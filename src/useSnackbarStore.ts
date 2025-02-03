import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface SnackbarAction {
  text: string
  callback: () => void
}

export interface SnackbarData {
  message: string
  actions?: SnackbarAction[]
  route?: string
}

export interface SnackbarQueueItem extends SnackbarData {
  date: number
}

export const useSnackbarStore = defineStore(
  'vue-bare-composables-snackbar',
  () => {
    const actions = ref<SnackbarAction[]>()
    const message = ref<string>()

    const queue = ref<SnackbarQueueItem[]>([])

    const timeoutRef = ref<ReturnType<typeof setTimeout>>()

    const routeFullPath = ref<string>()

    const dismiss = () => {
      clearTimeout(timeoutRef.value)
      message.value = undefined
      actions.value = undefined
    }

    const enqueueMessage = (data: SnackbarData) => {
      queue.value = [...queue.value, { ...data, date: Date.now() }]
    }

    const showNext = (next: SnackbarQueueItem) => {
      actions.value = next.actions
      message.value = next.message

      timeoutRef.value = setTimeout(dismiss, 6000)
    }

    const dequeue = () => {
      // In case there is a bug somewhere, we should remove the old items so tha
      // they don't show up at undesirable times. Remove them after 30 seconds.
      for (let i = 0; i < queue.value.length; i++) {
        const item = queue.value[i]

        if (item === undefined) {
          throw new Error('Item is undefined')
        }

        if (item.date + 30000 < Date.now()) {
          queue.value = queue.value.slice(0, i).concat(queue.value.slice(i + 1))
        }
      }

      // Find the index of the first item that can be shown
      for (let i = 0; i < queue.value.length; i++) {
        const next = queue.value[i]

        if (next === undefined) {
          throw new Error('Next is undefined')
        }

        if (next.route === undefined || next.route === routeFullPath.value) {
          showNext(next)
          queue.value = queue.value.slice(0, i).concat(queue.value.slice(i + 1))
          return
        }
      }
    }

    watch([message, queue, routeFullPath], () => {
      if (message.value === undefined && queue.value.length > 0) {
        setTimeout(dequeue, 600)
      }
    })

    const setRouteFullPath = (fullPath: string) => {
      routeFullPath.value = fullPath
    }

    return {
      message,
      actions,
      enqueueMessage,
      dismiss,
      setRouteFullPath,
    }
  },
)
