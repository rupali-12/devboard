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
        <h1 class="text-2xl font-bold text-gray-900">Create your account</h1>
        <p class="text-gray-500 mt-1 text-sm">Start managing projects with your team</p>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl shadow-xl p-8">
        <AppAlert :message="errorMessage" type="error" class="mb-6" />

        <form @submit.prevent="handleRegister" class="space-y-5" novalidate>
          <AppInput
            v-model="form.name"
            label="Full Name"
            placeholder="Rupali Sharma"
            :error="fieldErrors.name"
            required
            autocomplete="name"
          />

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
            placeholder="At least 8 characters"
            :error="fieldErrors.password"
            hint="Must contain uppercase letter and a number"
            required
            autocomplete="new-password"
          />

          <AppButton
            type="submit"
            size="lg"
            :loading="authStore.loading"
            class="w-full"
          >
            Create Account
          </AppButton>
        </form>

        <p class="text-center text-sm text-gray-500 mt-6">
          Already have an account?
          <RouterLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
            Sign in
          </RouterLink>
        </p>
      </div>
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

// Form state — reactive() for objects with multiple related fields
const form = reactive({
  name: '',
  email: '',
  password: '',
})

// Error state
const errorMessage = ref('')
const fieldErrors = reactive({
  name: '',
  email: '',
  password: '',
})

function clearErrors() {
  errorMessage.value = ''
  fieldErrors.name = ''
  fieldErrors.email = ''
  fieldErrors.password = ''
}

async function handleRegister() {
  clearErrors()

  try {
    await authStore.register(form)
    router.push({ name: 'Dashboard' })
  } catch (err: unknown) {
    // Handle different error shapes from the API
    if (err && typeof err === 'object' && 'response' in err) {
      const axiosErr = err as { response?: { data?: { error?: string; details?: Record<string, string[]> } } }
      const data = axiosErr.response?.data

      if (data?.details) {
        // Zod validation errors — map to individual field errors
        if (data.details.name?.[0]) fieldErrors.name = data.details.name[0]
        if (data.details.email?.[0]) fieldErrors.email = data.details.email[0]
        if (data.details.password?.[0]) fieldErrors.password = data.details.password[0]
      } else if (data?.error) {
        // Business logic error (e.g. email already exists)
        errorMessage.value = data.error
      }
    } else {
      errorMessage.value = 'Something went wrong. Please try again.'
    }
  }
}
</script>