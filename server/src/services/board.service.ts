// server/src/services/board.service.ts
import { Board, IBoard } from '../models/Board'
import { User } from '../models/User'
import {
  CreateBoardInput,
  UpdateBoardInput,
  InviteMemberInput,
} from '../utils/validators/board.validator'
import { Types } from 'mongoose'

export class BoardError extends Error {
  statusCode: number
  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.name = 'BoardError'
  }
}

// Strips MongoDB internals and returns clean data for API responses
function sanitizeBoard(board: IBoard) {
  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    background: board.background,
    ownerId: board.ownerId.toString(),
    members: board.members.map((m) => ({
      userId: m.userId.toString(),
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    isArchived: board.isArchived,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  }
}

// Create a new board — creator automatically becomes owner
export async function createBoard(userId: string, input: CreateBoardInput) {
  const board = await Board.create({
    ...input,
    ownerId: userId,
    members: [
      {
        userId: new Types.ObjectId(userId),
        role: 'owner',
        joinedAt: new Date(),
      },
    ],
  })

  return sanitizeBoard(board)
}

// Get all boards where this user is a member (any role)
export async function getUserBoards(userId: string) {
  const boards = await Board.find({
    'members.userId': new Types.ObjectId(userId),
    isArchived: false,
  })
    .sort({ updatedAt: -1 }) // Most recently updated first
    .lean()

  return boards.map((b) => ({
    id: b._id.toString(),
    name: b.name,
    description: b.description,
    background: b.background,
    ownerId: b.ownerId.toString(),
    memberCount: b.members.length,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
  }))
}

// Get a single board with full member details populated
export async function getBoardById(boardId: string) {
  const board = await Board.findById(boardId)
    .populate('members.userId', 'name email avatar') // Replace userId ObjectId with actual user data
    .lean()

  if (!board) {
    throw new BoardError('Board not found', 404)
  }

  return {
    id: board._id.toString(),
    name: board.name,
    description: board.description,
    background: board.background,
    ownerId: board.ownerId.toString(),
    members: board.members.map((m) => ({
      user: m.userId, // Populated user object
      role: m.role,
      joinedAt: m.joinedAt,
    })),
    isArchived: board.isArchived,
    createdAt: board.createdAt,
    updatedAt: board.updatedAt,
  }
}

// Update board name / description / background
export async function updateBoard(
  board: IBoard,
  input: UpdateBoardInput
) {
  Object.assign(board, input)
  await board.save()
  return sanitizeBoard(board)
}

// Soft delete — mark as archived instead of actually deleting
// Keeps data intact in case user wants to restore later
export async function archiveBoard(board: IBoard) {
  board.isArchived = true
  await board.save()
}

// Invite a user to a board by email
export async function inviteMember(board: IBoard, input: InviteMemberInput) {
  const { email, role } = input

  // Find the user being invited
  const invitedUser = await User.findOne({ email })
  if (!invitedUser) {
    throw new BoardError('No account found with that email address', 404)
  }

  // Check they're not already a member
  const alreadyMember = board.members.some(
    (m) => m.userId.toString() === invitedUser._id.toString()
  )
  if (alreadyMember) {
    throw new BoardError('This user is already a member of this board', 409)
  }

  board.members.push({
    userId: invitedUser._id,
    role,
    joinedAt: new Date(),
  })

  await board.save()

  return {
    user: {
      id: invitedUser._id.toString(),
      name: invitedUser.name,
      email: invitedUser.email,
      avatar: invitedUser.avatar,
    },
    role,
  }
}

// Remove a member from a board (owner cannot be removed)
export async function removeMember(board: IBoard, targetUserId: string) {
  const memberIndex = board.members.findIndex(
    (m) => m.userId.toString() === targetUserId
  )

  if (memberIndex === -1) {
    throw new BoardError('User is not a member of this board', 404)
  }

  if (board.members[memberIndex].role === 'owner') {
    throw new BoardError('Cannot remove the board owner', 400)
  }

  board.members.splice(memberIndex, 1)
  await board.save()
}

// Change a member's role
export async function updateMemberRole(
  board: IBoard,
  targetUserId: string,
  newRole: 'member' | 'viewer'
) {
  const member = board.members.find(
    (m) => m.userId.toString() === targetUserId
  )

  if (!member) {
    throw new BoardError('User is not a member of this board', 404)
  }

  if (member.role === 'owner') {
    throw new BoardError('Cannot change the owner role', 400)
  }

  member.role = newRole
  await board.save()

  return { userId: targetUserId, role: newRole }
}