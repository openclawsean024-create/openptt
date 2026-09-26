// Reading queue — localStorage adapter.
// Stores ordered article IDs the reader explicitly saved for later.
// Mirrors favorites.ts/recent.ts listener contract so consumers can
// subscribe without polling. This is a reading-side affordance only:
// it never talks to a server and never produces push notifications.
export interface QueueItem {
  id: string
  board: string
  title: string
  addedAt: number
}

const STORAGE_KEY = 'openptt:queue'
const MAX_ITEMS = 30
type Listener = (items: QueueItem[]) => void
const listeners = new Set<Listener>()

function read(): QueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: QueueItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // private browsing fallback: in-memory only
  }
  const snapshot = items.slice()
  listeners.forEach(listener => listener(snapshot))
}

export function getQueue(): QueueItem[] {
  return read()
}

export function isQueued(id: string): boolean {
  return read().some(item => item.id === id)
}

export function enqueue(item: Omit<QueueItem, 'addedAt'>) {
  const items = read()
  if (items.some(existing => existing.id === item.id)) return
  items.push({ ...item, addedAt: Date.now() })
  write(items.slice(-MAX_ITEMS))
}

export function removeFromQueue(id: string) {
  write(read().filter(item => item.id !== id))
}

export function clearQueue() {
  write([])
}

export function subscribeQueue(listener: Listener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function _readQueue() {
  return read()
}
