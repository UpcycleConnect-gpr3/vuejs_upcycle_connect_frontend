import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastKind = 'success' | 'error' | 'info'

export interface Toast {
  id: number
  kind: ToastKind
  message: string
}

export const useToastsStore = defineStore('toasts', () => {
  const toasts = ref<Toast[]>([])

  const remove = (id: number) => {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  const push = (message: string, kind: ToastKind = 'info', timeout = 4000) => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    toasts.value.push({ id, kind, message })
    if (timeout > 0) {
      setTimeout(() => remove(id), timeout)
    }
    return id
  }

  const success = (message: string) => push(message, 'success')
  const error = (message: string) => push(message, 'error')
  const info = (message: string) => push(message, 'info')

  return { toasts, push, success, error, info, remove }
})
