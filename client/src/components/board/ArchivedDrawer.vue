<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="fade">
      <div
        v-if="show"
        class="fixed inset-0 bg-black/30 z-40"
        @click="$emit('close')"
      />
    </Transition>

    <!-- Drawer -->
    <Transition name="slide">
      <div
        v-if="show"
        class="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div class="flex items-center gap-2">
            <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12M10 12v6m4-6v6" />
            </svg>
            <h2 class="font-semibold text-gray-800">Archived Tasks</h2>
            <span class="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
              {{ archivedTasks.length }}
            </span>
          </div>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            @click="$emit('close')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex-1 flex items-center justify-center">
          <div class="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>

        <!-- Empty state -->
        <div
          v-else-if="archivedTasks.length === 0"
          class="flex-1 flex flex-col items-center justify-center text-center p-8"
        >
          <div class="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
            </svg>
          </div>
          <p class="text-gray-500 font-medium">No archived tasks</p>
          <p class="text-gray-400 text-sm mt-1">Archived tasks will appear here</p>
        </div>

        <!-- Task list -->
        <div v-else class="flex-1 overflow-y-auto p-4 space-y-3">
          <div
            v-for="task in archivedTasks"
            :key="task.id"
            class="bg-white border border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-colors"
          >
            <!-- Task header -->
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <!-- Labels -->
                <div v-if="task.labels?.length" class="flex flex-wrap gap-1 mb-2">
                  <span
                    v-for="label in task.labels"
                    :key="label.name"
                    class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :style="{ backgroundColor: label.color + '22', color: label.color }"
                  >
                    {{ label.name }}
                  </span>
                </div>

                <!-- Title -->
                <p class="text-sm font-medium text-gray-700 line-clamp-2">
                  {{ task.title }}
                </p>

                <!-- Meta -->
                <div class="flex items-center gap-3 mt-2">
                  <!-- Priority -->
                  <span class="flex items-center gap-1">
                    <span :class="['w-2 h-2 rounded-full', priorityConfig[task.priority as Priority]?.dot ?? 'bg-gray-300']" />
                    <span :class="['text-xs', priorityConfig[task.priority as Priority]?.color ?? 'text-gray-400']">
                      {{ priorityConfig[task.priority as Priority]?.label ?? task.priority }}
                    </span>
                  </span>

                  <!-- Column name -->
                  <span class="text-xs text-gray-400">
                    {{ getColumnName(task.columnId) }}
                  </span>

                  <!-- Archived date -->
                  <span class="text-xs text-gray-400">
                    {{ formatDate(task.updatedAt) }}
                  </span>
                </div>
              </div>

              <!-- Restore button -->
              <!-- Actions -->
<div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">

  <!-- Restore -->
  <button
    :disabled="restoringId === task.id || deletingId === task.id"
    class="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
    @click="handleRestore(task)"
  >
    <svg
      v-if="restoringId === task.id"
      class="w-3 h-3 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
    </svg>
    {{ restoringId === task.id ? 'Restoring...' : 'Restore' }}
  </button>

  <!-- Permanent Delete -->
  <button
    :disabled="restoringId === task.id || deletingId === task.id"
    class="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
    @click="handlePermanentDelete(task)"
  >
    <svg
      v-if="deletingId === task.id"
      class="w-3 h-3 animate-spin"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
    <svg v-else class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
    </svg>
    {{ deletingId === task.id ? 'Deleting...' : 'Delete' }}
  </button>

</div>
            </div>
          </div>
        </div>

      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { taskApi } from '@/api/task.api'
import { useColumnStore } from '@/stores/column.store'
import { useTaskStore } from '@/stores/task.store'
import { priorityConfig, formatDate, type Priority } from '@/utils/taskHelpers'
import type { Task } from '@/types'
import { useConfirm } from '@/composables/useConfirm'
import { useToastStore } from '@/stores/toast.store'
const toast = useToastStore()

const props = defineProps<{
  show: boolean
  boardId: string
}>()

const emit = defineEmits<{
  close: []
  restored: [task: Task]
}>()

const columnStore = useColumnStore()
const taskStore = useTaskStore()

const archivedTasks = ref<Task[]>([])
const loading = ref(false)
const restoringId = ref<string | null>(null)
const { confirm } = useConfirm()
const deletingId = ref<string | null>(null)

// Fetch archived tasks every time drawer opens
watch(
  () => props.show,
  async (val) => {
    if (!val) return
    loading.value = true
    try {
      const res = await taskApi.getArchived(props.boardId)
      archivedTasks.value = res.data.tasks
    } catch (err) {
      console.error('Failed to load archived tasks:', err)
    } finally {
      loading.value = false
    }
  }
)

function getColumnName(columnId: string): string {
  return columnStore.columns.find((c) => c.id === columnId)?.name ?? 'Unknown column'
}

async function handleRestore(task: Task) {
  restoringId.value = task.id
  try {
    const res = await taskApi.restore(props.boardId, task.id)
    const restored = res.data.task
    archivedTasks.value = archivedTasks.value.filter(t => t.id !== task.id)
    taskStore.tasks = {
      ...taskStore.tasks,
      [restored.columnId]: [...(taskStore.tasks[restored.columnId] || []), restored],
    }
    emit('restored', restored)
    toast.success(`"${task.title}" restored to board`)
  } catch {
    toast.error('Failed to restore task')
  } finally {
    restoringId.value = null
  }
}

async function handlePermanentDelete(task: Task) {
  const confirmed = await confirm({
    title: 'Delete Forever',
    message: `"${task.title}" will be permanently deleted and cannot be recovered.`,
    confirmLabel: 'Delete Forever',
    cancelLabel: 'Cancel',
    type: 'danger',
  })
  if (!confirmed) return

  deletingId.value = task.id
  try {
    await taskApi.permanentDelete(props.boardId, task.id)
    archivedTasks.value = archivedTasks.value.filter(t => t.id !== task.id)
    toast.success(`"${task.title}" permanently deleted`)
  } catch {
    toast.error('Failed to delete task')
  } finally {
    deletingId.value = null
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform 0.3s ease; }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>