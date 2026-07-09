// server/src/models/Column.ts
import { Schema, model, Document, Types } from 'mongoose'

export interface IColumn extends Document {
  _id: Types.ObjectId
  boardId: Types.ObjectId
  name: string
  position: number
  color: string
  taskLimit: number | null
  createdAt: Date
  updatedAt: Date
}

const columnSchema = new Schema<IColumn>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Column name is required'],
      trim: true,
      minlength: 1,
      maxlength: 50,
    },
    position: {
      type: Number,
      required: true,
    },
    color: {
      type: String,
      default: '#E2E8F0',
    },
    taskLimit: {
      type: Number,
      default: null, // null means no limit (unlimited tasks)
    },
  },
  { timestamps: true }
)

// All column queries filter by boardId first
columnSchema.index({ boardId: 1, position: 1 })

export const Column = model<IColumn>('Column', columnSchema)