<template>
  <div
    class="group relative rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    @click="$router.push({ name: 'Board', params: { boardId: board.id } })"
  >
    <!-- Gradient background -->
    <div :class="['w-full h-28 bg-gradient-to-r', board.background]" />

    <!-- Board info bar -->
    <div class="bg-white px-4 py-3 border border-t-0 border-gray-200 rounded-b-xl">
      <h3 class="font-semibold text-gray-900 text-sm truncate">{{ board.name }}</h3>
      <div class="flex items-center justify-between mt-1">
        <p class="text-xs text-gray-400 truncate max-w-[70%]">
          {{ board.description || 'No description' }}
        </p>
        <span class="text-xs text-gray-400 flex items-center gap-1 flex-shrink-0">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {{ board.memberCount ?? 1 }}
        </span>
      </div>
    </div>

    <!-- Hover overlay with arrow -->
    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200 rounded-xl flex items-center justify-center">
      <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 rounded-full p-2">
        <svg class="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Board } from '@/src/types';

defineProps<{ board: Board }>()
</script>