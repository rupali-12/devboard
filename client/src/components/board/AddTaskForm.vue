<template>
  <div class="mt-2">

    <!-- Input form — shown when isOpen -->
    <div v-if="isOpen">
      <textarea
        ref="inputRef"
        v-model="title"
        rows="2"
        placeholder="Task title..."
        class="w-full px-3 py-2 text-sm border border-blue-400 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
        @keydown.enter.prevent="handleAdd"
        @keydown.esc="close"
      />
      <div class="flex gap-2 mt-1.5">
        <AppButton size="sm" :loading="loading" @click="handleAdd">
          Add Task
        </AppButton>
        <AppButton size="sm" variant="ghost" @click="close">
          Cancel
        </AppButton>
      </div>
    </div>

    <!-- Trigger button — shown when not open -->
    <button
      v-else
      class="w-full flex items-center gap-1.5 px-2 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
      @click="open"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add task
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'

defineProps<{
  boardId: string
  columnId: string
}>()

const emit = defineEmits<{
  created: [title: string]
}>()

const isOpen = ref(false)
const title = ref('')
const loading = ref(false)
const inputRef = ref<HTMLTextAreaElement | null>(null)

async function open() {
  isOpen.value = true
  await nextTick()
  inputRef.value?.focus()
}

function close() {
  isOpen.value = false
  title.value = ''
}

async function handleAdd() {
  const trimmed = title.value.trim()
  if (!trimmed) return

  loading.value = true
  try {
    emit('created', trimmed)
    close()
  } finally {
    loading.value = false
  }
}
</script>