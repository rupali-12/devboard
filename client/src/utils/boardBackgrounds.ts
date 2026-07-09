// client/src/utils/boardBackgrounds.ts

export interface BackgroundOption {
  id: string
  label: string
  classes: string  // Tailwind gradient classes
}

export const boardBackgrounds: BackgroundOption[] = [
  { id: 'blue-cyan',      label: 'Ocean',    classes: 'from-blue-500 to-cyan-400' },
  { id: 'purple-pink',    label: 'Candy',    classes: 'from-purple-500 to-pink-500' },
  { id: 'green-emerald',  label: 'Forest',   classes: 'from-green-500 to-emerald-400' },
  { id: 'orange-red',     label: 'Sunset',   classes: 'from-orange-500 to-red-500' },
  { id: 'yellow-orange',  label: 'Mango',    classes: 'from-yellow-400 to-orange-400' },
  { id: 'indigo-purple',  label: 'Galaxy',   classes: 'from-indigo-600 to-purple-600' },
  { id: 'teal-blue',      label: 'Aqua',     classes: 'from-teal-400 to-blue-500' },
  { id: 'rose-pink',      label: 'Blossom',  classes: 'from-rose-400 to-pink-400' },
  { id: 'slate-gray',     label: 'Storm',    classes: 'from-slate-600 to-gray-700' },
  { id: 'amber-yellow',   label: 'Gold',     classes: 'from-amber-400 to-yellow-300' },
]