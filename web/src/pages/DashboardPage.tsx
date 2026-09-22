import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BOARDS, getArticles } from '../data/boards'
import { useRecent } from '../lib/useRecent'
import ThemeToggle from '../components/ThemeToggle'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)
  const recent = useRecent()
  const hotBoards = BOARDS.filter(board => board.isHot).slice(0, 4)
  const hotArticles = useMemo(() => {
    const sources = ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball']
    return sources.flatMap(board => getArticles(board, 'hot')).sort((a, b) => b.pushes - a.pushes).slice(0, 5)
  }, [])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.key === '/' && event.target instanceof HTMLElement && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleShortcut)
    return () => window.removeEventListener('keydown', handleShortcut)
  }, [])

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = query.trim()
    if (trimmed) navigate(`/boards?search=${encodeURIComponent(trimmed)}`)
    else navigate('/boards')
  }

  return (
    <div data-testid="dashboard">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">GOOD TO SEE YOU</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">今天想看哪個板？</h1>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-slate-500 dark:text-slate-400">把 PTT 的高密度資訊，整理成更容易閱讀的節奏。</p>
          <ThemeToggle testId="dashboard-theme-toggle" />
        </div>
        <form className="mt-5 flex max-w-2xl gap-2" onSubmit={submitSearch} role="search">
          <label className="sr-only" htmlFor="dashboard-search">搜尋看板或文章</label>
          <input
            ref={searchRef}
            id="dashboard-search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="搜尋看板或文章"
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none ring-emerald-500 focus:ring-2 dark:border-slate-700 dark:bg-slate-900"
            data-testid="dashboard-search"
          />
          <button type="submit" className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700">搜尋</button>
          <span className="hidden self-center text-xs text-slate-400 sm:inline">按 / 聚焦</span>
        </form>
      </div>

      <section className="mb-8" aria-labelledby="continue-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="continue-heading" className="text-lg font-semibold">繼續閱讀</h2>
          <Link to="/history" className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">閱讀歷史 →</Link>
        </div>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400" data-testid="recent-empty">
            <p>還沒有最近瀏覽。</p>
            <Link to="/boards" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline dark:text-emerald-300">從看板列表開始 →</Link>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {recent.slice(0, 4).map(item => (
              <Link
                key={item.type + item.id}
                to={item.type === 'board' ? '/board/' + item.id : '/article/' + item.id + '?board=' + (item.board ?? '')}
                className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"
              >
                <span className="text-xs text-slate-400">{item.type === 'board' ? '看板' : '文章'}</span>
                <strong className="mt-1 block truncate">{item.label}</strong>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{item.board ?? 'OpenPTT'} · 最近瀏覽</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="mb-8" aria-labelledby="hot-boards-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="hot-boards-heading" className="text-lg font-semibold">熱門看板</h2>
          <Link to="/boards" className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">查看全部 →</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {hotBoards.map(board => (
            <Link key={board.name} to={'/board/' + board.name} className="rounded-2xl border border-slate-200 bg-white p-4 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900">
              <div className="flex items-start justify-between gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{board.name.charAt(0)}</span>
                <span className="text-xs text-orange-600">🔥熱門</span>
              </div>
              <strong className="mt-3 block">{board.name}</strong>
              <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{board.description}</span>
              <span className="mt-3 block text-xs text-slate-400">{board.category} · {board.subscribers.toLocaleString()} 訂閱</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="hot-articles-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2 id="hot-articles-heading" className="text-lg font-semibold">熱門文章</h2>
          <Link to="/hot" className="text-sm text-emerald-700 hover:underline dark:text-emerald-300">更多文章 →</Link>
        </div>
        <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900" data-testid="dashboard-hot-articles">
          {hotArticles.map(article => (
            <Link key={article.id} to={'/article/' + article.id + '?board=' + article.board} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="mb-1 text-xs text-emerald-700 dark:text-emerald-300">{article.board} · {article.tags.join(' ') || '討論'}</div>
                  <strong className="block truncate">{article.title}</strong>
                  <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{article.author} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</span>
                </div>
                <span className="shrink-0 text-xs text-orange-600">{article.pushes} 推</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
