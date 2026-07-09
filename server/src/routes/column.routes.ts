import { Router, Response } from 'express'
import { authenticate } from '../middleware/authenticate'
import { requireBoardRole, BoardRequest } from '../middleware/requireBoardRole'
import { validate } from '../middleware/validate'
import {
  createColumnSchema,
  updateColumnSchema,
  reorderColumnsSchema,
} from '../utils/validators/column.validator'
import {
  getColumns,
  createColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
  ColumnError,
} from '../services/column.service'
import { Column } from '../models/Column'

const router = Router({ mergeParams: true })

router.use(authenticate)

// Helper to safely extract string param
const param = (val: string | string[]): string =>
  Array.isArray(val) ? val[0] : val

function handleError(error: unknown, res: Response) {
  if (error instanceof ColumnError) {
    return res.status(error.statusCode).json({ error: error.message })
  }
  console.error('Column error:', error)
  res.status(500).json({ error: 'Something went wrong.' })
}

// GET /boards/:boardId/columns
router.get(
  '/',
  requireBoardRole('owner', 'member', 'viewer'),
  async (req: BoardRequest, res: Response) => {
    try {
      const columns = await getColumns(param(req.params.boardId))
      res.json({ columns })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// POST /boards/:boardId/columns
router.post(
  '/',
  requireBoardRole('owner', 'member'),
  validate(createColumnSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const column = await createColumn(param(req.params.boardId), req.body)
      res.status(201).json({ column })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId/columns/reorder
// Must be BEFORE /:columnId to avoid conflict
router.patch(
  '/reorder',
  requireBoardRole('owner', 'member'),
  validate(reorderColumnsSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const columns = await reorderColumns(
        param(req.params.boardId),
        req.body.orderedIds
      )
      res.json({ columns })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId/columns/:columnId
router.patch(
  '/:columnId',
  requireBoardRole('owner', 'member'),
  validate(updateColumnSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const column = await Column.findOne({
        _id: param(req.params.columnId),
        boardId: param(req.params.boardId),
      })
      if (!column) return res.status(404).json({ error: 'Column not found' })

      const updated = await updateColumn(column, req.body)
      res.json({ column: updated })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// DELETE /boards/:boardId/columns/:columnId
router.delete(
  '/:columnId',
  requireBoardRole('owner', 'member'),
  async (req: BoardRequest, res: Response) => {
    try {
      const column = await Column.findOne({
        _id: param(req.params.columnId),
        boardId: param(req.params.boardId),
      })
      if (!column) return res.status(404).json({ error: 'Column not found' })

      await deleteColumn(column)
      res.json({ message: 'Column deleted successfully' })
    } catch (error) {
      handleError(error, res)
    }
  }
)

export default router