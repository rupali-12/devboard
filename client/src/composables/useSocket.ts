import { onMounted, onUnmounted } from 'vue'
import { useSocketStore } from '@/stores/socket.store'
import api from '@/api/axios'

export function useSocket(boardId: string) {
  const socketStore = useSocketStore()

  onMounted(async () => {
    const socketUrl = (import.meta as any).env.VITE_SOCKET_URL as string | undefined
    if (!socketUrl) {
      console.info('Socket.io disabled in current environment; using REST-only mode')
      return
    }

    try {
      // Get a socket-specific token from our API
      // This works because the JWT cookie is sent automatically by axios
      const res = await api.get<{ token: string }>('/auth/socket-token')
      const token = res.data.token

      socketStore.connect(token)
      socketStore.joinBoard(boardId)
    } catch (err) {
      console.error('Failed to get socket token:', err)
    }
  })

  onUnmounted(() => {
    socketStore.leaveBoard(boardId)
    socketStore.disconnect()
  })

  return {
    onlineUsers: socketStore.onlineUsers,
    isConnected: socketStore.isConnected,
    emitTaskMove: socketStore.emitTaskMove,
  }
}