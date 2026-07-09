// server/src/services/column.service.ts
import { Column, IColumn } from '../models/Column'
import { Task } from '../models/Task'
import { CreateColumnInput, UpdateColumnInput } from '../utils/validators/column.validator'

export class ColumnError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'ColumnError'
  }
}

function sanitizeColumn(col: IColumn) {
  return {
    id: col._id.toString(),
    boardId: col.boardId.toString(),
    name: col.name,
    position: col.position,
    color: col.color,
    taskLimit: col.taskLimit,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
  }
}

export async function getColumns(boardId: string) {
  const columns = await Column.find({ boardId }).sort({ position: 1 }).lean()
  return columns.map((c) => ({
    id: c._id.toString(),
    boardId: c.boardId.toString(),
    name: c.name,
    position: c.position,
    color: c.color,
    taskLimit: c.taskLimit,
  }))
}

export async function createColumn(boardId: string, input: CreateColumnInput) {
  // Position = place at end of existing columns
  const lastColumn = await Column.findOne({ boardId }).sort({ position: -1 })
  const position = lastColumn ? lastColumn.position + 1 : 0

  const column = await Column.create({ ...input, boardId, position })
  return sanitizeColumn(column)
}

export async function updateColumn(column: IColumn, input: UpdateColumnInput) {
  Object.assign(column, input)
  await column.save()
  return sanitizeColumn(column)
}

export async function deleteColumn(column: IColumn) {
  // Archive all tasks in this column first
  await Task.updateMany(
    { columnId: column._id },
    { isArchived: true }
  )
  await column.deleteOne()

  // Recompact positions of remaining columns
  const remaining = await Column.find({ boardId: column.boardId }).sort({ position: 1 })
  const bulkOps = remaining.map((col, idx) => ({
    updateOne: {
      filter: { _id: col._id },
      update: { $set: { position: idx } },
    },
  }))
  if (bulkOps.length > 0) await Column.bulkWrite(bulkOps)
}

export async function reorderColumns(boardId: string, orderedIds: string[]) {
  // Build a bulk update — set each column's position based on its index in orderedIds
  const bulkOps = orderedIds.map((id, idx) => ({
    updateOne: {
      filter: { _id: id, boardId },
      update: { $set: { position: idx } },
    },
  }))
  await Column.bulkWrite(bulkOps)

  return getColumns(boardId)
}