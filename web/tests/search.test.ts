import { afterEach, describe, expect, it, vi } from 'vitest'
import handler from '../api/ptt/search'

interface MockResponse {
  statusCode: number
  headers: Record<string, string>
  body: unknown
  status: (code: number) => MockResponse
  setHeader: (name: string, value: string) => MockResponse
  json: (body: unknown) => void
}

function response(): MockResponse {
  const result: MockResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) { this.statusCode = code; return this },
    setHeader(name, value) { this.headers[name] = value; return this },
    json(body) { this.body = body },
  }
  return result
}

const BOARD_HTML = '<div class="r-ent"><div class="nrec">20</div><div class="title"><a href="/bbs/Stock/M.1790123403.A.A5D.html">[新聞] 台積電最新消息</a></div><div class="author">alice</div><div class="date"> 9/27</div></div>'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('bounded article search API', () => {
  it('requires a query and rejects non-GET requests', async () => {
    const missing = response()
    await handler({ method: 'GET', query: {} }, missing)
    expect(missing.statusCode).toBe(400)
    const method = response()
    await handler({ method: 'POST', query: { q: '台積電' } }, method)
    expect(method.statusCode).toBe(405)
  })

  it('searches typed PTT index fields and returns transparent metadata', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => BOARD_HTML }))
    const result = response()
    await handler({ method: 'GET', query: { q: '台積電', boards: 'Stock', limit: '5' } }, result)
    expect(result.statusCode).toBe(200)
    expect(result.headers['Cache-Control']).toContain('s-maxage=3600')
    const body = result.body as { source: string; bounded: boolean; articles: Array<{ title: string; snippet: string; matchFields: string[] }>; boards: Array<{ status: string }> }
    expect(body.source).toBe('ptt')
    expect(body.bounded).toBe(true)
    expect(body.boards[0].status).toBe('ptt')
    expect(body.articles[0].title).toContain('台積電')
    expect(body.articles[0].snippet).toContain('台積電')
    expect(body.articles[0].matchFields).toContain('title')
  })

  it('uses a readable mock fallback when every board source fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const result = response()
    await handler({ method: 'GET', query: { q: '台積電', boards: 'Stock' } }, result)
    const body = result.body as { source: string; partial: boolean; articles: Array<{ source: string; board: string }> }
    expect(body.source).toBe('mock')
    expect(body.partial).toBe(false)
    expect(body.articles.some(article => article.source === 'mock' && article.board === 'Stock')).toBe(true)
  })

  it('marks partial upstream failure and keeps successful matches', async () => {
    let calls = 0
    vi.stubGlobal('fetch', vi.fn().mockImplementation(async () => {
      calls += 1
      if (calls === 1) return { ok: true, status: 200, text: async () => BOARD_HTML }
      throw new Error('offline')
    }))
    const result = response()
    await handler({ method: 'GET', query: { q: '台積電', boards: 'Stock,NBA' } }, result)
    const body = result.body as { source: string; partial: boolean; boards: Array<{ status: string }>; articles: unknown[] }
    expect(body.source).toBe('ptt')
    expect(body.partial).toBe(true)
    expect(body.boards.map(board => board.status).sort()).toEqual(['failed', 'ptt'])
    expect(body.articles.length).toBeGreaterThan(0)
  })
})
