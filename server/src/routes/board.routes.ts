// server/src/routes/board.routes.ts
import { Router, Response } from 'express'
import { authenticate, AuthRequest } from '../middleware/authenticate'
import { requireBoardRole, BoardRequest } from '../middleware/requireBoardRole'
import { validate } from '../middleware/validate'
import {
  createBoardSchema,
  updateBoardSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../utils/validators/board.validator'
import {
  createBoard,
  getUserBoards,
  getBoardById,
  updateBoard,
  archiveBoard,
  inviteMember,
  removeMember,
  updateMemberRole,
  BoardError,
} from '../services/board.service'

const router = Router()

// All board routes require authentication
router.use(authenticate)

// Helper to handle BoardError vs unexpected errors consistently
function handleError(error: unknown, res: Response) {
  if (error instanceof BoardError) {
    return res.status(error.statusCode).json({ error: error.message })
  }
  console.error('Board route error:', error)
  res.status(500).json({ error: 'Something went wrong. Please try again.' })
}

// ── Board CRUD ────────────────────────────────────────────────────────────────

// GET /boards — get all boards for logged-in user
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const boards = await getUserBoards(req.user!.userId)
    res.json({ boards })
  } catch (error) {
    handleError(error, res)
  }
})

// POST /boards — create a new board
router.post('/', validate(createBoardSchema), async (req: AuthRequest, res: Response) => {
  try {
    const board = await createBoard(req.user!.userId, req.body)
    res.status(201).json({ board })
  } catch (error) {
    handleError(error, res)
  }
})

// GET /boards/:boardId — get single board with members
// All roles can view
router.get(
  '/:boardId',
  requireBoardRole('owner', 'member', 'viewer'),
  async (req: BoardRequest, res: Response) => {
    try {
      const boardId = Array.isArray(req.params.boardId) ? req.params.boardId[0] : req.params.boardId
      const board = await getBoardById(boardId)
      res.json({ board })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId — update board name/description/background
// Only owner can update board settings
router.patch(
  '/:boardId',
  requireBoardRole('owner'),
  validate(updateBoardSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const board = await updateBoard(req.board!, req.body)
      res.json({ board })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// DELETE /boards/:boardId — archive the board
// Only owner can delete
router.delete(
  '/:boardId',
  requireBoardRole('owner'),
  async (req: BoardRequest, res: Response) => {
    try {
      await archiveBoard(req.board!)
      res.json({ message: 'Board archived successfully' })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// ── Member Management ─────────────────────────────────────────────────────────

// POST /boards/:boardId/invite — invite a user by email
router.post(
  '/:boardId/invite',
  requireBoardRole('owner'),
  validate(inviteMemberSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const member = await inviteMember(req.board!, req.body)
      res.status(201).json({ member, message: `${member.user.name} added to board` })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// DELETE /boards/:boardId/members/:userId — remove a member
router.delete(
  '/:boardId/members/:userId',
  requireBoardRole('owner'),
  async (req: BoardRequest, res: Response) => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
      await removeMember(req.board!, userId)
      res.json({ message: 'Member removed from board' })
    } catch (error) {
      handleError(error, res)
    }
  }
)

// PATCH /boards/:boardId/members/:userId — change a member's role
router.patch(
  '/:boardId/members/:userId',
  requireBoardRole('owner'),
  validate(updateMemberRoleSchema),
  async (req: BoardRequest, res: Response) => {
    try {
      const userId = Array.isArray(req.params.userId) ? req.params.userId[0] : req.params.userId
      const result = await updateMemberRole(req.board!, userId, req.body.role)
      res.json({ result, message: 'Member role updated' })
    } catch (error) {
      handleError(error, res)
    }
  }
)

export default router