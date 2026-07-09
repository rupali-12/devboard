import { ref } from 'vue'

interface ConfirmOptions {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  type?: 'danger' | 'warning' | 'info'
}

// Module-level state — shared across all components
const show = ref(false)
const options = ref<ConfirmOptions>({
  title: 'Are you sure?',
  message: '',
})
let resolveFn: ((value: boolean) => void) | null = null

export function useConfirm() {
  // Call this to show the dialog
  // Returns a Promise<boolean> — true = confirmed, false = cancelled
  function confirm(opts: ConfirmOptions): Promise<boolean> {
    options.value = opts
    show.value = true

    return new Promise((resolve) => {
      resolveFn = resolve
    })
  }

  function onConfirm() {
    show.value = false
    resolveFn?.(true)
    resolveFn = null
  }

  function onCancel() {
    show.value = false
    resolveFn?.(false)
    resolveFn = null
  }

  return {
    confirmState: { show, options },
    confirm,
    onConfirm,
    onCancel,
  }
}