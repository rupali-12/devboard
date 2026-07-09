// server/src/middleware/requireBoardRole.ts
import { Response, NextFunction } from 'express'
import { Board } from '../models/Board'
import { AuthRequest } from './authenticate'

// Extend AuthRequest to carry board data for downstream handlers
export interface BoardRequest extends AuthRequest {
  board?: InstanceType<typeof Board>
  boardRole?: 'owner' | 'member' | 'viewer'
}

// Factory function — returns a middleware that checks for specific roles
export function requireBoardRole(...allowedRoles: ('owner' | 'member' | 'viewer')[]) {
  return async (req: BoardRequest, res: Response, next: NextFunction) => {
    const { boardId } = req.params

    if (!boardId) {
      return res.status(400).json({ error: 'Board ID is required' })
    }

    const board = await Board.findById(boardId)

    if (!board) {
      return res.status(404).json({ error: 'Board not found' })
    }

    if (board.isArchived) {
      return res.status(410).json({ error: 'This board has been archived' })
    }

    // Find this user's membership entry in the board
    const member = board.members.find(
      (m) => m.userId.toString() === req.user!.userId
    )

    if (!member) {
      return res.status(403).json({ error: 'You are not a member of this board' })
    }

    if (!allowedRoles.includes(member.role)) {
      return res.status(403).json({
        error: `This action requires ${allowedRoles.join(' or ')} role. Your role: ${member.role}`,
      })
    }

    // Attach board and role to request for use in route handlers
    req.board = board
    req.boardRole = member.role
    next()
  }
}