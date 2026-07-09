// server/src/models/Task.ts
import { Schema, model, Document, Types } from 'mongoose'

interface ILabel {
  name: string
  color: string
}

interface IChecklistItem {
  _id: Types.ObjectId
  text: string
  isDone: boolean
}

export interface ITask extends Document {
  _id: Types.ObjectId
  boardId: Types.ObjectId
  columnId: Types.ObjectId
  title: string
  description: string
  position: number
  priority: 'low' | 'medium' | 'high' | 'urgent'
  labels: ILabel[]
  assignees: Types.ObjectId[]
  dueDate: Date | null
  createdBy: Types.ObjectId
  isArchived: boolean
  checklistItems: IChecklistItem[]
  createdAt: Date
  updatedAt: Date
}

const taskSchema = new Schema<ITask>(
  {
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      maxlength: 5000,
    },
    position: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    labels: [
      {
        name: { type: String, required: true },
        color: { type: String, required: true },
        _id: false,
      },
    ],
    assignees: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    dueDate: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    checklistItems: [
      {
        text: { type: String, required: true },
        isDone: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
)

// Primary query pattern: get all tasks for a board grouped by column
taskSchema.index({ boardId: 1, columnId: 1, position: 1 })
// For assignee filtering
taskSchema.index({ boardId: 1, assignees: 1 })
// For full-text search on title and description
taskSchema.index({ title: 'text', description: 'text' })

export const Task = model<ITask>('Task', taskSchema)