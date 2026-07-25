// client/src/stores/auth.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth.api'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────
  const user = ref<User | null>(null)
  const token = ref<string | null>(typeof window !== 'undefined' ? window.localStorage.getItem('devboard_token') || window.sessionStorage.getItem('devboard_token') : null)
  const loading = ref(false)
  const initialized = ref(false) // Has the app checked for an existing session yet?

  // ── Getters ────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value)

  // ── Actions ────────────────────────────────────────────────
  function clearSession() {
    user.value = null
    token.value = null
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('devboard_token')
      window.sessionStorage.removeItem('devboard_token')
    }
  }

  function saveSession(nextUser: User, nextToken: string) {
    user.value = nextUser
    token.value = nextToken
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('devboard_token', nextToken)
      window.sessionStorage.setItem('devboard_token', nextToken)
    }
  }

  // Called once on app startup — checks if there's an existing session
  async function init() {
    if (!token.value) {
      user.value = null
      initialized.value = true
      return
    }

    try {
      const res = await authApi.me()
      user.value = res.data.user
    } catch {
      // 401 = no session. This is expected for logged-out users.
      // Do NOT re-throw. Just set user to null and mark initialized.
      clearSession()
    } finally {
      initialized.value = true
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    try {
      const res = await authApi.register(payload)
      saveSession(res.data.user, res.data.token)
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      const res = await authApi.login(payload)
      saveSession(res.data.user, res.data.token)
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    clearSession()
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    init,
    register,
    login,
    logout,
  }
})