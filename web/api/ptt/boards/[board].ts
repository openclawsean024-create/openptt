import { fetchPttBoardFeed, latestBoardPath, PTT_FEED_TIMEOUTS, validBoardName, validBoardPath } from '../../lib/ptt.js'

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
  const fetchedAt = new Date().toISOString()
  const timeoutSignal = AbortSignal.timeout(PTT_FEED_TIMEOUTS.upstreamMs + PTT_FEED_TIMEOUTS.readerMs)
  const feed = await fetchPttBoardFeed({
    board,
    path: currentPath || latestBoardPath(board),
    fetchedAt,
    signal: timeoutSignal,
  })
  if (!feed) {
    return response.status(502).json({ error: 'PTT board unavailable' })
  }
  return response
    .status(200)
    .setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
    .setHeader('X-OpenPTT-Fetched-At', feed.fetchedAt)
    .json(feed)
}
