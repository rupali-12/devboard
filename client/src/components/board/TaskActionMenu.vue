<template>
  <div class="relative" ref="menuRef">

    <!-- Trigger button — three dots -->
    <button
      class="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
      title="Task actions"
      @click.stop="toggleMenu"
    >
      <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 5a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm0 7a1.5 1.5 0 110-3 1.5 1.5 0 010 3z" />
      </svg>
    </button>

    <!-- Dropdown menu -->
    <Transition name="menu">
      <div
        v-if="isOpen"
        class="absolute right-0 top-7 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50 w-44 overflow-hidden"
      >
        <!-- Archive -->
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
          @click.stop="handleArchive"
        >
          <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12" />
          </svg>
          Archive
          <span class="ml-auto text-xs text-gray-400">Recoverable</span>
        </button>

        <div class="border-t border-gray-100 mx-2 my-1" />

        <!-- Permanent Delete -->
        <button
          class="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
          @click.stop="handleDelete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Forever
          <span class="ml-auto text-xs text-red-300">Permanent</span>
        </button>
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const emit = defineEmits<{
  archive: []
  delete: []
}>()

const isOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

function handleArchive() {
  isOpen.value = false
  emit('archive')
}

function handleDelete() {
  isOpen.value = false
  emit('delete')
}

// Close menu when clicking outside
function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<style scoped>
.menu-enter-active, .menu-leave-active {
  transition: all 0.15s ease;
}
.menu-enter-from, .menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>