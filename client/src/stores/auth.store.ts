// client/src/stores/auth.store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi, type LoginPayload, type RegisterPayload } from '../api/auth.api'
import type { User } from '../types'

export const useAuthStore = defineStore('auth', () => {
  // ── State ──────────────────────────────────────────────────
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false) // Has the app checked for an existing session yet?

  // ── Getters ────────────────────────────────────────────────
  const isAuthenticated = computed(() => !!user.value)

  // ── Actions ────────────────────────────────────────────────

  // Called once on app startup — checks if there's an existing session
 async function init() {
  try {
    const res = await authApi.me()
    user.value = res.data.user
  } catch {
    // 401 = no session. This is expected for logged-out users.
    // Do NOT re-throw. Just set user to null and mark initialized.
    user.value = null
  } finally {
    initialized.value = true  // Always set this, success or failure
  }
}

  async function register(payload: RegisterPayload) {
    loading.value = true
    try {
      const res = await authApi.register(payload)
      user.value = res.data.user
    } finally {
      loading.value = false
    }
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    try {
      const res = await authApi.login(payload)
      user.value = res.data.user
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
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