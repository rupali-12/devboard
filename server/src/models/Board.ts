// server/src/models/Board.ts
import { Schema, model, Document, Types } from 'mongoose'

export interface IBoardMember {
  userId: Types.ObjectId
  role: 'owner' | 'member' | 'viewer'
  joinedAt: Date
}

export interface IBoard extends Document {
  _id: Types.ObjectId
  name: string
  description: string
  background: string
  ownerId: Types.ObjectId
  members: IBoardMember[]
  isArchived: boolean
  createdAt: Date
  updatedAt: Date
}

const boardMemberSchema = new Schema<IBoardMember>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: ['owner', 'member', 'viewer'],
      default: 'member',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false } // Don't generate _id for subdocuments
)

const boardSchema = new Schema<IBoard>(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 500,
    },
    background: {
      type: String,
      default: 'from-blue-500 to-cyan-400',
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [boardMemberSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Index: quickly find all boards a user belongs to
boardSchema.index({ 'members.userId': 1 })
// Index: find boards by owner
boardSchema.index({ ownerId: 1 })

export const Board = model<IBoard>('Board', boardSchema)