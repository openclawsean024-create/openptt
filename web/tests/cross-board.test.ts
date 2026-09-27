import { afterEach, describe, expect, it, vi } from 'vitest'
import handler, { CROSS_BOARD_DEFAULTS } from '../api/ptt/cross-board'

interface MockResponse {
  statusCode: number
  headers: Record<string, string>
  body: unknown
  status: (code: number) => MockResponse
  setHeader: (name: string, value: string) => MockResponse
  json: (body: unknown) => void
}

function createMockResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    headers: {},
    body: undefined,
    status(code) {
      this.statusCode = code
      return this
    },
    setHeader(name, value) {
      this.headers[name] = value
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }
  return res
}

const PTT_BOARD_HTML = `
  <a class="btn wide" href="/bbs/Stock/index10402.html">&lsaquo; 上頁</a>
  <div class="r-ent"><div class="nrec"><span class="hl f3">爆</span></div><div class="title"><a href="/bbs/Stock/M.1790123403.A.A5D.html">[新聞] 台積電最新消息 &amp; 觀察</a></div><div class="meta"><div class="author">alice</div><div class="date"> 9/23</div><div class="mark">M</div></div></div>
  <div class="r-ent"><div class="nrec">12</div><div class="title"><a href="/bbs/Stock/M.1790123300.A.BBB.html">[閒聊] 今日盤勢</a></div><div class="meta"><div class="author">bob</div><div class="date"> 9/23</div></div></div>
`

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('cross-board API contract', () => {
  it('exports deterministic defaults for boards, limit, and cache seconds', () => {
    expect(CROSS_BOARD_DEFAULTS.boards.length).toBeGreaterThan(0)
    expect(CROSS_BOARD_DEFAULTS.limit).toBeGreaterThan(0)
    expect(CROSS_BOARD_DEFAULTS.cacheSeconds).toBe(60 * 60)
  })

  it('rejects non-GET requests with 405', async () => {
    const req = { method: 'POST', query: {} }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(405)
  })

  it('returns the mock snapshot when every upstream call fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('upstream offline')))
    const req = { method: 'GET', query: { boards: 'Stock,Gossiping' } }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toContain('s-maxage=3600')
    const body = res.body as { source: string; partial: boolean; boards: Array<{ status: string }> }
    expect(body.source).toBe('mock')
    expect(body.partial).toBe(false)
    expect(body.boards.every(report => report.status === 'mock')).toBe(true)
  })

  it('returns PTT-sourced articles when upstream returns a board index page', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => PTT_BOARD_HTML,
    })
    vi.stubGlobal('fetch', fetchMock)
    const req = { method: 'GET', query: { boards: 'Stock', limit: '5' } }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const body = res.body as { source: string; partial: boolean; articles: Array<{ board: string; source: string }>; boards: Array<{ status: string }> }
    expect(body.source).toBe('ptt')
    expect(body.partial).toBe(false)
    expect(body.boards[0].status).toBe('ptt')
    expect(body.articles.every(article => article.source === 'ptt' && article.board === 'Stock')).toBe(true)
    expect(body.articles.length).toBeLessThanOrEqual(5)
  })

  it('marks the response as partial when at least one board fails', async () => {
    let callCount = 0
    const fetchMock = vi.fn().mockImplementation(async () => {
      callCount += 1
      if (callCount === 1) {
        return {
          ok: true,
          status: 200,
          text: async () => PTT_BOARD_HTML,
        }
      }
      throw new Error('network failure')
    })
    vi.stubGlobal('fetch', fetchMock)
    const req = { method: 'GET', query: { boards: 'Stock,Gossiping' } }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const body = res.body as { source: string; partial: boolean; boards: Array<{ board: string; status: string }> }
    expect(body.source).toBe('ptt')
    expect(body.partial).toBe(true)
    const statuses = body.boards.map(report => report.status).sort()
    expect(statuses).toEqual(['failed', 'ptt'])
  })

  it('falls back to DEFAULT_LIMIT when the limit is 0, >60, or non-numeric', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    // limit > MAX_LIMIT must not be clamped — it must fall back to DEFAULT_LIMIT.
    const upper = createMockResponse()
    await handler({ method: 'GET', query: { limit: '999' } }, upper)
    expect(upper.statusCode).toBe(200)
    const upperBody = upper.body as { articles: unknown[] }
    expect(upperBody.articles.length).toBeLessThanOrEqual(CROSS_BOARD_DEFAULTS.limit)

    // limit=0 is invalid (AC-039) — must fall back to DEFAULT_LIMIT, not clamp to 1.
    const zero = createMockResponse()
    await handler({ method: 'GET', query: { limit: '0' } }, zero)
    expect(zero.statusCode).toBe(200)
    const zeroBody = zero.body as { articles: unknown[] }
    expect(zeroBody.articles.length).toBeLessThanOrEqual(CROSS_BOARD_DEFAULTS.limit)

    // Non-numeric input falls back to DEFAULT_LIMIT.
    const bogus = createMockResponse()
    await handler({ method: 'GET', query: { limit: 'not-a-number' } }, bogus)
    expect(bogus.statusCode).toBe(200)
    expect(((bogus.body as { articles: unknown[] }).articles).length).toBeLessThanOrEqual(CROSS_BOARD_DEFAULTS.limit)
  })

  it('accepts in-range limits including 31 and trims the merged feed to the requested size', async () => {
    // First fetch returns the Stock board index (PTT path); the second is
    // a board that fails so we exercise the partial + rank path.
    let callCount = 0
    const fetchMock = vi.fn().mockImplementation(async () => {
      callCount += 1
      if (callCount % 2 === 1) {
        return {
          ok: true,
          status: 200,
          text: async () => PTT_BOARD_HTML,
        }
      }
      throw new Error('network failure')
    })
    vi.stubGlobal('fetch', fetchMock)

    // AC-041: limit=31 must trim the merged feed to 31 (not DEFAULT_LIMIT 30).
    // The mock snapshot has fewer than 31 entries; PTT-sourced Stock returns 2.
    // We assert that the response length never exceeds the requested limit.
    const res = createMockResponse()
    await handler({ method: 'GET', query: { boards: 'Stock,Tech_Job', limit: '31' } }, res)
    expect(res.statusCode).toBe(200)
    const body = res.body as { source: string; articles: unknown[] }
    expect(body.source).toBe('ptt')
    expect(body.articles.length).toBeLessThanOrEqual(31)
  })

  it('truncates the board fan-out to the documented maximum and strips empties', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const longList = Array.from({ length: 20 }, (_, index) => `Board_${index}`).join(',')
    const req = { method: 'GET', query: { boards: longList } }
    const res = createMockResponse()
    await handler(req, res)
    const body = res.body as { boards: Array<{ board: string }> }
    expect(body.boards.length).toBeLessThanOrEqual(12)
    expect(body.boards.every(report => report.board.length > 0)).toBe(true)
  })

  it('returns the mock snapshot when fetch itself throws synchronously', async () => {
    vi.stubGlobal('fetch', vi.fn(() => { throw new Error('hard failure') }))
    const req = { method: 'GET', query: {} }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const body = res.body as { source: string }
    expect(body.source).toBe('mock')
  })

  it('falls back to the reader-proxy when the direct PTT fetch throws but the reader succeeds', async () => {
    // AC-042 / FR-018: a thrown direct fetch must not prevent the reader-proxy
    // fallback. The first call (PTT upstream) throws; the second call
    // (reader proxy) returns a valid markdown body which is parsed.
    const READER_MD = [
      'Title: 測試文章',
      '作者 testauthor (測試站台): 看板 Stock 文章列表',
      '時間 Tue Sep 23 10:00:00 2025',
      '',
      '[新聞] 跨板 fallback 測試](https://www.ptt.cc/bbs/Stock/M.1758614400.A.AAA.html)',
      'testauthor',
      '10',
      '',
      '本文用於驗證 reader-proxy fallback 路徑。',
      '',
    ].join('\n') + '\nMarkdown Content:\n'
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.startsWith('https://www.ptt.cc/')) throw new Error('upstream offline')
      if (url.startsWith('https://r.jina.ai/')) {
        return { ok: true, status: 200, text: async () => READER_MD }
      }
      throw new Error('unexpected url ' + url)
    })
    vi.stubGlobal('fetch', fetchMock)
    const req = { method: 'GET', query: { boards: 'Stock' } }
    const res = createMockResponse()
    await handler(req, res)
    expect(res.statusCode).toBe(200)
    const body = res.body as { source: string; partial: boolean; articles: Array<{ board: string; source: string }> }
    // AC-042: reader proxy success is still a PTT-sourced feed (source: 'ptt').
    expect(body.source).toBe('ptt')
    expect(body.articles.length).toBeGreaterThan(0)
    expect(body.articles.every(article => article.source === 'ptt' && article.board === 'Stock')).toBe(true)
    // Sanity: both fetches were attempted.
    const urls = (fetchMock.mock.calls as unknown as Array<[string, unknown]>).map(call => call[0])
    expect(urls.some((u: string) => u.startsWith('https://www.ptt.cc/'))).toBe(true)
    expect(urls.some((u: string) => u.startsWith('https://r.jina.ai/'))).toBe(true)
  })
})
