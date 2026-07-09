<template>
  <Teleport to="body">
    <div
      v-if="show && task"
      class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="handleClose"
      />

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 max-h-[80vh] flex flex-col">

        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-2">
            <div :class="['w-3 h-3 rounded-full', priorityConfig[form.priority]?.dot ?? 'bg-gray-300']" />
            <span class="text-sm font-medium text-gray-500">
              {{ columnName }}
            </span>
          </div>
          <button
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            @click="handleClose"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          <!-- Title -->
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Title</label>
            <input
              v-model="form.title"
              class="w-full text-lg font-semibold text-gray-800 border-0 border-b-2 border-transparent hover:border-gray-200 focus:border-blue-400 outline-none pb-1 transition-colors bg-transparent"
              placeholder="Task title..."
              @blur="saveField('title', form.title)"
            />
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Description</label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder:text-gray-300"
              placeholder="Add a description..."
              @blur="saveField('description', form.description)"
            />
          </div>

          <!-- Priority + Due Date row -->
          <div class="grid grid-cols-2 gap-4">

            <!-- Priority -->
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Priority</label>
              <div class="flex flex-col gap-1.5">
                <button
                  v-for="(config, key) in priorityConfig"
                  :key="key"
                  :class="[
                    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all',
                    form.priority === key
                      ? 'border-blue-400 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  ]"
                  @click="setPriority(key as Priority)"
                >
                  <span :class="['w-2 h-2 rounded-full flex-shrink-0', config.dot]" />
                  {{ config.label }}
                </button>
              </div>
            </div>

            <!-- Due Date -->
            <div>
              <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Due Date</label>
              <input
                v-model="form.dueDate"
                type="date"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @change="saveField('dueDate', form.dueDate || null)"
              />
              <button
                v-if="form.dueDate"
                class="mt-1 text-xs text-red-400 hover:text-red-600"
                @click="clearDueDate"
              >
                Clear date
              </button>
            </div>
          </div>

          <!-- Labels -->
          <div>
            <label class="block text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Labels</label>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="label in defaultLabels"
                :key="label.name"
                :class="[
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border-2 transition-all',
                  isLabelSelected(label)
                    ? 'border-current opacity-100'
                    : 'border-transparent opacity-60 hover:opacity-80'
                ]"
                :style="{
                  backgroundColor: label.color + '22',
                  color: label.color,
                  borderColor: isLabelSelected(label) ? label.color : 'transparent'
                }"
                @click="toggleLabel(label)"
              >
                <svg v-if="isLabelSelected(label)" class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                </svg>
                {{ label.name }}
              </button>
            </div>
          </div>

          <!-- Metadata -->
          <div class="text-xs text-gray-400 pt-2 border-t border-gray-100">
            <p>Created: {{ formatDate(task.createdAt) }}</p>
            <p>Last updated: {{ formatDate(task.updatedAt) }}</p>
          </div>

        </div>

        <!-- Footer -->
<div class="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">

  <div class="flex items-center gap-2">
    <!-- Archive button -->
    <button
      class="flex items-center gap-1.5 text-sm text-orange-400 hover:text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
      @click="handleArchive"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
      </svg>
      Archive
    </button>

    <!-- Permanent delete button -->
    <button
      class="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
      @click="handlePermanentDelete"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete Forever
    </button>
  </div>

  <div class="flex items-center gap-2">
    <Transition name="fade">
      <span v-if="savedIndicator" class="text-xs text-green-500 flex items-center gap-1">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Saved
      </span>
    </Transition>
    <AppButton variant="secondary" size="sm" @click="handleClose">
      Close
    </AppButton>
  </div>

</div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Task } from '@/types'
import { taskApi } from '@/api/task.api'
import { priorityConfig, formatDate, type Priority } from '@/utils/taskHelpers'
import { defaultLabels, type LabelOption } from '@/utils/labelColors'
import AppButton from '@/components/ui/AppButton.vue'
import { useConfirm } from '@/composables/useConfirm'
import { useToastStore } from '@/stores/toast.store'
const toast = useToastStore()

