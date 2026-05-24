// Los dos usuarios fijos del calendario.
// Cuando migremos a Firebase Auth, cada uno se mapeará a una cuenta de Google.
export const USERS = [
  { id: 'dalia', name: 'Dalia', initial: 'D', color: '#ec4899' }, // rosa
  { id: 'alex',  name: 'Alex',  initial: 'A', color: '#6366f1' }, // índigo
]

// Posibles "owners" de un evento:
//   'dalia'  → solo Dalia
//   'alex'   → solo Alex
//   'shared' → compartido (de los dos)
export const OWNER_OPTIONS = [
  { value: 'shared', label: 'Compartido', initial: 'D+A' },
  { value: 'dalia',  label: 'Dalia',      initial: 'D' },
  { value: 'alex',   label: 'Alex',       initial: 'A' },
]

export function ownerLabel(owner) {
  return OWNER_OPTIONS.find((o) => o.value === owner)?.label || 'Compartido'
}

// Devuelve los colores asociados al owner para los badges
export function ownerColors(owner) {
  if (owner === 'dalia') return [USERS[0].color]
  if (owner === 'alex')  return [USERS[1].color]
  return [USERS[0].color, USERS[1].color] // shared
}

// Filtra eventos por owner. filter: 'all' | 'dalia' | 'alex' | 'shared' | 'mine'
// 'mine' depende del currentUserId.
export function filterByOwner(events, filter, currentUserId) {
  if (!filter || filter === 'all') return events
  if (filter === 'mine') {
    return events.filter((e) => e.owner === currentUserId || e.owner === 'shared')
  }
  if (filter === 'shared') return events.filter((e) => e.owner === 'shared')
  return events.filter((e) => e.owner === filter)
}
