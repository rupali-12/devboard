<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 z-[60] flex items-center justify-center p-4"
      >
        <!-- Backdrop -->
        <div
          class="absolute inset-0 bg-black/40 backdrop-blur-sm"
          @click="$emit('cancel')"
        />

        <!-- Modal -->
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 overflow-hidden">

          <!-- Top accent bar — color based on type -->
          <div :class="['h-1 w-full', accentColor]" />

          <!-- Content -->
          <div class="p-6">

            <!-- Icon -->
            <div :class="['w-12 h-12 rounded-2xl flex items-center justify-center mb-4', iconBg]">
              <svg
                v-if="type === 'danger'"
                :class="['w-6 h-6', iconColor]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <svg
                v-else
                :class="['w-6 h-6', iconColor]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <!-- Title -->
            <h3 class="text-lg font-bold text-gray-900 mb-1">
              {{ title }}
            </h3>

            <!-- Message -->
            <p class="text-sm text-gray-500 leading-relaxed">
              {{ message }}
            </p>

          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 px-6 pb-6">
            <!-- Cancel -->
            <button
              class="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              @click="$emit('cancel')"
            >
              {{ cancelLabel }}
            </button>

            <!-- Confirm -->
            <button
              :class="[
                'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors',
                confirmBtnColor
              ]"
              @click="$emit('confirm')"
            >
              {{ confirmLabel }}
            </button>
          </div>

        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onMounted, onUnmounted } from 'vue'

const props = withDefaults(
  defineProps<{
    show: boolean
    title: string
    message: string
    confirmLabel?: string
    cancelLabel?: string
    type?: 'danger' | 'warning' | 'info'
  }>(),
  {
    confirmLabel: 'Confirm',
    cancelLabel: 'Cancel',
    type: 'danger',
  }
)

defineEmits<{
  confirm: []
  cancel: []
}>()


// Close on Escape key
function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) emit('cancel')
}
onMounted(() => document.addEventListener('keydown', handleKeydown))
onUnmounted(() => document.removeEventListener('keydown', handleKeydown))

const accentColor = computed(() => ({
  danger:  'bg-red-500',
  warning: 'bg-orange-400',
  info:    'bg-blue-500',
}[props.type]))

const iconBg = computed(() => ({
  danger:  'bg-red-50',
  warning: 'bg-orange-50',
  info:    'bg-blue-50',
}[props.type]))

const iconColor = computed(() => ({
  danger:  'text-red-500',
  warning: 'text-orange-500',
  info:    'text-blue-500',
}[props.type]))

const confirmBtnColor = computed(() => ({
  danger:  'bg-red-500 hover:bg-red-600',
  warning: 'bg-orange-500 hover:bg-orange-600',
  info:    'bg-blue-500 hover:bg-blue-600',
}[props.type]))
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: all 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-from .relative, .fade-leave-to .relative {
  transform: scale(0.95);
}
</style>