const props = defineProps<{
  show: boolean
  task: Task | null
  columnName?: string
  boardId: string
}>()

const emit = defineEmits<{
  close: []
  updated: [task: Task]
  archived: [taskId: string, columnId: string]
}>()

// ── Form state ────────────────────────────────────────────────────────────────
const form = reactive({
  title: '',
  description: '',
  priority: 'medium' as Priority,
  dueDate: '',
  labels: [] as LabelOption[],
})

const savedIndicator = ref(false)
const { confirm } = useConfirm()

// Sync form when task prop changes (different task opened)
watch(
  () => props.task,
  (task) => {
    if (!task) return
    form.title = task.title
    form.description = task.description || ''
    form.priority = (task.priority as Priority) || 'medium'
    form.dueDate = task.dueDate
      ? new Date(task.dueDate).toISOString().split('T')[0]
      : ''
    form.labels = task.labels ? [...task.labels] : []
  },
  { immediate: true }
)

// ── Save helpers ──────────────────────────────────────────────────────────────
async function saveField(field: string, value: unknown) {
  if (!props.task) return
  const current = props.task[field as keyof Task]
  if (field === 'title' && value === current) return
  if (field === 'description' && value === current) return

  try {
    const res = await taskApi.update(props.boardId, props.task.id, { [field]: value })
    emit('updated', res.data.task)
    showSaved()
  } catch {
    toast.error('Failed to save changes')
  }
}

async function setPriority(priority: Priority) {
  form.priority = priority
  if (!props.task) return
  try {
    const res = await taskApi.update(props.boardId, props.task.id, { priority })
    emit('updated', res.data.task)
    showSaved()
  } catch (err) {
    console.error('Failed to update priority:', err)
  }
}

async function toggleLabel(label: LabelOption) {
  const idx = form.labels.findIndex((l) => l.name === label.name)
  if (idx === -1) {
    form.labels.push(label)
  } else {
    form.labels.splice(idx, 1)
  }
  if (!props.task) return
  try {
    const res = await taskApi.update(props.boardId, props.task.id, {
      labels: form.labels
    })
    emit('updated', res.data.task)
    showSaved()
  } catch (err) {
    console.error('Failed to update labels:', err)
  }
}

function isLabelSelected(label: LabelOption): boolean {
  return form.labels.some((l) => l.name === label.name)
}

async function clearDueDate() {
  form.dueDate = ''
  if (!props.task) return
  try {
    const res = await taskApi.update(props.boardId, props.task.id, { dueDate: null })
    emit('updated', res.data.task)
    showSaved()
  } catch (err) {
    console.error('Failed to clear due date:', err)
  }
}

function showSaved() {
  savedIndicator.value = true
  setTimeout(() => { savedIndicator.value = false }, 2000)
}

// ── Actions ───────────────────────────────────────────────────────────────────
function handleClose() {
  emit('close')
}

// Update handleArchive
async function handleArchive() {
  if (!props.task) return
  const confirmed = await confirm({
    title: 'Archive Task',
    message: `"${props.task.title}" will be moved to the archive. You can restore it later.`,
    confirmLabel: 'Archive',
    cancelLabel: 'Keep It',
    type: 'warning',
  })
  if (!confirmed) return
  emit('archived', props.task.id, props.task.columnId)
  emit('close')
  toast.success('Task archived')
}

// Update handlePermanentDelete
async function handlePermanentDelete() {
  if (!props.task) return
  const confirmed = await confirm({
    title: 'Delete Forever',
    message: `"${props.task.title}" will be permanently deleted and cannot be recovered.`,
    confirmLabel: 'Delete Forever',
    cancelLabel: 'Cancel',
    type: 'danger',
  })
  if (!confirmed) return
  try {
    await taskApi.permanentDelete(props.boardId, props.task.id)
    emit('archived', props.task.id, props.task.columnId)
    emit('close')
    toast.success('Task permanently deleted')
  } catch {
    toast.error('Failed to delete task')
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>