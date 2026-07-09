<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Dark overlay -->
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="$emit('close')"
      />

      <!-- Modal card -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">

        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Create New Board</h2>
          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Body -->
        <div class="p-6 space-y-5">

          <!-- Preview of selected background -->
          <div
            :class="['w-full h-24 rounded-xl bg-gradient-to-r transition-all duration-300', form.background]"
          />

          <!-- Board Name -->
          <AppInput
            v-model="form.name"
            label="Board Name"
            placeholder="e.g. Marketing Campaign, Dev Sprint..."
            :error="errors.name"
            required
            autofocus
          />

          <!-- Board Description -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Description <span class="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              v-model="form.description"
              rows="2"
              placeholder="What is this board for?"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400"
            />
          </div>

          <!-- Background Picker -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Background</label>
            <div class="grid grid-cols-5 gap-2">
              <button
                v-for="bg in boardBackgrounds"
                :key="bg.id"
                type="button"
                :class="[
                  'h-10 rounded-lg bg-gradient-to-r transition-all duration-200 cursor-pointer',
                  bg.classes,
                  form.background === bg.classes
                    ? 'ring-2 ring-offset-2 ring-blue-500 scale-105'
                    : 'hover:scale-105 opacity-80 hover:opacity-100'
                ]"
                :title="bg.label"
                @click="form.background = bg.classes"
              />
            </div>
          </div>

          <!-- Error alert -->
          <AppAlert :message="errors.general" type="error" />
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-end gap-3 px-6 pb-6">
          <AppButton variant="secondary" @click="$emit('close')">
            Cancel
          </AppButton>
          <AppButton
            variant="primary"
            :loading="loading"
            @click="handleCreate"
          >
            Create Board
          </AppButton>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { useBoardStore } from '../../stores/board.store.ts'
import { boardBackgrounds } from '../../utils/boardBackgrounds'
import AppInput from '../../components/ui/AppInput.vue'
import AppButton from '../../components/ui/AppButton.vue'
import AppAlert from '../../components/ui/AppAlert.vue'
import { useToastStore } from '@/stores/toast.store'
const toast = useToastStore()

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{
  close: []
  created: [boardId: string]
}>()

const boardStore = useBoardStore()
const loading = ref(false)

const form = reactive({
  name: '',
  description: '',
  background: boardBackgrounds[0].classes,
})

const errors = reactive({
  name: '',
  general: '',
})

// Reset form when modal opens
watch(() => props.show, (val) => {
  if (val) {
    form.name = ''
    form.description = ''
    form.background = boardBackgrounds[0].classes
    errors.name = ''
    errors.general = ''
  }
})

async function handleCreate() {
  errors.name = ''
  errors.general = ''
  if (!form.name.trim()) {
    errors.name = 'Board name is required'
    return
  }
  loading.value = true
  try {
    const board = await boardStore.createBoard({
      name: form.name.trim(),
      description: form.description.trim(),
      background: form.background,
    })
    emit('created', board.id)
    emit('close')
    // Toast shown in DashboardPage onBoardCreated
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { error?: string } } }
      errors.general = axiosErr.response?.data?.error || 'Failed to create board'
    } else {
      toast.error('Failed to create board. Please try again.')
    }
  } finally {
    loading.value = false
  }
}
</script>