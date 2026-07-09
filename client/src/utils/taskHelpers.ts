export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export const priorityConfig: Record<Priority, { label: string; color: string; dot: string }> = {
  low:    { label: 'Low',    color: 'text-gray-500',   dot: 'bg-gray-400' },
  medium: { label: 'Medium', color: 'text-blue-500',   dot: 'bg-blue-400' },
  high:   { label: 'High',   color: 'text-orange-500', dot: 'bg-orange-400' },
  urgent: { label: 'Urgent', color: 'text-red-500',    dot: 'bg-red-500' },
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}