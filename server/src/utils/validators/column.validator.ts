import { z } from 'zod'

export const createColumnSchema = z.object({
  name: z.string().trim().min(1, 'Column name is required').max(50),
  color: z.string().optional().default('#E2E8F0'),
})

export const updateColumnSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  color: z.string().optional(),
  taskLimit: z.number().int().positive().nullable().optional(),
})

export const reorderColumnsSchema = z.object({
  orderedIds: z.array(z.string()).min(1, 'orderedIds must not be empty'),
})

export type CreateColumnInput = z.infer<typeof createColumnSchema>
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>