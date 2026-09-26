import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'
import { addFavorite, _readFavorites } from '../src/lib/favorites'
import { _readQueue } from '../src/lib/queue'
import { _readSubscriptions } from '../src/lib/subscriptions'
import { BOARDS, searchBoards, getArticles } from '../src/data/boards'

function renderAt(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>)
}

beforeEach(() => {
  localStorage.clear()
})

describe('P0 Sprint 1 E2E', () => {
  it('看板列表頁顯示所有 33+ 個看板(包含 Ptt 熱門)', () => {
    renderAt('/boards')
    const list = screen.getByTestId('boards-list')
    expect(within(list).getByText('Stock')).toBeInTheDocument()
    expect(within(list).getByText('Gossiping')).toBeInTheDocument()
    expect(within(list).getByText('Tech_Job')).toBeInTheDocument()
    expect(within(list).getByText('NBA')).toBeInTheDocument()
    expect(within(list).getByText('Baseball')).toBeInTheDocument()
  })

  it('看板頁可點進文章,看到推噓摘要', () => {
    renderAt('/board/Stock')
    const list = screen.getByTestId('article-list')
    const firstLink = within(list).getAllByRole('link')[0]
    fireEvent.click(firstLink)
    // Sprint 2 改成 push-summary 而非 heading
    expect(screen.getByTestId('push-summary')).toBeInTheDocument()
  })

  it('加最愛後,localStorage 持久化', () => {
    addFavorite({ type: 'board', id: 'Stock', label: 'Stock' })
    expect(_readFavorites()).toHaveLength(1)
    expect(_readFavorites()[0].id).toBe('Stock')
  })

  it('切深色模式後 localStorage 寫入', () => {
    renderAt('/')
    const toggle = screen.getByTestId('theme-toggle')
    fireEvent.click(toggle)
    fireEvent.click(toggle)
    expect(localStorage.getItem('openptt:theme')).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
  })

  it('最愛頁移除後 localStorage 同步', () => {
    addFavorite({ type: 'board', id: 'NBA', label: 'NBA' })
    addFavorite({ type: 'article', id: 'Stock-1', label: 'Mock article' })
    expect(_readFavorites()).toHaveLength(2)
    renderAt('/fav')
    const removeButtons = screen.getAllByTestId('fav-remove')
    expect(removeButtons).toHaveLength(2)
    fireEvent.click(removeButtons[0])
    expect(_readFavorites()).toHaveLength(1)
  })

  it('首頁 Dashboard 顯示繼續閱讀空狀態與熱門文章', () => {
    renderAt('/')
    expect(screen.getByTestId('dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('recent-empty')).toBeInTheDocument()
    expect(screen.getByTestId('dashboard-hot-articles')).toBeInTheDocument()
  })
})

describe('Sprint 2 - 真實 Ptt 看板清單', () => {
  it('看板數量 >= 30 個', () => {
    expect(BOARDS.length).toBeGreaterThanOrEqual(30)
  })

  it('看板搜尋過濾 (NBA 關鍵字)', () => {
    const results = searchBoards('NBA')
    expect(results.length).toBeGreaterThan(0)
    const allRelevant = results.every(b =>
      b.name.toLowerCase().includes('nba') ||
      b.category.toLowerCase().includes('nba') ||
      b.description.toLowerCase().includes('nba')
    )
    expect(allRelevant).toBe(true)
  })

  it('3 種排序 (time / hot / pin) 都運作', () => {
    const byTime = getArticles('Stock', 'time')
    const byHot = getArticles('Stock', 'hot')
    const byPin = getArticles('Stock', 'pin')
    expect(byTime.length).toBeGreaterThan(0)
    expect(byHot.length).toBeGreaterThan(0)
    expect(byPin.length).toBeGreaterThan(0)
  })

  it('看板搜尋無結果(找不到的字)回 0', () => {
    const results = searchBoards('xyznonexistent123')
    expect(results.length).toBe(0)
  })

  it('看板列表無結果顯示復原入口', () => {
    renderAt('/boards?search=xyznonexistent123')
    expect(screen.getByTestId('board-empty')).toBeInTheDocument()
    expect(screen.getByText('找不到相關看板')).toBeInTheDocument()
    fireEvent.click(screen.getByTestId('board-search-clear'))
    expect(screen.getByTestId('boards-list')).toBeInTheDocument()
  })

  it('看板分類 chip 可切換篩選狀態', () => {
    renderAt('/boards')
    const category = screen.getByRole('button', { name: /科技/ })
    expect(category).toHaveAttribute('aria-pressed', 'false')
    fireEvent.click(category)
    expect(category).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/所有看板\(/)).toBeInTheDocument()
  })

  it('看板搜尋 by 類別(科技)', () => {
    const results = searchBoards('科技')
    expect(results.length).toBeGreaterThan(0)
  })

  it('指定看板可建立關鍵字訂閱並顯示命中 badge', () => {
    renderAt('/board/Stock')
    fireEvent.click(screen.getByTestId('keyword-subscription-open'))
    fireEvent.change(screen.getByLabelText('輸入關鍵字'), { target: { value: '台積電' } })
    fireEvent.click(screen.getByRole('button', { name: '建立訂閱' }))
    expect(_readSubscriptions()).toHaveLength(1)
    expect(screen.getByText('命中：台積電')).toBeInTheDocument()
  })

  it('閱讀看板後會寫入最近瀏覽並在歷史頁顯示', () => {
    renderAt('/board/Stock')
    renderAt('/history')
    expect(screen.getAllByText('Stock').length).toBeGreaterThan(0)
    expect(screen.getByTestId('clear-history')).toBeInTheDocument()
  })

  it('對標功能地圖的即時熱門與延後入口都有正式 route', () => {
    renderAt('/live-hot')
    expect(screen.getByTestId('live-hot-list')).toBeInTheDocument()
    renderAt('/groups')
    expect(screen.getByTestId('feature-status')).toBeInTheDocument()
  })

  it('文章收藏與關於頁可直接進入', () => {
    renderAt('/article-favorites')
    expect(screen.getByTestId('article-favorites-empty')).toBeInTheDocument()
    renderAt('/about')
    expect(screen.getByText('關於 OpenPTT')).toBeInTheDocument()
  })

  it('文章不存在時提供回看板與看板列表', () => {
    renderAt('/article/not-found?board=Stock')
    const empty = screen.getByTestId('article-not-found')
    expect(within(empty).getByText('文章不存在')).toBeInTheDocument()
    expect(within(empty).getByRole('link', { name: '← 回看板' })).toHaveAttribute('href', '/board/Stock')
    expect(within(empty).getByRole('link', { name: '看板列表' })).toHaveAttribute('href', '/boards')
  })

  it('最愛頁可依類型篩選並復原移除項目', () => {
    addFavorite({ type: 'board', id: 'NBA', label: 'NBA' })
    addFavorite({ type: 'article', id: 'Stock-1', label: 'Mock article' })
    renderAt('/fav')

    fireEvent.click(screen.getByRole('tab', { name: '文章' }))
    const list = screen.getByTestId('favorites-list')
    expect(within(list).getByText('Mock article')).toBeInTheDocument()
    expect(within(list).queryByText('NBA')).not.toBeInTheDocument()

    fireEvent.click(within(list).getByTestId('fav-remove'))
    expect(screen.getByTestId('favorite-toast')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '復原' }))
    expect(_readFavorites()).toHaveLength(2)
  })

  it('首頁提供搜尋欄並支援 / 快捷鍵聚焦', () => {
    renderAt('/')
    const search = screen.getByTestId('dashboard-search')
    expect(search).toBeInTheDocument()
    fireEvent.keyDown(document.body, { key: '/' })
    expect(document.activeElement).toBe(search)
  })

  it('文章可加入閱讀佇列，並在佇列頁移除', () => {
    renderAt('/')
    fireEvent.click(screen.getAllByRole('button', { name: '加入閱讀佇列' })[0])
    expect(_readQueue()).toHaveLength(1)

    renderAt('/queue')
    expect(screen.getByTestId('queue-list')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /從佇列移除/ }))
    expect(screen.getByTestId('queue-empty')).toBeInTheDocument()
  })

  it('SettingsPage 資料與隱私 section 顯示收藏/訂閱/最近瀏覽數量並提供清除按鈕', () => {
    addFavorite({ type: 'board', id: 'Stock', label: 'Stock' })
    addFavorite({ type: 'article', id: 'Stock-1', label: 'Mock article' })
    renderAt('/settings')
    const section = screen.getByTestId('data-privacy')
    expect(section).toBeInTheDocument()
    expect(within(section).getByText(/目前 2 筆收藏/)).toBeInTheDocument()
    expect(within(section).getByText(/目前 0 筆訂閱/)).toBeInTheDocument()
    expect(within(section).getByText(/目前 0 筆最近閱讀紀錄/)).toBeInTheDocument()
  })

  it('清除本機收藏後 localStorage 與 UI 同步', () => {
    addFavorite({ type: 'board', id: 'Stock', label: 'Stock' })
    addFavorite({ type: 'article', id: 'NBA-1', label: 'NBA article' })
    expect(_readFavorites()).toHaveLength(2)
    window.confirm = vi.fn(() => true)
    renderAt('/settings')
    fireEvent.click(screen.getByTestId('privacy-clear-favorites'))
    expect(_readFavorites()).toHaveLength(0)
    expect(screen.getByTestId('privacy-feedback')).toHaveTextContent('已清除本機收藏')
    expect(screen.getByTestId('privacy-clear-favorites')).toBeDisabled()
  })

  it('重置主題後 localStorage 改為 system 並禁用按鈕', () => {
    localStorage.setItem('openptt:theme', 'dark')
    window.confirm = vi.fn(() => true)
    renderAt('/settings')
    const reset = screen.getByTestId('privacy-reset-theme')
    expect(reset).not.toBeDisabled()
    fireEvent.click(reset)
    expect(localStorage.getItem('openptt:theme')).toBe('system')
    expect(screen.getByTestId('privacy-reset-theme')).toBeDisabled()
    expect(screen.getByTestId('privacy-feedback')).toHaveTextContent('已重置主題')
  })
})
