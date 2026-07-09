<template>
  <div class="flex-shrink-0 w-72">
    <!-- Input form -->
    <div v-if="isOpen" class="bg-gray-100 rounded-xl p-3">
      <AppInput
        ref="inputRef"
        v-model="name"
        placeholder="Column name..."
        :error="error"
        @keydown.enter="handleAdd"
        @keydown.esc="close"
      />
      <div class="flex gap-2 mt-2">
        <AppButton size="sm" :loading="loading" @click="handleAdd">
          Add Column
        </AppButton>
        <AppButton size="sm" variant="ghost" @click="close"> Cancel </AppButton>
      </div>
    </div>

    <!-- Trigger button -->
    <button
      v-else
      class="w-full flex items-center gap-2 px-4 py-3 bg-white/80 hover:bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-sm text-gray-600 hover:text-gray-800 transition-all duration-200 shadow-sm font-medium"
      @click="open"
    >
      <svg
        class="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
      Add column
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import AppInput from "@/components/ui/AppInput.vue";
import AppButton from "@/components/ui/AppButton.vue";

const emit = defineEmits<{ created: [name: string] }>();

const isOpen = ref(false);
const name = ref("");
const error = ref("");
const loading = ref(false);

async function open() {
  isOpen.value = true;
  await nextTick();
}

function close() {
  isOpen.value = false;
  name.value = "";
  error.value = "";
}

async function handleAdd() {
  if (!name.value.trim()) {
    error.value = "Column name is required";
    return;
  }
  loading.value = true;
  try {
    emit("created", name.value.trim());
    close();
  } finally {
    loading.value = false;
  }
}
</script>
