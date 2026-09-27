import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const crossBoardState: {
  data: unknown
  loading: boolean
  error: string
} = {
  data: null,
  loading: false,
  error: '',
}

vi.mock('../src/lib/useCrossBoardFeed', () => ({
  useCrossBoardFeed: () => ({
    data: crossBoardState.data,
    loading: crossBoardState.loading,
    error: crossBoardState.error,
    refresh: vi.fn(),
  }),
}))

// Imports must come after vi.mock so the mock is in place.
import HotPage from '../src/pages/HotPage'
import LiveHotPage from '../src/pages/LiveHotPage'
import DashboardPage from '../src/pages/DashboardPage'

function renderAt(node: React.ReactNode, path: string) {
  return render(<MemoryRouter initialEntries={[path]}>{node}</MemoryRouter>)
}

afterEach(() => {
  crossBoardState.data = null
  crossBoardState.loading = false
  crossBoardState.error = ''
})

beforeEach(() => {
  localStorage.clear()
})

const pttFeed = {
  fetchedAt: '2026-09-27T04:00:00.000Z',
  staleAt: '2026-09-27T05:00:00.000Z',
  source: 'ptt',
  partial: false,
  boards: [
    { board: 'Stock', status: 'ptt', articleCount: 2, fetchedAt: '2026-09-27T04:00:00.000Z' },
    { board: 'NBA', status: 'ptt', articleCount: 1, fetchedAt: '2026-09-27T04:00:00.000Z' },
  ],
  articles: [
    { id: 'M.1790123403.A.A5D', board: 'Stock', title: '台積電法說會後法人目標價上修到 1500', author: 'abcStock', authorIp: 'PTT', postedAt: '2026-09-27T03:30:00.000Z', content: '', tags: ['討論'], pushes: 124, boos: 0, arrows: 0, isHot: true, isPin: true, pushToBooRatio: 124, pushedToward: 'positive', source: 'ptt', sourceUrl: 'https://www.ptt.cc/bbs/Stock/M.1790123403.A.A5D.html', fetchedAt: '2026-09-27T04:00:00.000Z' },
    { id: 'M.1790123300.A.BBB', board: 'Stock', title: '[閒聊] 今日盤勢', author: 'bob', authorIp: 'PTT', postedAt: '2026-09-27T03:00:00.000Z', content: '', tags: ['閒聊'], pushes: 12, boos: 0, arrows: 0, isHot: false, isPin: false, pushToBooRatio: 12, pushedToward: 'positive', source: 'ptt', sourceUrl: 'https://www.ptt.cc/bbs/Stock/M.1790123300.A.BBB.html', fetchedAt: '2026-09-27T04:00:00.000Z' },
    { id: 'NBA-1', board: 'NBA', title: 'Curry 傷後歸隊', author: 'dunk', authorIp: 'PTT', postedAt: '2026-09-27T02:00:00.000Z', content: '', tags: ['討論'], pushes: 80, boos: 0, arrows: 0, isHot: false, isPin: false, pushToBooRatio: 80, pushedToward: 'positive', source: 'ptt', sourceUrl: 'https://www.ptt.cc/bbs/NBA/NBA-1.html', fetchedAt: '2026-09-27T04:00:00.000Z' },
  ],
}

const partialFeed = {
  ...pttFeed,
  partial: true,
  boards: [
    { board: 'Stock', status: 'ptt', articleCount: 1, fetchedAt: '2026-09-27T04:00:00.000Z' },
    { board: 'Gossiping', status: 'failed', articleCount: 0 },
  ],
}

const mockFeed = {
  fetchedAt: '2026-09-27T04:00:00.000Z',
  staleAt: '2026-09-27T05:00:00.000Z',
  source: 'mock',
  partial: false,
  boards: [
    { board: 'Stock', status: 'mock', articleCount: 2 },
  ],
  articles: [
    { id: 'Stock-1', board: 'Stock', title: '台股示範', author: 'mock', authorIp: '示範', postedAt: '2026-09-27T03:00:00.000Z', content: '', tags: [], pushes: 10, boos: 0, arrows: 0, isHot: false, isPin: false, pushToBooRatio: 10, pushedToward: 'positive', source: 'mock', sourceUrl: undefined, fetchedAt: '2026-09-27T04:00:00.000Z' },
  ],
}

