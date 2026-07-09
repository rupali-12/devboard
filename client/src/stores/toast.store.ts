import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  function add(message: string, type: ToastType = 'success', duration = 3000) {
    const id = Math.random().toString(36).slice(2)
    toasts.value.push({ id, message, type, duration })

    // Auto remove after duration
    setTimeout(() => remove(id), duration)
  }

  function remove(id: string) {
    toasts.value = toasts.value.filter((t) => t.id !== id)
  }

  // Shorthand helpers
  const success = (msg: string) => add(msg, 'success')
  const error   = (msg: string) => add(msg, 'error', 4000)
  const info    = (msg: string) => add(msg, 'info')
  const warning = (msg: string) => add(msg, 'warning')

  return { toasts, add, remove, success, error, info, warning }
})