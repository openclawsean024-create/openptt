import type { Article } from '../../src/data/boards'
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

/**
 * Cross-board discovery — FR-018 / AC-038..AC-043.
 *
 * Fan-outs to a bounded set of representative boards, tolerates partial
 * failures, deduplicates articles, sorts by hot signal and respects the
 * one-hour CDN cache window. The HTTP contract is `source: 'ptt'` only
 * when at least one board returned real PTT data; `partial` is true when
 * some boards fell back to the existing per-board mock snapshot.
 */

const DEFAULT_BOARDS = ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball', 'movie', 'Lifeismoney', 'HatePolitics']
const DEFAULT_LIMIT = 30
const MAX_LIMIT = 60
const MAX_FANOUT = 12
const CACHE_SECONDS = 60 * 60

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

interface MockArticleSeed {
  board: string
  title: string
  author: string
  pushes: number
  isHot?: boolean
  isPin?: boolean
  tags?: string[]
}

const MOCK_SNAPSHOT: MockArticleSeed[] = [
  { board: 'Stock', title: '台積電法說會後法人目標價上修到 1500', author: 'abcStock', pushes: 124, isHot: true, tags: ['討論'] },
  { board: 'Stock', title: '0050 vs 0056 配息率實測', author: 'KID8', pushes: 88, tags: ['討論'] },
  { board: 'Gossiping', title: '[爆卦] 某科技公司大裁員 200 人受影響', author: 'newsman', pushes: 220, isHot: true, tags: ['爆卦'] },
  { board: 'Gossiping', title: '[新聞] 三星電子 Q3 財報超預期', author: 'newsman', pushes: 64, tags: ['新聞'] },
  { board: 'Tech_Job', title: 'Google L7 軟體工程師面試心得', author: 'engres', pushes: 96, tags: ['心得'] },
  { board: 'Tech_Job', title: '台積電 EE 部門面試經驗', author: 'jeffery', pushes: 72, tags: ['討論'] },
  { board: 'NBA', title: 'Curry 傷後歸隊勇士戰績能否回溫', author: 'dunk', pushes: 134, isHot: true, tags: ['討論'] },
  { board: 'NBA', title: '勇士隊交易傳聞 Kuminga 會被交易嗎', author: 'lebron23', pushes: 80, tags: ['爆卦'] },
  { board: 'Baseball', title: '大谷翔平 2026 年球季最終成績整理', author: 'coach', pushes: 142, isHot: true, tags: ['討論'] },
  { board: 'Baseball', title: 'MLB 道奇 vs 洋基世界大賽 G1 預測', author: 'tiger', pushes: 78, tags: ['預測'] },
  { board: 'movie', title: '[好雷] 鬼滅之刃無限城篇', author: 'cinephile', pushes: 64, tags: ['好雷'] },
  { board: 'Lifeismoney', title: '[情報] 全聯 PX Pay 滿 500 送 50', author: 'saver', pushes: 58, tags: ['情報'] },
  { board: 'Lifeismoney', title: 'Re: 信用卡推薦 2027 必辦卡', author: 'cardguru', pushes: 41, tags: ['Re:'] },
  { board: 'HatePolitics', title: '賴清德國慶演說全文', author: 'observer', pushes: 102, isHot: true, tags: ['討論'] },
  { board: 'HatePolitics', title: 'Re: 藍白合不合最新民調', author: 'observer', pushes: 47, tags: ['Re:'] },
]

/**
 * AC-039: illegal or out-of-range limit values must fall back to the
 * documented `DEFAULT_LIMIT`. Only the inclusive 1..MAX_LIMIT range is
 * accepted; anything else (including 0, >60, NaN, or non-numeric input)
 * returns the fallback unchanged instead of being clamped.
 */
function clampLimit(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === null || raw === '') return fallback
  if (!/^\d+$/.test(raw.trim())) return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return fallback
  if (parsed < 1 || parsed > MAX_LIMIT) return fallback
  return parsed
}

function parseBoards(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return DEFAULT_BOARDS.slice()
  const list = raw.split(',').map(item => item.trim()).filter(Boolean)
  if (list.length === 0) return DEFAULT_BOARDS.slice()
  return list.slice(0, MAX_FANOUT)
}

function mockArticlesFor(boards: string[], fetchedAt: string): CrossBoardArticle[] {
  const wanted = new Set(boards)
  return MOCK_SNAPSHOT.filter(seed => wanted.has(seed.board)).map((seed, index) => {
    const posted = new Date(Date.now() - index * 30 * 60 * 1000).toISOString()
    return {
      id: `${seed.board}-${index + 1}`,
      board: seed.board,
      title: seed.title,
      author: seed.author,
      authorIp: '示範',
      postedAt: posted,
      content: `<p>這是 ${seed.board} 板的示範快照內容，用於 PTT 不可用時保留可閱讀體驗。</p>`,
      tags: seed.tags ?? [],
      pushes: seed.pushes,
      boos: 0,
      arrows: 0,
      isHot: !!seed.isHot,
      isPin: !!seed.isPin,
      pushToBooRatio: seed.pushes,
      pushedToward: seed.pushes > 0 ? 'positive' : 'neutral',
      source: 'mock',
      sourceUrl: undefined,
      fetchedAt,
    }
  })
}