describe('HotPage cross-board source states', () => {
  it('shows the PTT source label and article links when remote data is available', () => {
    crossBoardState.data = pttFeed
    renderAt(<HotPage />, '/hot')
    expect(screen.getByTestId('hot-list').querySelectorAll('a')).toHaveLength(3)
    const meta = screen.getByTestId('hot-source-meta')
    expect(meta.textContent).toContain('來源：PTT')
    expect(meta.textContent).toContain('跨 2 板')
    const firstLink = screen.getByTestId('hot-list').querySelector('a') as HTMLAnchorElement
    expect(firstLink.getAttribute('href')).toBe('/article/M.1790123403.A.A5D?board=Stock')
  })

  it('surfaces the fallback copy when the feed is sourced from the mock snapshot', () => {
    crossBoardState.data = mockFeed
    renderAt(<HotPage />, '/hot')
    expect(screen.getByTestId('hot-source-meta').textContent).toContain('示範快照')
  })

  it('flags partial failure without hiding the existing list', () => {
    crossBoardState.data = partialFeed
    renderAt(<HotPage />, '/hot')
    expect(screen.getByTestId('hot-source-meta').textContent).toContain('部分看板失敗')
  })

  it('renders the stale banner when the hook surfaces a network error', () => {
    crossBoardState.error = '網路連線失敗'
    renderAt(<HotPage />, '/hot')
    const banner = screen.getByTestId('hot-stale-banner')
    expect(banner.textContent).toContain('示範快照')
  })

  it('renders the demo badge for API-provided mock articles and never relabels local fallback data as PTT', () => {
    // AC-040: when the API returns mock articles, the page must keep them
    // visible with an explicit 示範 badge instead of swapping in local
    // fallback data labeled as live.
    crossBoardState.data = mockFeed
    renderAt(<HotPage />, '/hot')
    const meta = screen.getByTestId('hot-source-meta')
    expect(meta.textContent).toContain('示範快照')
    const mockBadge = screen.getByTestId('hot-source-mock-Stock-1')
    expect(mockBadge.textContent).toContain('示範')
  })
})

describe('LiveHotPage cross-board source states', () => {
  it('renders PTT source label and removes the mock badge from real articles', () => {
    crossBoardState.data = pttFeed
    renderAt(<LiveHotPage />, '/live-hot')
    expect(screen.getByTestId('live-hot-updated').textContent).toContain('來源 PTT')
    const link = screen.getByTestId('live-hot-list').querySelector('a') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/article/M.1790123403.A.A5D?board=Stock')
    expect(within(link.parentElement as HTMLElement).getByTestId('live-hot-source-M.1790123403.A.A5D').textContent).toBe('即時')
  })

  it('falls back to the demo snapshot copy when source is mock', () => {
    crossBoardState.data = mockFeed
    renderAt(<LiveHotPage />, '/live-hot')
    expect(screen.getByTestId('live-hot-updated').textContent).toContain('示範快照')
  })

  it('flags partial failure in the live updated banner', () => {
    crossBoardState.data = partialFeed
    renderAt(<LiveHotPage />, '/live-hot')
    expect(screen.getByTestId('live-hot-updated').textContent).toContain('部分看板失敗')
  })

  it('renders the demo badge for API-provided mock articles on the live surface', () => {
    // AC-040: API-provided mock articles must keep the 示範 badge; the
    // page must never silently relabel local fallback data as 即時.
    crossBoardState.data = mockFeed
    renderAt(<LiveHotPage />, '/live-hot')
    const badge = screen.getByTestId('live-hot-source-Stock-1')
    expect(badge.textContent).toBe('示範')
  })
})

describe('DashboardPage cross-board integration', () => {
  it('renders the PTT source copy and editor note when remote data is available', () => {
    crossBoardState.data = pttFeed
    renderAt(<DashboardPage />, '/')
    expect(screen.getByTestId('dashboard-cross-source').textContent).toContain('來源：PTT')
    const meta = screen.getByTestId('dashboard-feed-meta')
    expect(meta.textContent).toContain('來源 PTT')
    const sourceNote = screen.getByTestId('dashboard-source-note')
    expect(sourceNote.textContent).toContain('跨板聚合每小時更新')
  })

  it('renders the mock fallback copy when the feed is mock-sourced', () => {
    crossBoardState.data = mockFeed
    renderAt(<DashboardPage />, '/')
    expect(screen.getByTestId('dashboard-cross-source').textContent).toContain('示範快照')
    const sourceNote = screen.getByTestId('dashboard-source-note')
    expect(sourceNote.textContent).toContain('PTT 來源暫時無法取得')
  })

  it('surfaces the stale banner when the hook surfaces a network error', () => {
    crossBoardState.error = 'offline'
    renderAt(<DashboardPage />, '/')
    const banner = screen.getByTestId('dashboard-cross-stale')
    expect(banner.textContent).toContain('目前顯示可用資料')
  })
})
