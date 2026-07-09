<template>
  <div class="min-h-screen bg-gray-50">

    <!-- Navbar -->
    <nav class="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">

        <!-- Logo -->
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span class="font-bold text-gray-900 text-lg">DevBoard</span>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- User avatar -->
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <span class="text-sm font-semibold text-blue-700">
                {{ authStore.user?.name?.charAt(0).toUpperCase() }}
              </span>
            </div>
            <span class="text-sm text-gray-700 hidden sm:block">{{ authStore.user?.name }}</span>
          </div>

          <AppButton variant="ghost" size="sm" :loading="loggingOut" @click="handleLogout">
            Sign out
          </AppButton>
        </div>

      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-6 py-8">

      <!-- Page header -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">My Boards</h1>
          <p class="text-gray-500 text-sm mt-0.5">
            {{ boardStore.boards.length }} board{{ boardStore.boards.length !== 1 ? 's' : '' }}
          </p>
        </div>

        <AppButton variant="primary" @click="showCreateModal = true">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          New Board
        </AppButton>
      </div>

     <!-- Loading skeleton -->
<div
  v-if="boardStore.loading"
  class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
>
  <div v-for="i in 6" :key="i" class="rounded-xl overflow-hidden animate-pulse">
    <div class="h-28 bg-gradient-to-r from-gray-200 to-gray-300" />
    <div class="bg-white border border-t-0 border-gray-200 rounded-b-xl p-4 space-y-2">
      <div class="h-4 bg-gray-200 rounded-full w-3/4" />
      <div class="h-3 bg-gray-100 rounded-full w-1/2" />
      <div class="h-3 bg-gray-100 rounded-full w-1/4" />
    </div>
  </div>
</div>

      <!-- Boards grid -->
      <div
        v-else-if="boardStore.boards.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        <BoardCard
          v-for="board in boardStore.boards"
          :key="board.id"
          :board="board"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="flex flex-col items-center justify-center py-24 text-center">
        <div class="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <svg class="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-gray-800 mb-2">No boards yet</h3>
        <p class="text-gray-400 text-sm mb-6 max-w-xs">
          Create your first board to start organizing tasks with your team
        </p>
        <AppButton variant="primary" size="lg" @click="showCreateModal = true">
          Create your first board
        </AppButton>
      </div>

    </main>

    <!-- Create Board Modal -->
    <CreateBoardModal
      :show="showCreateModal"
      @close="showCreateModal = false"
      @created="onBoardCreated"
    />

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import { useBoardStore } from '../stores/board.store'
import AppButton from '../components/ui/AppButton.vue'
import BoardCard from '../components/board/BoardCard.vue'
import CreateBoardModal from '../components/modals/CreateBoardModal.vue'
import { useToastStore } from '@/stores/toast.store'
const toast = useToastStore()

const router = useRouter()
const authStore = useAuthStore()
const boardStore = useBoardStore()

const showCreateModal = ref(false)
const loggingOut = ref(false)

// Load boards when page mounts
onMounted(() => {
  boardStore.fetchBoards()
})

async function handleLogout() {
  loggingOut.value = true
  await authStore.logout()
  router.push({ name: 'Login' })
}

// After board is created, navigate directly to it
function onBoardCreated(boardId: string) {
  toast.success('Board created successfully!')
  router.push({ name: 'Board', params: { boardId } })
}
</script>