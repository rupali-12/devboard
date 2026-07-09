import { defineStore } from 'pinia'
import { ref } from 'vue'
import { columnApi } from '@/api/column.api'
import type { Column } from '@/types'

export const useColumnStore = defineStore('column', () => {
  const columns = ref<Column[]>([])
  const loading = ref(false)

  async function fetchColumns(boardId: string) {
    loading.value = true
    try {
      const res = await columnApi.getAll(boardId)
      columns.value = res.data.columns
    } finally {
      loading.value = false
    }
  }

  async function createColumn(boardId: string, name: string) {
    const res = await columnApi.create(boardId, { name })
    columns.value.push(res.data.column)
    return res.data.column
  }

  async function deleteColumn(boardId: string, columnId: string) {
    await columnApi.delete(boardId, columnId)
    columns.value = columns.value.filter((c) => c.id !== columnId)
  }

  async function updateColumn(boardId: string, columnId: string, name: string) {
    const res = await columnApi.update(boardId, columnId, { name })
    const idx = columns.value.findIndex((c) => c.id === columnId)
    if (idx !== -1) columns.value[idx] = res.data.column
  }

  function clearColumns() {
    columns.value = []
  }

  return {
    columns,
    loading,
    fetchColumns,
    createColumn,
    deleteColumn,
    updateColumn,
    clearColumns,
  }
})