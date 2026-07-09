<template>
  <div
    :class="[
      'bg-white rounded-lg p-3 select-none',
      'border border-gray-200 shadow-sm',
      'hover:shadow-md hover:border-blue-300 transition-all duration-150 group',
      isOverdue(task.dueDate) ? 'border-l-[3px] border-l-red-400' : '',
    ]"
    @click="$emit('click', task)"
  >
    <!-- Labels -->
    <div v-if="task.labels?.length" class="flex flex-wrap gap-1 mb-2">
      <span
        v-for="label in task.labels"
        :key="label.name"
        class="text-xs px-2 py-0.5 rounded-full font-medium"
        :style="{ backgroundColor: label.color + '22', color: label.color }"
      >
        {{ label.name }}
      </span>
    </div>

    <!-- Title -->
    <p class="text-sm font-medium text-gray-800 leading-snug">
      {{ task.title }}
    </p>

    <!-- Description preview -->
    <p v-if="task.description" class="text-xs text-gray-400 mt-1 line-clamp-2">
      {{ task.description }}
    </p>

    <!-- Footer -->
    <div class="flex items-center justify-between mt-2.5">
      <div class="flex items-center gap-2">
        <!-- Priority dot -->
        <span class="flex items-center gap-1">
          <span :class="['w-2 h-2 rounded-full', priorityConfig[task.priority]?.dot ?? 'bg-gray-300']" />
          <span :class="['text-xs font-medium', priorityConfig[task.priority]?.color ?? 'text-gray-400']">
            {{ priorityConfig[task.priority]?.label ?? task.priority }}
          </span>
        </span>

        <!-- Due date -->
        <span
          v-if="task.dueDate"
          :class="['text-xs flex items-center gap-0.5', isOverdue(task.dueDate) ? 'text-red-500' : 'text-gray-400']"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {{ formatDate(task.dueDate) }}
        </span>
      </div>

      <!-- Action menu — three dots, visible on hover -->
      <div @click.stop>
        <TaskActionMenu
          @archive="$emit('archive', task.id)"
          @delete="$emit('permanentDelete', task.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '@/types'
import { priorityConfig, isOverdue, formatDate } from '@/utils/taskHelpers'
import TaskActionMenu from './TaskActionMenu.vue'

defineProps<{ task: Task }>()
defineEmits<{
  click: [task: Task]
  archive: [taskId: string]
  permanentDelete: [taskId: string]
}>()
</script>