function dedupeArticles(articles: CrossBoardArticle[]): CrossBoardArticle[] {
  const seen = new Set<string>()
  const unique: CrossBoardArticle[] = []
  for (const article of articles) {
    const key = `${article.board}:${article.id}`
    if (seen.has(key)) continue
    seen.add(key)
    unique.push(article)
  }
  return unique
}

function rankArticles(articles: CrossBoardArticle[], limit: number): CrossBoardArticle[] {
  return [...articles]
    .sort((a, b) => {
      if (b.pushes !== a.pushes) return b.pushes - a.pushes
      return b.postedAt.localeCompare(a.postedAt)
    })
    .slice(0, limit)
}

function buildMockFeed(boards: string[], fetchedAt: string, limit: number): CrossBoardFeed {
  // AC-041: the mock snapshot is also ranked and trimmed to the requested
  // limit so the server is consistent between mock and PTT-sourced feeds.
  const articles = rankArticles(mockArticlesFor(boards, fetchedAt), limit)
  return {
    boards: boards.map(board => ({ board, status: 'mock', articleCount: articles.filter(a => a.board === board).length })),
    articles,
    fetchedAt,
    staleAt: new Date(new Date(fetchedAt).getTime() + CACHE_SECONDS * 1000).toISOString(),
    source: 'mock',
    partial: false,
  }
}

async function collectCrossBoard(boards: string[], fetchedAt: string, signal: AbortSignal, limit: number): Promise<{
  feed: CrossBoardFeed
  reports: CrossBoardBoardReport[]
}> {
  const results = await Promise.all(boards.map(async board => {
    try {
      const feed = await fetchPttBoardFeed({ board, fetchedAt, signal })
      if (!feed) return { board, status: 'failed' as const, feed: null }
      return { board, status: 'ptt' as const, feed }
    } catch {
      return { board, status: 'failed' as const, feed: null }
    }
  }))

  const reports: CrossBoardBoardReport[] = []
  const merged: CrossBoardArticle[] = []
  let anyPtt = false
  let anyFailed = false
  for (const result of results) {
    if (result.status === 'ptt' && result.feed) {
      anyPtt = true
      reports.push({ board: result.board, status: 'ptt', articleCount: result.feed.articles.length, fetchedAt: result.feed.fetchedAt })
      for (const article of result.feed.articles) {
        merged.push({ ...article, source: 'ptt' })
      }
    } else {
      anyFailed = true
      reports.push({ board: result.board, status: 'failed', articleCount: 0 })
    }
  }
  if (!anyPtt) {
    return { feed: buildMockFeed(boards, fetchedAt, limit), reports }
  }
  // AC-041: dedupe + rank against the full merged feed, then trim to the
  // requested limit (not the hardcoded DEFAULT_LIMIT) so the server honours
  // the caller-supplied page size when PTT data is present.
  const unique = dedupeArticles(merged)
  const ranked = rankArticles(unique, limit)
  const usedBoards = new Set(ranked.map(article => article.board))
  const finalReports = reports.map(report => ({
    ...report,
    articleCount: report.status === 'ptt' ? ranked.filter(a => a.board === report.board).length : 0,
    status: report.status === 'ptt' && !usedBoards.has(report.board) ? 'ptt' as const : report.status,
  }))
  return {
    feed: {
      boards: finalReports,
      articles: ranked,
      fetchedAt,
      staleAt: new Date(new Date(fetchedAt).getTime() + CACHE_SECONDS * 1000).toISOString(),
      source: 'ptt',
      partial: anyFailed,
    },
    reports: finalReports,
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method && request.method !== 'GET') return response.status(405).json({ error: 'method not allowed' })
  const boards = parseBoards(request.query.boards)
  const limit = clampLimit(request.query.limit, DEFAULT_LIMIT)
  const fetchedAt = new Date().toISOString()
  const signal = AbortSignal.timeout(PTT_FEED_TIMEOUTS.upstreamMs + PTT_FEED_TIMEOUTS.readerMs)
  try {
    const { feed } = await collectCrossBoard(boards, fetchedAt, signal, limit)
    return response
      .status(200)
      .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
      .setHeader('X-OpenPTT-Fetched-At', feed.fetchedAt)
      .json(feed)
  } catch (error) {
    return response
      .status(200)
      .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
      .setHeader('X-OpenPTT-Fetched-At', fetchedAt)
      .json(buildMockFeed(boards, fetchedAt, limit))
  }
}

export const CROSS_BOARD_DEFAULTS = {
  boards: DEFAULT_BOARDS,
  limit: DEFAULT_LIMIT,
  cacheSeconds: CACHE_SECONDS,
}
