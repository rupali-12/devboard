<template>
  <div
    class="flex-shrink-0 w-72 flex flex-col"
    style="max-height: calc(100vh - 64px)"
  >
    <!-- Column Header -->
    <div
      class="flex items-center justify-between px-3 py-2.5 bg-gray-100 rounded-t-xl border border-b-0 border-gray-200"
    >
      <div class="flex items-center gap-2 flex-1 min-w-0">
        <div
          class="w-3 h-3 rounded-full flex-shrink-0"
          :style="{
            backgroundColor:
              column.color === '#E2E8F0' ? '#94A3B8' : column.color,
          }"
        />
        <span
          v-if="!editingName"
          class="text-sm font-semibold text-gray-700 truncate cursor-pointer select-none"
          @dblclick="startEdit"
        >
          {{ column.name }}
        </span>
        <input
          v-else
          ref="nameInput"
          v-model="editName"
          class="text-sm font-semibold bg-white border border-blue-400 rounded px-1 outline-none flex-1 min-w-0"
          @blur="saveEdit"
          @keydown.enter="saveEdit"
          @keydown.esc="cancelEdit"
        />
        <span
          class="ml-auto text-xs font-medium text-gray-500 bg-gray-200 rounded-full px-2 py-0.5 flex-shrink-0"
        >
          {{ tasks.length }}
        </span>
      </div>
      <button
        class="ml-2 flex-shrink-0 w-6 h-6 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        @click="$emit('deleteColumn', column.id)"
      >
        <svg
          class="w-3.5 h-3.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>

    <!-- Task list -->
    <div
      class="flex-1 overflow-y-auto bg-gray-100 border border-t-0 border-gray-200 rounded-b-xl px-2 pt-2 pb-2"
    >
      <!-- Draggable container -->
      <div
        :id="`column-${column.id}`"
        :data-column-id="column.id"
        class="flex flex-col gap-2 min-h-8"
        @dragover.prevent="onDragOver"
        @drop.prevent="onDrop"
      >
        <div
          v-for="task in tasks"
          :key="task.id"
          :data-task-id="task.id"
          :data-column-id="column.id"
          draggable="true"
          @dragstart="onDragStart($event, task.id, column.id)"
          @dragend="onDragEnd"
        >
          <TaskCard
            :task="task"
            @click="(t) => $emit('taskClicked', t)"
            @archive="(id) => $emit('archiveTask', id, column.id)"
            @permanentDelete="
              (id) => $emit('permanentDeleteTask', id, column.id)
            "
          />
        </div>

        <!-- Drop zone hint when empty -->
        <div
          v-if="tasks.length === 0"
          class="h-8 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center"
          :class="isDragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'"
        >
          <span class="text-xs text-gray-400">Drop here</span>
        </div>
      </div>

      <!-- Add task -->
      <AddTaskForm
        :boardId="boardId"
        :columnId="column.id"
        @created="(title) => $emit('addTask', column.id, title)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import type { Column, Task } from "@/types";
import TaskCard from "./TaskCard.vue";
import AddTaskForm from "./AddTaskForm.vue";

const props = defineProps<{
  column: Column;
  tasks: Task[];
  boardId: string;
}>();

const emit = defineEmits<{
  addTask: [columnId: string, title: string];
  archiveTask: [taskId: string, columnId: string];
  permanentDeleteTask: [taskId: string, columnId: string]; // ← add this
  deleteColumn: [columnId: string];
  taskMoved: [
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    newPosition: number,
  ];
  columnRenamed: [columnId: string, newName: string];
  taskClicked: [task: Task];
}>();

// ── Native HTML5 Drag and Drop ───────────────────────────────────────────────
// Using native drag-drop instead of VueDraggable to avoid the rendering bug

const isDragOver = ref(false);

// Store drag info in module-level variables (shared across column instances)
let draggedTaskId = "";
let draggedFromColumnId = "";

function onDragStart(event: DragEvent, taskId: string, columnId: string) {
  draggedTaskId = taskId;
  draggedFromColumnId = columnId;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("taskId", taskId);
    event.dataTransfer.setData("fromColumnId", columnId);
  }
  // Small delay so the dragged element doesn't look weird
  setTimeout(() => {
    const el = document.querySelector(
      `[data-task-id="${taskId}"]`,
    ) as HTMLElement;
    if (el) el.style.opacity = "0.4";
  }, 0);
}

function onDragEnd() {
  // Restore opacity
  if (draggedTaskId) {
    const el = document.querySelector(
      `[data-task-id="${draggedTaskId}"]`,
    ) as HTMLElement;
    if (el) el.style.opacity = "1";
  }
  isDragOver.value = false;
}

function onDragOver(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = true;
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
}

function onDrop(event: DragEvent) {
  event.preventDefault();
  isDragOver.value = false;

  const taskId = event.dataTransfer?.getData("taskId") || draggedTaskId;
  const fromColumnId =
    event.dataTransfer?.getData("fromColumnId") || draggedFromColumnId;
  const toColumnId = props.column.id;

  if (!taskId || !fromColumnId) return;

  // Calculate drop position based on mouse Y position
  const container = document.getElementById(`column-${toColumnId}`);
  if (!container) return;

  const taskElements = Array.from(
    container.querySelectorAll("[data-task-id]"),
  ) as HTMLElement[];

  let newPosition = props.tasks.length; // Default: drop at end

  for (let i = 0; i < taskElements.length; i++) {
    const rect = taskElements[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (event.clientY < midY) {
      newPosition = i;
      break;
    }
  }

  // Don't emit if dropped in exact same position in same column
  if (fromColumnId === toColumnId) {
    const currentIndex = props.tasks.findIndex((t) => t.id === taskId);
    if (currentIndex === newPosition || currentIndex === newPosition - 1)
      return;
  }

  emit("taskMoved", taskId, fromColumnId, toColumnId, newPosition);
}

// ── Column name editing ──────────────────────────────────────────────────────
const editingName = ref(false);
const editName = ref("");
const nameInput = ref<HTMLInputElement | null>(null);

function startEdit() {
  editName.value = props.column.name;
  editingName.value = true;
  nextTick(() => nameInput.value?.select());
}
function saveEdit() {
  const trimmed = editName.value.trim();
  if (trimmed && trimmed !== props.column.name) {
    emit("columnRenamed", props.column.id, trimmed);
  }
  editingName.value = false;
}
function cancelEdit() {
  editingName.value = false;
}
</script>
