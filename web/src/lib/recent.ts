export type RecentItemType = 'board' | 'article'

export interface RecentItem {
  type: RecentItemType
  id: string
  label: string
  board?: string
  visitedAt: number
}

const STORAGE_KEY = 'openptt:recent'
const MAX_ITEMS = 10
type Listener = (items: RecentItem[]) => void
const listeners = new Set<Listener>()

function read(): RecentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: RecentItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Private browsing fallback: retain the current session in memory only.
  }
  const snapshot = items.slice()
  listeners.forEach(listener => listener(snapshot))
}

export function getRecent(): RecentItem[] {
  return read().sort((a, b) => b.visitedAt - a.visitedAt)
}

export function recordRecent(item: Omit<RecentItem, 'visitedAt'>) {
  const next = read().filter(existing => !(existing.type === item.type && existing.id === item.id))
  next.unshift({ ...item, visitedAt: Date.now() })
  write(next.slice(0, MAX_ITEMS))
}

export function clearRecent() {
  write([])
}

export function subscribeRecent(listener: Listener) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export function _readRecent() {
  return read()
}
