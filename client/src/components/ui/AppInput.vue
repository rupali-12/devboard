<template>
  <div class="w-full">
    <label v-if="label" :for="inputId" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative">
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :class="[
          'w-full px-3 py-2 border rounded-lg text-sm transition-colors duration-200',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'placeholder:text-gray-400',
          error
            ? 'border-red-400 bg-red-50 text-red-900'
            : 'border-gray-300 bg-white text-gray-900 hover:border-gray-400',
          disabled && 'opacity-60 cursor-not-allowed bg-gray-50',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
    </div>

    <!-- Error message -->
    <p v-if="error" class="mt-1 text-xs text-red-600 flex items-center gap-1">
      <svg class="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>

    <!-- Helper text -->
    <p v-else-if="hint" class="mt-1 text-xs text-gray-500">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: string
    label?: string
    type?: string
    placeholder?: string
    error?: string
    hint?: string
    disabled?: boolean
    required?: boolean
    autocomplete?: string
  }>(),
  {
    type: 'text',
    disabled: false,
    required: false,
  }
)

defineEmits<{
  'update:modelValue': [value: string]
  'blur': []
}>()

// Generates a unique ID linking label to input for accessibility
const inputId = computed(() =>
  props.label
    ? `input-${props.label.toLowerCase().replace(/\s+/g, '-')}`
    : `input-${Math.random().toString(36).slice(2)}`
)
</script>