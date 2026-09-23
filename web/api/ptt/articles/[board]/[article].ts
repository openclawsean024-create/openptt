import { parseArticleHtml, PTT_ORIGIN, validBoardName } from '../../../lib/ptt'

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
  const article = first(request.query.article) ?? ''
  if (!validBoardName(board) || !/^[A-Za-z0-9._-]{3,80}$/.test(article)) return response.status(400).json({ error: 'invalid article' })
  const fetchedAt = new Date().toISOString()
  try {
    const upstream = await fetch(`${PTT_ORIGIN}/bbs/${board}/${article}.html`, {
      headers: {
        'accept-language': 'zh-TW,zh;q=0.9,en;q=0.8',
        'user-agent': 'OpenPTT/0.1 (+https://openptt.vercel.app)',
      },
      signal: AbortSignal.timeout(10000),
    })
    const html = await upstream.text()
    if (!upstream.ok || !html.includes('id="main-content"')) return response.status(upstream.status || 404).json({ error: 'PTT article unavailable' })
    const result = parseArticleHtml(html, board, article, fetchedAt)
    return response
      .status(200)
      .setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=300')
      .setHeader('X-OpenPTT-Fetched-At', result.fetchedAt)
      .json(result)
  } catch (error) {
    return response.status(502).json({ error: 'PTT article fetch failed', detail: error instanceof Error ? error.message : 'unknown error' })
  }
}
