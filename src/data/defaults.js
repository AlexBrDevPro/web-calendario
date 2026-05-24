// Categorías por defecto. El usuario puede crear/editar/eliminar.
// Cada color es una pareja: base (chip/fondo claro) + dark (texto/borde fuerte).
export const DEFAULT_CATEGORIES = [
  { id: 'cat-citas',      name: 'Citas',           icon: '📅', color: '#6366f1' }, // indigo
  { id: 'cat-cumples',    name: 'Cumpleaños',      icon: '🎂', color: '#ec4899' }, // pink
  { id: 'cat-trabajo',    name: 'Trabajo',         icon: '💼', color: '#0ea5e9' }, // sky
  { id: 'cat-hogar',      name: 'Tareas del hogar',icon: '🏠', color: '#14b8a6' }, // teal
  { id: 'cat-compras',    name: 'Compras',         icon: '🛒', color: '#f59e0b' }, // amber
  { id: 'cat-comidas',    name: 'Comidas',         icon: '🍽️', color: '#ef4444' }, // red
  { id: 'cat-salud',      name: 'Salud',           icon: '💊', color: '#22c55e' }, // green
  { id: 'cat-viajes',     name: 'Viajes / Ocio',   icon: '✈️', color: '#a855f7' }, // purple
]

// Paleta de colores recomendados al crear nuevas categorías
export const COLOR_PALETTE = [
  '#6366f1', '#ec4899', '#0ea5e9', '#14b8a6',
  '#f59e0b', '#ef4444', '#22c55e', '#a855f7',
  '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981',
  '#eab308', '#f97316', '#3b82f6', '#64748b',
]

// Iconos sugeridos
export const ICON_SUGGESTIONS = [
  '📅','🎂','💼','🏠','🛒','🍽️','💊','✈️',
  '🏋️','🎉','📚','🎬','⚽','🎵','💡','📝',
  '❤️','🐶','🌱','☕','🍷','🎨','🚗','🧹',
]
