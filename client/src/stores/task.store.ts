import { defineStore } from 'pinia'
import { ref } from 'vue'
import { taskApi, type CreateTaskPayload, type MoveTaskPayload } from '@/api/task.api'
import type { Task } from '@/types'

export const useTaskStore = defineStore('task', () => {
  // tasks is a map: { [columnId]: Task[] }
  const tasks = ref<Record<string, Task[]>>({})
  const loading = ref(false)

  async function fetchTasks(boardId: string) {
    loading.value = true
    try {
      const res = await taskApi.getAll(boardId)
      tasks.value = res.data.tasks
    } finally {
      loading.value = false
    }
  }

 async function createTask(boardId: string, payload: CreateTaskPayload) {
  const res = await taskApi.create(boardId, payload)
  const task = res.data.task

  // Vue 3 reactivity issue — directly mutating a nested object property
  // doesn't always trigger re-renders. Use this pattern instead:
  if (!tasks.value[task.columnId]) {
    // Column doesn't exist in map yet — create it reactively
    tasks.value = {
      ...tasks.value,
      [task.columnId]: [task],
    }
  } else {
    // Column exists — create new array reference to trigger reactivity
    tasks.value = {
      ...tasks.value,
      [task.columnId]: [...tasks.value[task.columnId], task],
    }
  }

  return task
}

  // Optimistic move — update UI immediately, server confirms later
  function moveTaskOptimistic(
  taskId: string,
  fromColumnId: string,
  toColumnId: string,
  newPosition: number
) {
  const fromList = [...(tasks.value[fromColumnId] || [])]
  const taskIndex = fromList.findIndex((t) => t.id === taskId)
  if (taskIndex === -1) return

  const task = { ...fromList[taskIndex], columnId: toColumnId }

  // Remove from source
  fromList.splice(taskIndex, 1)

  // Insert into destination
  const toList = [...(tasks.value[toColumnId] || [])]
  toList.splice(newPosition, 0, task)

  // Replace entire tasks object with new references — guarantees reactivity
  tasks.value = {
    ...tasks.value,
    [fromColumnId]: fromList,
    [toColumnId]: toList,
  }
}

  // Called if server rejects the move — restore previous state
  function rollbackMove(snapshot: Record<string, Task[]>) {
    tasks.value = snapshot
  }

 async function archiveTask(boardId: string, taskId: string, columnId: string) {
  await taskApi.archive(boardId, taskId)
  tasks.value = {
    ...tasks.value,
    [columnId]: (tasks.value[columnId] || []).filter((t) => t.id !== taskId),
  }
}

  function getColumnTasks(columnId: string): Task[] {
  // Try direct match first
  if (tasks.value[columnId]) return tasks.value[columnId]
  
  // Fallback: search all keys case-insensitively
  // (handles ObjectId string format differences)
  const key = Object.keys(tasks.value).find(
    (k) => k.toLowerCase() === columnId.toLowerCase()
  )
  return key ? tasks.value[key] : []
}

  function clearTasks() {
    tasks.value = {}
  }

  return {
    tasks,
    loading,
    fetchTasks,
    createTask,
    moveTaskOptimistic,
    rollbackMove,
    archiveTask,
    getColumnTasks,
    clearTasks,
  }
})