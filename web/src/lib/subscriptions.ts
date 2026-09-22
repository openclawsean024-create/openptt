import type { Article } from '../data/boards'

export interface KeywordSubscription {
  id: string
  board: string
  keyword: string
  enabled: boolean
  createdAt: number
}

const STORAGE_KEY = 'openptt:keyword-subscriptions'
const MAX_PER_BOARD = 10
const MAX_TOTAL = 30
type Listener = (items: KeywordSubscription[]) => void
const listeners = new Set<Listener>()

function read(): KeywordSubscription[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(items: KeywordSubscription[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Private browsing fallback: retain the current session in memory only.
  }
  const snapshot = items.slice()
  listeners.forEach(listener => listener(snapshot))
}

export function getSubscriptions(): KeywordSubscription[] {
  return read()
}

export function getBoardSubscriptions(board: string): KeywordSubscription[] {
  return read().filter(item => item.board === board)
}

export function normalizeKeyword(keyword: string): string {
  return keyword.trim().toLocaleLowerCase()
}

export function addSubscription(board: string, keyword: string): string | null {
  const clean = keyword.trim()
  const current = read()
  if (!clean) return '請輸入要追蹤的關鍵字。'
  if (current.some(item => item.board === board && normalizeKeyword(item.keyword) === normalizeKeyword(clean))) {
    return '這個看板已經有相同的關鍵字。'
  }
  if (getBoardSubscriptions(board).length >= MAX_PER_BOARD) {
    return '這個看板已達 10 筆訂閱上限。'
  }
  if (current.length >= MAX_TOTAL) {
    return '全站已達 30 筆訂閱上限，請先刪除不需要的項目。'
  }
  write([...current, { id: 'subscription-' + Date.now(), board, keyword: clean, enabled: true, createdAt: Date.now() }])
  return null
}

export function toggleSubscription(id: string) {
  write(read().map(item => item.id === id ? { ...item, enabled: !item.enabled } : item))
}

export function removeSubscription(id: string) {
  write(read().filter(item => item.id !== id))
}

export function clearAllSubscriptions() {
  write([])
}

export function keywordMatches(article: Article): KeywordSubscription[] {
  const haystack = (article.title + ' ' + article.content + ' ' + article.tags.join(' ')).toLocaleLowerCase()
  return read().filter(item => item.enabled && item.board === article.board && haystack.includes(normalizeKeyword(item.keyword)))
}

export function subscribeSubscriptions(listener: Listener) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

export const subscriptionLimits = { perBoard: MAX_PER_BOARD, total: MAX_TOTAL }

export function _readSubscriptions() {
  return read()
}
