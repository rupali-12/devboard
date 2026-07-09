import { z } from 'zod'

export const createTaskSchema = z.object({
  columnId: z.string().min(1, 'Column ID is required'),
  title: z.string().trim().min(1, 'Task title is required').max(200),
  description: z.string().max(5000).optional().default(''),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional().default('medium'),
  labels: z
    .array(z.object({ name: z.string(), color: z.string() }))
    .optional()
    .default([]),
  assignees: z.array(z.string()).optional().default([]),
  dueDate: z.string().datetime().nullable().optional(),
})

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  labels: z.array(z.object({ name: z.string(), color: z.string() })).optional(),
  assignees: z.array(z.string()).optional(),
  dueDate: z.string().datetime().nullable().optional(),
})

export const moveTaskSchema = z.object({
  columnId: z.string().min(1, 'Column ID is required'),
  position: z.number().int().min(0),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>
export type MoveTaskInput = z.infer<typeof moveTaskSchema>