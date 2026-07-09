<template>
  <div class="h-screen flex flex-col overflow-hidden">
    <!-- Board Navbar -->
    <nav
      class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0 z-10"
    >
      <div class="flex items-center gap-3">
        <!-- Back to dashboard -->
        <button
          class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          @click="$router.push({ name: 'Dashboard' })"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </button>

        <!-- Board gradient dot + name -->
        <div class="flex items-center gap-2">
          <div
            v-if="boardStore.currentBoard"
            :class="[
              'w-6 h-6 rounded-md bg-gradient-to-br flex-shrink-0',
              boardStore.currentBoard.background,
            ]"
          />
          <h1 class="font-bold text-gray-900 text-lg truncate max-w-xs">
            {{ boardStore.currentBoard?.name || "Loading..." }}
          </h1>
        </div>
      </div>

      <!-- Right side: connection indicator + online users -->
      <div class="flex items-center gap-3">
        <!-- Real-time connection dot -->
        <div class="flex items-center gap-1.5">
          <div
            :class="[
              'w-2 h-2 rounded-full transition-colors',
              isConnected ? 'bg-green-400' : 'bg-gray-300 animate-pulse',
            ]"
          />
          <span class="text-xs text-gray-400 hidden sm:block">
            {{ isConnected ? "Live" : "Connecting..." }}
          </span>
        </div>

        <!-- Archive button -->
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          @click="showArchivedDrawer = true"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8l1 12a2 2 0 002 2h8a2 2 0 002-2l1-12"
            />
          </svg>
          <span class="hidden sm:block">Archive</span>
        </button>

        <!-- Online user avatars -->
        <div class="flex items-center -space-x-2">
          <div
            v-for="user in onlineUsers.slice(0, 5)"
            :key="user.userId"
            class="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center cursor-default"
            :title="`${user.name} is viewing`"
          >
            <span class="text-xs font-semibold text-blue-700">
              {{ user.name.charAt(0).toUpperCase() }}
            </span>
          </div>

          <!-- Overflow count -->
          <div
            v-if="onlineUsers.length > 5"
            class="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center"
          >
            <span class="text-xs font-semibold text-gray-500">
              +{{ onlineUsers.length - 5 }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="flex-1 flex items-center justify-center bg-gray-100"
    >
      <div class="text-center">
        <div
          class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"
        />
        <p class="text-gray-500 text-sm">Loading board...</p>
      </div>
    </div>

    <!-- Error state -->
    <div
      v-else-if="loadError"
      class="flex-1 flex items-center justify-center bg-gray-100"
    >
      <div class="text-center">
        <p class="text-red-500 font-medium mb-3">{{ loadError }}</p>
        <button
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          @click="loadBoard"
        >
          Retry
        </button>
      </div>
    </div>

    <!-- Board canvas -->
    <div v-else class="flex-1 overflow-x-auto overflow-y-hidden bg-gray-200">
      <div class="flex gap-4 p-6 h-full items-start min-w-max">
        <!-- Columns -->
        <ColumnItem
          v-for="column in columnStore.columns"
          :key="column.id"
          :column="column"
          :tasks="taskStore.getColumnTasks(column.id)"
          :boardId="boardId"
          @addTask="handleAddTask"
          @archiveTask="handleArchiveTask"
          @permanentDeleteTask="handlePermanentDelete"
          @deleteColumn="handleDeleteColumn"
          @taskMoved="handleTaskMoved"
          @columnRenamed="handleColumnRenamed"
          @taskClicked="handleTaskClicked"
        />

        <!-- Add Column -->
        <AddColumnForm @created="handleAddColumn" />
        <!-- Task Detail Modal -->
        <TaskDetailModal
          :show="showTaskModal"
          :task="selectedTask"
          :boardId="boardId"
          :columnName="selectedTask ? getColumnName(selectedTask.columnId) : ''"
          @close="showTaskModal = false"
          @updated="handleTaskUpdated"
          @archived="handleModalArchive"
        />

        <!-- Archived Tasks Drawer -->
        <ArchivedDrawer
          :show="showArchivedDrawer"
          :boardId="boardId"
          @close="showArchivedDrawer = false"
          @restored="showArchivedDrawer = false"
        />
      </div>
    </div>

    <!-- Move error toast -->
    <Transition name="toast">
      <div
        v-if="moveError"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white text-sm px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2"
      >
        <svg
          class="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        {{ moveError }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRoute } from "vue-router";
import { useBoardStore } from "@/stores/board.store";
import { useColumnStore } from "@/stores/column.store";
import { useTaskStore } from "@/stores/task.store";
import { useSocketStore } from "@/stores/socket.store";
import { useSocket } from "@/composables/useSocket";
import ColumnItem from "@/components/board/ColumnItem.vue";
import AddColumnForm from "@/components/board/AddColumnForm.vue";
import TaskDetailModal from "@/components/modals/TaskDetailModal.vue";
import { Task } from "@/types";
import ArchivedDrawer from "@/components/board/ArchivedDrawer.vue";
import { useConfirm } from "@/composables/useConfirm";
import { taskApi } from "@/api/task.api";
import { useToastStore } from '@/stores/toast.store'

const route = useRoute();
const boardId = route.params.boardId as string;
const toast = useToastStore()

const boardStore = useBoardStore();
const columnStore = useColumnStore();
const taskStore = useTaskStore();
const socketStore = useSocketStore();
const { confirm } = useConfirm();

const loading = ref(true);
const loadError = ref("");
const moveError = ref("");
let moveErrorTimer: ReturnType<typeof setTimeout> | null = null;

// Socket lifecycle — connect, join board, listen to events, cleanup on unmount
const { onlineUsers, isConnected, emitTaskMove } = useSocket(boardId);

// ── Load board data ─────────────────────────────────────────────────────────
async function loadBoard() {
  loading.value = true;
  loadError.value = "";
  try {
    await Promise.all([
      boardStore.fetchBoard(boardId),
      columnStore.fetchColumns(boardId),
      taskStore.fetchTasks(boardId),
    ]);
  } catch (err) {
    loadError.value = "Failed to load board. Please try again.";
    console.error("Board load error:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadBoard()

  socketStore.socket?.on('task:move:error', ({ taskId, error }) => {
    if (moveSnapshot.value) {
      taskStore.rollbackMove(moveSnapshot.value)
      moveSnapshot.value = null
    }
    toast.error('Failed to move task — changes rolled back')
  })
})

onUnmounted(() => {
  columnStore.clearColumns();
  taskStore.clearTasks();
  if (moveErrorTimer) clearTimeout(moveErrorTimer);
});

// ── Move error toast helpers ─────────────────────────────────────────────────
function showMoveError(message: string) {
  moveError.value = message;
  if (moveErrorTimer) clearTimeout(moveErrorTimer);
  moveErrorTimer = setTimeout(() => {
    moveError.value = "";
  }, 3000);
}

// Snapshot stored during drag — used for rollback if server rejects
const moveSnapshot = ref<Record<string, Task[]> | null>(null);

// Task detail modal state
const selectedTask = ref<Task | null>(null);
const showTaskModal = ref(false);
const showArchivedDrawer = ref(false);

function getColumnName(columnId: string): string {
  return columnStore.columns.find((c) => c.id === columnId)?.name ?? "";
}

function handleTaskClicked(task: Task) {
  selectedTask.value = task;
  showTaskModal.value = true;
}

function handleTaskUpdated(updatedTask: Task) {
  // Update the task in the store so the card reflects changes immediately
  const colTasks = taskStore.tasks[updatedTask.columnId];
  if (colTasks) {
    const idx = colTasks.findIndex((t) => t.id === updatedTask.id);
    if (idx !== -1) {
      taskStore.tasks = {
        ...taskStore.tasks,
        [updatedTask.columnId]: [
          ...colTasks.slice(0, idx),
          updatedTask,
          ...colTasks.slice(idx + 1),
        ],
      };
    }
  }
  // Keep selectedTask in sync so modal reflects new values
  selectedTask.value = updatedTask;
}

function handleModalArchive(taskId: string, columnId: string) {
  taskStore.archiveTask(boardId, taskId, columnId);
}

// ── Column Actions ──────────────────────────────────────────────────────────
async function handleAddColumn(name: string) {
  try {
    await columnStore.createColumn(boardId, name)
    toast.success(`Column "${name}" created`)
  } catch {
    toast.error('Failed to create column')
  }
}

async function handleDeleteColumn(columnId: string) {
  const col = columnStore.columns.find(c => c.id === columnId)
  const colName = col?.name ?? 'Column'

  const confirmed = await confirm({
    title: 'Delete Column',
    message: `This will permanently delete "${colName}" and archive all tasks inside it.`,
    confirmLabel: 'Delete Column',
    cancelLabel: 'Keep It',
    type: 'danger',
  })
  if (!confirmed) return

  try {
    await columnStore.deleteColumn(boardId, columnId)
    delete taskStore.tasks[columnId]
    toast.success(`"${colName}" deleted`)
  } catch {
    toast.error('Failed to delete column')
  }
}

async function handleArchiveTask(taskId: string, columnId: string) {
  const task = taskStore.getColumnTasks(columnId).find(t => t.id === taskId)
  const taskTitle = task?.title ?? 'Task'

  const confirmed = await confirm({
    title: 'Archive Task',
    message: `"${taskTitle}" will be moved to the archive. You can restore it later.`,
    confirmLabel: 'Archive',
    cancelLabel: 'Cancel',
    type: 'warning',
  })
  if (!confirmed) return

  try {
    await taskStore.archiveTask(boardId, taskId, columnId)
    toast.success(`"${taskTitle}" archived`)
  } catch {
    toast.error('Failed to archive task')
  }
}

async function handlePermanentDelete(taskId: string, columnId: string) {
  const task = taskStore.getColumnTasks(columnId).find(t => t.id === taskId)
  const taskTitle = task?.title ?? 'Task'

  const confirmed = await confirm({
    title: 'Delete Forever',
    message: `"${taskTitle}" will be permanently deleted and cannot be recovered.`,
    confirmLabel: 'Delete Forever',
    cancelLabel: 'Cancel',
    type: 'danger',
  })
  if (!confirmed) return

  try {
    await taskApi.permanentDelete(boardId, taskId)
    taskStore.tasks = {
      ...taskStore.tasks,
      [columnId]: (taskStore.tasks[columnId] || []).filter(t => t.id !== taskId),
    }
    toast.success(`"${taskTitle}" permanently deleted`)
  } catch {
    toast.error('Failed to delete task')
  }
}

async function handleColumnRenamed(columnId: string, newName: string) {
  try {
    await columnStore.updateColumn(boardId, columnId, newName)
    toast.success('Column renamed')
  } catch {
    toast.error('Failed to rename column')
  }
}

// ── Task Actions ────────────────────────────────────────────────────────────
async function handleAddTask(columnId: string, title: string) {
  try {
    await taskStore.createTask(boardId, { columnId, title })
    toast.success('Task created')
  } catch {
    toast.error('Failed to create task')
  }
}



// ── Drag and Drop ───────────────────────────────────────────────────────────
async function handleTaskMoved(
  taskId: string,
  fromColumnId: string,
  toColumnId: string,
  newPosition: number
) {
  const snapshot = JSON.parse(JSON.stringify(taskStore.tasks))
  taskStore.moveTaskOptimistic(taskId, fromColumnId, toColumnId, newPosition)
  emitTaskMove({ boardId, taskId, fromColumnId, toColumnId, position: newPosition })

}
</script>

<style scoped>
/* Toast slide-up animation */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}
</style>
