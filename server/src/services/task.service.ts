// server/src/services/task.service.ts
import { Task, ITask } from '../models/Task'
import { Types } from 'mongoose'
import {
  CreateTaskInput,
  UpdateTaskInput,
  MoveTaskInput,
} from '../utils/validators/task.validator'

export class TaskError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'TaskError'
  }
}

function sanitizeTask(task: ITask) {
  return {
    id: task._id.toString(),
    boardId: task.boardId.toString(),
    columnId: task.columnId.toString(),
    title: task.title,
    description: task.description,
    position: task.position,
    priority: task.priority,
    labels: task.labels,
    assignees: task.assignees.map((a) => a.toString()),
    dueDate: task.dueDate,
    createdBy: task.createdBy.toString(),
    isArchived: task.isArchived,
    checklistItems: task.checklistItems,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

// Get all tasks for a board grouped by columnId
export async function getTasksForBoard(boardId: string) {
  const tasks = await Task.find({ boardId, isArchived: false })
    .sort({ position: 1 })
    .lean()

  // Group by columnId — frontend needs { [columnId]: Task[] }
  const grouped: Record<string, ReturnType<typeof sanitizeTask>[]> = {}

  for (const task of tasks) {
    const colId = task.columnId.toString()
    if (!grouped[colId]) grouped[colId] = []
    grouped[colId].push({
      id: task._id.toString(),
      boardId: task.boardId.toString(),
      columnId: colId,
      title: task.title,
      description: task.description,
      position: task.position,
      priority: task.priority,
      labels: task.labels,
      assignees: task.assignees.map((a) => a.toString()),
      dueDate: task.dueDate,
      createdBy: task.createdBy.toString(),
      isArchived: task.isArchived,
      checklistItems: task.checklistItems,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    })
  }

  return grouped
}

export async function createTask(
  boardId: string,
  userId: string,
  input: CreateTaskInput
) {
  // Place new task at the end of the target column
  const lastTask = await Task.findOne({
    boardId,
    columnId: input.columnId,
    isArchived: false,
  }).sort({ position: -1 })

  const position = lastTask ? lastTask.position + 1 : 0

  const task = await Task.create({
    ...input,
    boardId,
    position,
    createdBy: new Types.ObjectId(userId),
    assignees: input.assignees.map((id) => new Types.ObjectId(id)),
  })

  return sanitizeTask(task)
}

export async function updateTask(task: ITask, input: UpdateTaskInput) {
  // Handle assignees conversion from string[] to ObjectId[]
  if (input.assignees) {
    task.assignees = input.assignees.map((id) => new Types.ObjectId(id))
  }

  // Update all other fields
  const { assignees: _, ...rest } = input
  Object.assign(task, rest)

  await task.save()
  return sanitizeTask(task)
}

// ─────────────────────────────────────────────────────────────────────────────
// MOVE TASK — This is the most complex operation in the entire app.
// Moving a task means:
// 1. Update the task's columnId and position
// 2. Recompact positions in the destination column (no gaps)
// 3. Recompact positions in the source column (fill the gap left behind)
// All done with bulkWrite — single atomic DB operation.
// ─────────────────────────────────────────────────────────────────────────────
export async function moveTask(
  taskId: string,
  boardId: string,
  input: MoveTaskInput
) {
  const { columnId: toColumnId, position: newPosition } = input

  const task = await Task.findOne({ _id: taskId, boardId })
  if (!task) throw new TaskError('Task not found', 404)

  const fromColumnId = task.columnId.toString()
  const movingWithinSameColumn = fromColumnId === toColumnId

  // Get all tasks in the destination column (excluding the moving task)
  const destTasks = await Task.find({
    boardId,
    columnId: toColumnId,
    isArchived: false,
    _id: { $ne: taskId }, // Exclude the task being moved
  })
    .sort({ position: 1 })
    .lean()

  // Insert the moving task at the new position
  destTasks.splice(newPosition, 0, { _id: task._id } as typeof destTasks[0])

  // Build bulk operations for destination column
  const bulkOps = destTasks.map((t, idx) => ({
    updateOne: {
      filter: { _id: t._id },
      update: {
        $set: {
          position: idx,
          columnId: new Types.ObjectId(toColumnId),
        },
      },
    },
  }))

  // If moving between different columns, also recompact source column
  if (!movingWithinSameColumn) {
    const srcTasks = await Task.find({
      boardId,
      columnId: fromColumnId,
      isArchived: false,
      _id: { $ne: taskId },
    })
      .sort({ position: 1 })
      .lean()

    srcTasks.forEach((t, idx) => {
      bulkOps.push({
        updateOne: {
          filter: { _id: t._id },
          update: { $set: { position: idx, columnId: t.columnId } },
        },
      })
    })
  }

  // Execute all position updates in one atomic operation
  await Task.bulkWrite(bulkOps)

  // Return the updated task
  const updatedTask = await Task.findById(taskId)
  return sanitizeTask(updatedTask!)
}

export async function archiveTask(task: ITask) {
  task.isArchived = true
  await task.save()

  // Recompact remaining tasks in column
  const remaining = await Task.find({
    boardId: task.boardId,
    columnId: task.columnId,
    isArchived: false,
  }).sort({ position: 1 })

  const bulkOps = remaining.map((t, idx) => ({
    updateOne: {
      filter: { _id: t._id },
      update: { $set: { position: idx } },
    },
  }))
  if (bulkOps.length > 0) await Task.bulkWrite(bulkOps)
}

export async function getTaskById(taskId: string, boardId: string) {
  const task = await Task.findOne({ _id: taskId, boardId })
    .populate('assignees', 'name email avatar')
    .populate('createdBy', 'name email avatar')
  if (!task) throw new TaskError('Task not found', 404)
  return task
}