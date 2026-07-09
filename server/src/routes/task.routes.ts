import { Router, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import { requireBoardRole, BoardRequest } from '../middleware/requireBoardRole'
import { validate } from '../middleware/validate'
import {
  createTaskSchema,
  updateTaskSchema,
  moveTaskSchema,
} from '../utils/validators/task.validator'
import {
  getTasksForBoard,
  createTask,
  updateTask,
  moveTask,
  archiveTask,
  getTaskById,
  TaskError,
} from '../services/task.service'
import { Task } from '../models/Task'

const router = Router({ mergeParams: true })

router.use(authenticate)

// Helper to safely extract string param
const param = (val: string | string[]): string =>
  Array.isArray(val) ? val[0] : val

function handleError(error: unknown, res: Response) {
  if (error instanceof TaskError) {
    return res.status(error.statusCode).json({ error: error.message })
  }
  console.error('Task error:', error)
  res.status(500).json({ error: 'Something went wrong.' })
}

// GET /boards/:boardId/tasks
router.get(
  '/',
  requireBoardRole('owner', 'member', 'viewer'),
  async (req: BoardRequest, res: Response) => {
    try {
      const tasks = await getTasksForBoard(param(req.params.boardId))
      res.json({ tasks })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// POST /boards/:boardId/tasks
router.post(
  '/',
  requireBoardRole('owner', 'member'),
  validate(createTaskSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const task = await createTask(
        param(req.params.boardId),
        req.user!.userId,
        req.body
      )
      res.status(201).json({ task })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// GET /boards/:boardId/tasks/archived — get all archived tasks
router.get(
  '/archived',
  requireBoardRole('owner', 'member', 'viewer'),
  async (req: BoardRequest, res: Response) => {
    try {
      const { Task } = await import('../models/Task')
      const tasks = await Task.find({
        boardId: param(req.params.boardId),
        isArchived: true,
      })
        .sort({ updatedAt: -1 })
        .lean()

      const formatted = tasks.map((t) => ({
        id: t._id.toString(),
        boardId: t.boardId.toString(),
        columnId: t.columnId.toString(),
        title: t.title,
        description: t.description,
        priority: t.priority,
        labels: t.labels,
        assignees: t.assignees.map((a) => a.toString()),
        dueDate: t.dueDate,
        createdBy: t.createdBy.toString(),
        isArchived: t.isArchived,
        checklistItems: t.checklistItems,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      }))

      res.json({ tasks: formatted })
    } catch (error) {
      console.error('Get archived error:', error)
      res.status(500).json({ error: 'Something went wrong.' })
    }
  }
)

// GET /boards/:boardId/tasks/:taskId
router.get(
  '/:taskId',
  requireBoardRole('owner', 'member', 'viewer'),
  async (req: BoardRequest, res: Response) => {
    try {
      const task = await getTaskById(
        param(req.params.taskId),
        param(req.params.boardId)
      )
      res.json({ task })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId/tasks/:taskId/restore — restore archived task
router.patch(
  '/:taskId/restore',
  requireBoardRole('owner', 'member'),
  async (req: BoardRequest, res: Response) => {
    try {
      const { Task } = await import('../models/Task')

      const task = await Task.findOne({
        _id: param(req.params.taskId),
        boardId: param(req.params.boardId),
        isArchived: true,
      })

      if (!task) {
        return res.status(404).json({ error: 'Archived task not found' })
      }

      // Restore — put it at the end of its original column
      const lastTask = await Task.findOne({
        boardId: task.boardId,
        columnId: task.columnId,
        isArchived: false,
      }).sort({ position: -1 })

      task.isArchived = false
      task.position = lastTask ? lastTask.position + 1 : 0
      await task.save()

      res.json({
        task: {
          id: task._id.toString(),
          boardId: task.boardId.toString(),
          columnId: task.columnId.toString(),
          title: task.title,
          position: task.position,
          priority: task.priority,
          labels: task.labels,
          description: task.description,
          assignees: task.assignees.map((a) => a.toString()),
          dueDate: task.dueDate,
          createdBy: task.createdBy.toString(),
          isArchived: false,
          checklistItems: task.checklistItems,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }
      })
    } catch (error) {
      console.error('Restore error:', error)
      res.status(500).json({ error: 'Something went wrong.' })
    }
  }
)

// PATCH /boards/:boardId/tasks/:taskId
router.patch(
  '/:taskId',
  requireBoardRole('owner', 'member'),
  validate(updateTaskSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const task = await Task.findOne({
        _id: param(req.params.taskId),
        boardId: param(req.params.boardId),
      })
      if (!task) return res.status(404).json({ error: 'Task not found' })

      const updated = await updateTask(task, req.body)
      res.json({ task: updated })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId/tasks/:taskId/move
router.patch(
  '/:taskId/move',
  requireBoardRole('owner', 'member'),
  validate(moveTaskSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const task = await moveTask(
        param(req.params.taskId),
        param(req.params.boardId),
        req.body
      )
      res.json({ task })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// DELETE /boards/:boardId/tasks/:taskId/permanent — permanently delete a task
router.delete(
  '/:taskId/permanent',
  requireBoardRole('owner', 'member'),
  async (req: BoardRequest, res: Response) => {
    try {
      const { Task } = await import('../models/Task')

      const task = await Task.findOneAndDelete({
        _id: param(req.params.taskId),
        boardId: param(req.params.boardId),
      })

      if (!task) {
        return res.status(404).json({ error: 'Task not found' })
      }

      // Recompact positions of remaining tasks in that column
      const remaining = await Task.find({
        boardId: param(req.params.boardId),
        columnId: task.columnId,
        isArchived: false,
      }).sort({ position: 1 })

      if (remaining.length > 0) {
        const bulkOps = remaining.map((t, idx) => ({
          updateOne: {
            filter: { _id: t._id },
            update: { $set: { position: idx } },
          },
        }))
        await Task.bulkWrite(bulkOps)
      }

      res.json({ message: 'Task permanently deleted' })
    } catch (error) {
      console.error('Permanent delete error:', error)
      res.status(500).json({ error: 'Something went wrong.' })
    }
  }
)

// DELETE /boards/:boardId/tasks/:taskId
router.delete(
  '/:taskId',
  requireBoardRole('owner', 'member'),
  async (req: BoardRequest, res: Response) => {
    try {
      const task = await Task.findOne({
        _id: param(req.params.taskId),
        boardId: param(req.params.boardId),
      })
      if (!task) return res.status(404).json({ error: 'Task not found' })

      await archiveTask(task)
      res.json({ message: 'Task archived successfully' })
    } catch (error) {
      handleError(error, res)
    }
  }
)

export default router