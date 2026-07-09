// client/src/stores/board.store.ts
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { boardApi, type CreateBoardPayload } from '../api/board.api'
import type { Board } from '../types'

export const useBoardStore = defineStore('board', () => {
  // ── State ─────────────────────────────────────────────────
  const boards = ref<Board[]>([])
  const currentBoard = ref<Board | null>(null)
  const loading = ref(false)

  // ── Actions ───────────────────────────────────────────────

  async function fetchBoards() {
    loading.value = true
    try {
      const res = await boardApi.getAll()
      boards.value = res.data.boards
    } finally {
      loading.value = false
    }
  }

  async function fetchBoard(boardId: string) {
    loading.value = true
    try {
      const res = await boardApi.getById(boardId)
      currentBoard.value = res.data.board
    } finally {
      loading.value = false
    }
  }

  async function createBoard(payload: CreateBoardPayload) {
    const res = await boardApi.create(payload)
    // Add the new board to the top of the list immediately
    boards.value.unshift(res.data.board)
    return res.data.board
  }

  async function archiveBoard(boardId: string) {
    await boardApi.archive(boardId)
    // Remove from list immediately (optimistic update)
    boards.value = boards.value.filter((b) => b.id !== boardId)
    if (currentBoard.value?.id === boardId) {
      currentBoard.value = null
    }
  }

  function clearCurrentBoard() {
    currentBoard.value = null
  }

  return {
    boards,
    currentBoard,
    loading,
    fetchBoards,
    fetchBoard,
    createBoard,
    archiveBoard,
    clearCurrentBoard,
  }
})