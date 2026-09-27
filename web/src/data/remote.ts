import type { Article } from './boards'

export interface BoardFeedPage {
  board: string
  currentPath: string
  articles: Article[]
  olderPath: string | null
  newerPath: string | null
  fetchedAt: string
  staleAt: string
  source: 'ptt'
}

export interface RemoteArticleResult {
  article: Article
  fetchedAt: string
  staleAt: string
  source: 'ptt'
}

export interface CrossBoardArticle extends Article {
  board: string
}

export interface CrossBoardBoardReport {
  board: string
  status: 'ptt' | 'mock' | 'failed'
  articleCount: number
  fetchedAt?: string
}

export interface CrossBoardFeed {
  boards: CrossBoardBoardReport[]
  articles: CrossBoardArticle[]
  fetchedAt: string
  staleAt: string
  source: 'ptt' | 'mock'
  partial: boolean
}

async function getJson<T>(url: string, refresh = false): Promise<T> {
  const response = await fetch(url, refresh ? { cache: 'no-store' } : undefined)
  if (!response.ok) throw new Error(`資料來源回應 ${response.status}`)
  return response.json() as Promise<T>
}

export function fetchBoardPage(board: string, path?: string | null, refresh = false): Promise<BoardFeedPage> {
  const params = path ? `?path=${encodeURIComponent(path)}` : ''
  return getJson<BoardFeedPage>(`/api/ptt/boards/${encodeURIComponent(board)}${params}`, refresh)
}

export function fetchRemoteArticle(board: string, articleId: string, refresh = false): Promise<RemoteArticleResult> {
  return getJson<RemoteArticleResult>(`/api/ptt/articles/${encodeURIComponent(board)}/${encodeURIComponent(articleId)}`, refresh)
}

export interface FetchCrossBoardOptions {
  boards?: string[]
  limit?: number
  refresh?: boolean
}

export function fetchCrossBoardFeed(options: FetchCrossBoardOptions = {}): Promise<CrossBoardFeed> {
  const params = new URLSearchParams()
  if (options.boards && options.boards.length > 0) params.set('boards', options.boards.join(','))
  if (typeof options.limit === 'number') params.set('limit', String(options.limit))
  const query = params.toString()
  return getJson<CrossBoardFeed>(`/api/ptt/cross-board${query ? `?${query}` : ''}`, options.refresh)
}
