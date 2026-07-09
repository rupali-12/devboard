<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md">

      <!-- Logo / Brand -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-2xl mb-4 shadow-lg">
          <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p class="text-gray-500 mt-1 text-sm">Sign in to your DevBoard account</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <AppAlert :message="errorMessage" type="error" class="mb-6" />

        <form @submit.prevent="handleLogin" class="space-y-5" novalidate>
          <AppInput
            v-model="form.email"
            label="Email Address"
            type="email"
            placeholder="rupali@example.com"
            :error="fieldErrors.email"
            required
            autocomplete="email"
          />

          <AppInput
            v-model="form.password"
            label="Password"
            type="password"
            placeholder="Your password"
            :error="fieldErrors.password"
            required
            autocomplete="current-password"
          />

          <AppButton
            type="submit"
            size="lg"
            :loading="authStore.loading"
            class="w-full"
          >
            Sign In
          </AppButton>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Don't have an account?
          <RouterLink to="/register" class="text-blue-600 hover:text-blue-700 font-medium">
            Create one free
          </RouterLink>
        </p>
      </div>

      <!-- Demo credentials hint for portfolio viewers -->
      <p class="text-center text-xs text-gray-400 mt-4">
        Building this project as a portfolio demo
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth.store'
import AppButton from '../components/ui/AppButton.vue'
import AppInput from '../components/ui/AppInput.vue'
import AppAlert from '../components/ui/AppAlert.vue'

const router = useRouter()
const authStore = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errorMessage = ref('')
const fieldErrors = reactive({
  email: '',
  password: '',
})

function clearErrors() {
  errorMessage.value = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
}

async function handleLogin() {
  clearErrors()

  try {
    await authStore.login(form)
    router.push({ name: 'Dashboard' })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { error?: string; details?: Record<string, string[]> } } }
      const data = axiosErr.response?.data

      if (data?.details) {
        if (data.details.email?.[0]) fieldErrors.email = data.details.email[0]
        if (data.details.password?.[0]) fieldErrors.password = data.details.password[0]
      } else if (data?.error) {
        errorMessage.value = data.error
      }
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  }
}
</script>