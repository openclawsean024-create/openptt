import { latestBoardPath, parseBoardHtml, PTT_ORIGIN, validBoardName, validBoardPath } from '../../lib/ptt.js'

interface VercelRequest {
  query: Record<string, string | string[] | undefined>
}

interface VercelResponse {
  status: (code: number) => VercelResponse
  setHeader: (name: string, value: string) => VercelResponse
  json: (body: unknown) => void
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const board = first(request.query.board) ?? ''
  if (!validBoardName(board)) return response.status(400).json({ error: 'invalid board' })
  const currentPath = validBoardPath(board, first(request.query.path))
  const url = `${PTT_ORIGIN}${currentPath || latestBoardPath(board)}`
  const fetchedAt = new Date().toISOString()
  try {
    const upstream = await fetch(url, {
      headers: {
        'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
        'user-agent': 'OpenPTT/0.1 (+https://openptt.vercel.app)',
      },
      signal: AbortSignal.timeout(10000),
    })
    const html = await upstream.text()
    if (!upstream.ok || html.includes('請先通過年齡驗證')) return response.status(upstream.status || 502).json({ error: 'PTT board unavailable' })
    const feed = parseBoardHtml(html, board, currentPath, fetchedAt)
    return response
      .status(200)
      .setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
      .setHeader('X-OpenPTT-Fetched-At', feed.fetchedAt)
      .json(feed)
  } catch (error) {
    return response.status(502).json({ error: 'PTT board fetch failed', detail: error instanceof Error ? error.message : 'unknown error' })
  }
}
