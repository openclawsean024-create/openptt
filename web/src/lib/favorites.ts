const STORAGE_KEY = 'openptt:favorites'

export interface FavoriteItem {
  type: 'board' | 'article'
  id: string
  label: string
  addedAt: number
}

function read(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return [] // private browsing fallback
  }
}

function write(items: FavoriteItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // private browsing fallback: in-memory only
  }
}

export function getFavorites(): FavoriteItem[] {
  return read()
}

export function addFavorite(item: Omit<FavoriteItem, 'addedAt'>) {
  const items = read()
  if (items.some((i) => i.type === item.type && i.id === item.id)) return
  items.push({ ...item, addedAt: Date.now() })
  write(items)
  emitFavorites()
}

export function removeFavorite(type: FavoriteItem['type'], id: string) {
  const items = read().filter((i) => !(i.type === type && i.id === id))
  write(items)
  emitFavorites()
}

export function isFavorite(type: FavoriteItem['type'], id: string): boolean {
  return read().some((i) => i.type === type && i.id === id)
}

export function reorderFavorites(fromIdx: number, toIdx: number) {
  const items = read()
  if (fromIdx < 0 || fromIdx >= items.length) return
  if (toIdx < 0 || toIdx >= items.length) return
  const [moved] = items.splice(fromIdx, 1)
  items.splice(toIdx, 0, moved)
  write(items)
  emitFavorites()
}

export function clearAllFavorites() {
  write([])
  emitFavorites()
}

// subscribe helper for components that want reactive updates
type Listener = (items: FavoriteItem[]) => void
const listeners = new Set<Listener>()

export function subscribeFavorites(listener: Listener) {
  // ensure we re-read storage on each emit (handles multi-tab + private browsing fallback)
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function emitFavorites() {
  const items = read()
  listeners.forEach((l) => l(items))
}

// export raw read for the hook
export { read as _readFavorites }
