import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const state: { data: unknown; loading: boolean; error: string } = { data: null, loading: false, error: '' }

vi.mock('../src/lib/useArticleSearch', () => ({
  useArticleSearch: () => state,
}))

import SearchPage from '../src/pages/SearchPage'

const pttData = {
  query: '台積電', bounded: true, source: 'ptt', partial: false,
  fetchedAt: '2026-09-27T04:00:00.000Z', staleAt: '2026-09-27T05:00:00.000Z',
  boards: [{ board: 'Stock', status: 'ptt', articleCount: 1 }],
  articles: [{ id: 'M.1790123403.A.A5D', board: 'Stock', title: '台積電最新消息', author: 'alice', authorIp: 'PTT', postedAt: '2026-09-27T03:00:00.000Z', content: '', tags: ['新聞'], pushes: 20, boos: 0, arrows: 0, isHot: false, isPin: false, pushedToward: 'positive', source: 'ptt', snippet: '台積電最新消息', matchFields: ['title'] }],
}

afterEach(() => {
  state.data = null
  state.loading = false
  state.error = ''
})

describe('SearchPage', () => {
  it('shows bounded PTT results with board-aware article links', () => {
    state.data = pttData
    render(<MemoryRouter initialEntries={['/search?q=台積電']}><SearchPage /></MemoryRouter>)
    expect(screen.getByTestId('search-source').textContent).toContain('來源：PTT')
    expect(screen.getByTestId('search-results')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '台積電最新消息' })).toHaveAttribute('href', '/article/M.1790123403.A.A5D?board=Stock')
  })

  it('labels mock fallback and partial results without hiding articles', () => {
    state.data = { ...pttData, source: 'mock', partial: true, boards: [{ board: 'Stock', status: 'mock', articleCount: 1 }], articles: [{ ...pttData.articles[0], id: 'Stock-1', source: 'mock' }] }
    render(<MemoryRouter initialEntries={['/search?q=台積電']}><SearchPage /></MemoryRouter>)
    expect(screen.getByTestId('search-source').textContent).toContain('示範快照')
    expect(screen.getByTestId('search-partial').textContent).toContain('部分看板失敗')
    expect(screen.getByTestId('search-source-mock-Stock-1')).toBeInTheDocument()
  })

  it('shows an explicit empty state for a query with no matches', () => {
    state.data = { ...pttData, articles: [] }
    render(<MemoryRouter initialEntries={['/search?q=不存在']}><SearchPage /></MemoryRouter>)
    expect(screen.getByTestId('search-no-results')).toBeInTheDocument()
    expect(screen.getByTestId('search-clear')).toBeInTheDocument()
  })
})
