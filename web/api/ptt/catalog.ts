import { PTT_ORIGIN, PTT_READER_ORIGIN } from '../lib/ptt.js'

interface VercelRequest {
  method?: string
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => void
}

interface CatalogBoard {
  name: string
  category: string
  description: string
  subscribers: number
  isHot?: boolean
}

interface CatalogCache {
  expiresAt: number
  boards: CatalogBoard[]
  fetchedAt: string
}

const GROUPS: Array<[string, string]> = [
  ['2870', '校園'],
  ['3297', '校園'],
  ['3290', '校園'],
  ['899', '校園'],
  ['2141', '社團'],
  ['801', '影音娛樂'],
  ['802', '遊戲與數位'],
  ['1056', '動漫'],
  ['806', '生活娛樂'],
  ['3362', '學術與政治'],
  ['807', '運動'],
]

const MAX_DEPTH = 2
const MAX_CONCURRENCY = 24
const CACHE_SECONDS = 60 * 60
let cache: CatalogCache | null = null

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim()
}

function classIds(html: string): string[] {
  return Array.from(html.matchAll(/(?:href=["']\/cls\/|https?:\/\/www\.ptt\.cc\/cls\/)(\d+)/g), match => match[1])
}

function boardEntries(html: string): Array<{ name: string; description: string }> {
  const htmlEntries = Array.from(
    html.matchAll(/href=["']\/bbs\/([A-Za-z0-9_-]+)\/index\.html["'][^>]*>([\s\S]*?)<\/a>/g),
    match => {
      const name = match[1]
      const label = stripTags(match[2])
      const remainder = label.startsWith(name) ? label.slice(name.length).trim() : label
      const description = remainder
        .replace(/^\d+\s+/, '')
        .replace(/^\S+\s+/, '')
        .replace(/^◎\s*/, '')
        .trim() || 'PTT 看板'
      return { name, description }
    },
  )
  const markdownEntries = Array.from(
    html.matchAll(/\[([^\]]+)\]\(https?:\/\/www\.ptt\.cc\/bbs\/([A-Za-z0-9_-]+)\/index\.html\)/g),
    match => {
      const name = match[2]
      const label = stripTags(match[1])
      const remainder = label.startsWith(name) ? label.slice(name.length).trim() : label
      const description = remainder
        .replace(/^\d+\s+/, '')
        .replace(/^\S+\s+/, '')
        .replace(/^◎\s*/, '')
        .trim() || 'PTT 看板'
      return { name, description }
    },
  )
  return [...htmlEntries, ...markdownEntries]
}

async function fetchClassPage(id: string): Promise<string> {
  const headers = {
    'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
    'user-agent': 'OpenPTT/0.1 (+https://openptt.vercel.app)',
  }
  try {
    const upstream = await fetch(`${PTT_ORIGIN}/cls/${id}`, { headers, signal: AbortSignal.timeout(5000) })
    if (upstream.ok) return upstream.text()
  } catch {
    // Fall through to the reader proxy when PTT rejects a Vercel edge.
  }
  const reader = await fetch(`${PTT_READER_ORIGIN}/cls/${id}`, {
    headers: { accept: 'text/plain', 'user-agent': 'OpenPTT/0.1' },
    signal: AbortSignal.timeout(8000),
  })
  if (!reader.ok) throw new Error(`PTT catalog group ${id} unavailable`)
  return reader.text()
}

async function mapConcurrent<T, R>(values: T[], mapper: (value: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let cursor = 0
  async function worker() {
    while (cursor < values.length) {
      const index = cursor
      cursor += 1
      results[index] = await mapper(values[index])
    }
  }
  await Promise.all(Array.from({ length: Math.min(MAX_CONCURRENCY, values.length) }, () => worker()))
  return results
}

async function collectCatalog(): Promise<{ boards: CatalogBoard[]; fetchedAt: string }> {
  const seenClasses = new Set<string>()
  const boards = new Map<string, CatalogBoard>()
  let frontier = GROUPS.map(([id, category]) => ({ id, category, depth: 0 }))

  while (frontier.length > 0) {
    const current = frontier.filter(item => !seenClasses.has(item.id))
    current.forEach(item => seenClasses.add(item.id))
    if (current.length === 0) break

    const pages = await mapConcurrent(current, async item => {
      try {
        return { item, html: await fetchClassPage(item.id) }
      } catch {
        return { item, html: null }
      }
    })
    const next: Array<{ id: string; category: string; depth: number }> = []
    for (const { item, html } of pages) {
      if (!html) continue
      for (const entry of boardEntries(html)) {
        if (!boards.has(entry.name)) {
          boards.set(entry.name, {
            name: entry.name,
            category: item.category,
            description: entry.description,
            subscribers: 0,
          })
        }
      }
      if (item.depth < MAX_DEPTH) {
        for (const id of classIds(html)) next.push({ id, category: item.category, depth: item.depth + 1 })
      }
    }
    frontier = next
  }

  return {
    boards: Array.from(boards.values()).sort((a, b) => a.name.localeCompare(b.name)),
    fetchedAt: new Date().toISOString(),
  }
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method && request.method !== 'GET') return response.status(405).json({ error: 'method not allowed' })
  if (cache && cache.expiresAt > Date.now()) {
    return response
      .status(200)
      .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
      .json({ source: 'ptt', boards: cache.boards, fetchedAt: cache.fetchedAt })
  }

  try {
    const result = await collectCatalog()
    cache = { ...result, expiresAt: Date.now() + CACHE_SECONDS * 1000 }
    return response
      .status(200)
      .setHeader('Cache-Control', `public, s-maxage=${CACHE_SECONDS}, stale-while-revalidate=300`)
      .json({ source: 'ptt', ...result })
  } catch (error) {
    return response.status(502).json({
      error: 'PTT catalog fetch failed',
      detail: error instanceof Error ? error.message : 'unknown error',
    })
  }
}
