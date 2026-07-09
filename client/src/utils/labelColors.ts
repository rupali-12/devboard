export interface LabelOption {
  name: string
  color: string
}

export const defaultLabels: LabelOption[] = [
  { name: 'Bug',      color: '#EF4444' },
  { name: 'Feature',  color: '#3B82F6' },
  { name: 'Urgent',   color: '#F97316' },
  { name: 'Design',   color: '#8B5CF6' },
  { name: 'Backend',  color: '#10B981' },
  { name: 'Frontend', color: '#06B6D4' },
  { name: 'Testing',  color: '#F59E0B' },
  { name: 'Blocked',  color: '#6B7280' },
]