import type { Article } from '../../src/data/boards.js'
import { getArticles } from '../../src/data/boards.js'
import { fetchPttBoardFeed, PTT_FEED_TIMEOUTS } from '../lib/ptt.js'

interface VercelRequest {
  method?: string
  query: Record<string, string | string[] | undefined>
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => void
}

export interface SearchArticle extends Article {
  snippet: string
  matchFields: Array<'title' | 'content' | 'author' | 'tags'>
}

export interface SearchBoardReport {
  board: string
  status: 'ptt' | 'mock' | 'failed'
  articleCount: number
  fetchedAt?: string
}

export interface SearchFeed {
  query: string
  boards: SearchBoardReport[]
  articles: SearchArticle[]
  fetchedAt: string
  staleAt: string
  source: 'ptt' | 'mock'
  partial: boolean
  bounded: true
}

const DEFAULT_BOARDS = ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball', 'movie', 'Lifeismoney', 'HatePolitics']
const MAX_FANOUT = 12
const DEFAULT_LIMIT = 30
const MAX_LIMIT = 60
const MAX_QUERY_LENGTH = 80
const CACHE_SECONDS = 60 * 60

function first(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? ''
}

function parseBoards(value: string | string[] | undefined): string[] {
  const raw = first(value)
  if (!raw.trim()) return DEFAULT_BOARDS.slice()
  const boards = raw.split(',').map(item => item.trim()).filter(Boolean)
  return boards.length > 0 ? boards.slice(0, MAX_FANOUT) : DEFAULT_BOARDS.slice()
}

function parseLimit(value: string | string[] | undefined): number {
  const raw = first(value).trim()
  if (!/^\d+$/.test(raw)) return DEFAULT_LIMIT
  const parsed = Number(raw)
  return parsed >= 1 && parsed <= MAX_LIMIT ? parsed : DEFAULT_LIMIT
}

function normalize(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function score(article: Article, query: string): { points: number; fields: SearchArticle['matchFields'] } {
  const q = query.toLocaleLowerCase()
  const fields: SearchArticle['matchFields'] = []
  let points = 0
  if (article.title.toLocaleLowerCase().includes(q)) { fields.push('title'); points += 100 }
  if (article.content.toLocaleLowerCase().includes(q)) { fields.push('content'); points += 35 }
  if (article.author.toLocaleLowerCase().includes(q)) { fields.push('author'); points += 25 }
  if (article.tags.some(tag => tag.toLocaleLowerCase().includes(q))) { fields.push('tags'); points += 15 }
  return { points, fields }
}

function toSearchArticle(article: Article, query: string): SearchArticle | null {
  const match = score(article, query)
  if (match.fields.length === 0) return null
  const haystack = normalize(article.content || article.title)
  const index = haystack.toLocaleLowerCase().indexOf(query.toLocaleLowerCase())
  const start = index < 0 ? 0 : Math.max(0, index - 70)
  const snippet = haystack.slice(start, start + 180) || article.title
  return { ...article, snippet, matchFields: match.fields }
}

function rank(articles: SearchArticle[], query: string, limit: number): SearchArticle[] {
  const seen = new Set<string>()
  return articles
    .filter(article => {
      const key = `${article.board}:${article.id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => {
      const aScore = score(a, query).points
      const bScore = score(b, query).points
      if (bScore !== aScore) return bScore - aScore
      if (b.pushes !== a.pushes) return b.pushes - a.pushes
      return b.postedAt.localeCompare(a.postedAt)
    })
    .slice(0, limit)
}

function mockSearch(boards: string[], query: string, fetchedAt: string, limit: number): SearchFeed {
  const articles = rank(boards.flatMap(board => getArticles(board, 'hot').map(article => ({ ...article, source: 'mock' as const })))
    .map(article => toSearchArticle(article, query)).filter((article): article is SearchArticle => !!article), query, limit)
  return {
    query,
    boards: boards.map(board => ({ board, status: 'mock', articleCount: articles.filter(article => article.board === board).length })),
    articles,
    fetchedAt,
    staleAt: new Date(new Date(fetchedAt).getTime() + CACHE_SECONDS * 1000).toISOString(),
    source: 'mock',
    partial: false,
    bounded: true,
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method && request.method !== 'GET') return response.status(405).json({ error: 'method not allowed' })
  const query = normalize(first(request.query.q))
  if (!query) return response.status(400).json({ error: 'q is required' })
  if (query.length > MAX_QUERY_LENGTH) return response.status(400).json({ error: `q must be at most ${MAX_QUERY_LENGTH} characters` })

  const boards = parseBoards(request.query.boards)
  const limit = parseLimit(request.query.limit)
  const fetchedAt = new Date().toISOString()
  const signal = AbortSignal.timeout(PTT_FEED_TIMEOUTS.upstreamMs + PTT_FEED_TIMEOUTS.readerMs)
  const results = await Promise.all(boards.map(async board => {
    try {
      const feed = await fetchPttBoardFeed({ board, fetchedAt, signal })
      return { board, feed }
    } catch {
      return { board, feed: null }
    }
  }))

  const anyPtt = results.some(result => !!result.feed)
  if (!anyPtt) {
    return response.status(200)
      .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
      .setHeader('X-OpenPTT-Fetched-At', fetchedAt)
      .json(mockSearch(boards, query, fetchedAt, limit))
  }

  const articles = rank(results.flatMap(result => result.feed?.articles ?? [])
    .map(article => toSearchArticle(article, query)).filter((article): article is SearchArticle => !!article), query, limit)
  const reports = results.map(result => ({
    board: result.board,
    status: result.feed ? 'ptt' as const : 'failed' as const,
    articleCount: result.feed ? articles.filter(article => article.board === result.board).length : 0,
    fetchedAt: result.feed?.fetchedAt,
  }))
  const feed: SearchFeed = {
    query,
    boards: reports,
    articles,
    fetchedAt,
    staleAt: new Date(new Date(fetchedAt).getTime() + CACHE_SECONDS * 1000).toISOString(),
    source: 'ptt',
    partial: reports.some(report => report.status === 'failed'),
    bounded: true,
  }
  return response.status(200)
    .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
    .setHeader('X-OpenPTT-Fetched-At', fetchedAt)
    .json(feed)
}

export const SEARCH_DEFAULTS = { boards: DEFAULT_BOARDS, limit: DEFAULT_LIMIT, maxFanout: MAX_FANOUT, cacheSeconds: CACHE_SECONDS }
