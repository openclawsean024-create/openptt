import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BOARDS, getArticles } from '../data/boards'
import { useRecent } from '../lib/useRecent'
import { useFavorites } from '../lib/useFavorites'
import { useQueue } from '../lib/useQueue'
import { enqueue, removeFromQueue } from '../lib/queue'
import { addFavorite, removeFavorite } from '../lib/favorites'

type SortKey = 'for-you' | 'latest' | 'hot'

function formatRelative(input: string | number) {
  const target = typeof input === 'number' ? input : new Date(input).getTime()
  if (!Number.isFinite(target)) return ''
  const diff = Date.now() - target
  if (diff < 60_000) return '剛剛'
  if (diff < 60 * 60_000) return `${Math.floor(diff / 60_000)} 分鐘前`
  if (diff < 24 * 60 * 60_000) return `${Math.floor(diff / (60 * 60_000))} 小時前`
  return new Date(target).toLocaleString('zh-Hant')
}

function FeedArticleRow({
  article,
  index,
  saved,
  queued,
  onToggleSave,
  onToggleQueue,
}: {
  article: ReturnType<typeof getArticles>[number]
  index: number
  saved: boolean
  queued: boolean
  onToggleSave: () => void
  onToggleQueue: () => void
}) {
  const to = `/article/${article.id}?board=${article.board}`
  return (
    <article
      className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
      data-testid={`feed-article-${article.id}`}
    >
      <div className="font-mono text-[12px] text-[var(--faint)]">{String(index + 1).padStart(2, '0')}</div>
      <div className="min-w-0">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
          <span className="font-extrabold text-[var(--brand)]">{article.board}</span>
          <span aria-hidden="true">·</span>
          <span>討論</span>
          <span aria-hidden="true">·</span>
          <span>{formatRelative(article.postedAt)}</span>
          {article.isHot && (
            <span className="ml-1 inline-flex items-center rounded bg-[var(--hot-soft)] px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--hot)]">
              熱
            </span>
          )}
        </div>
        <Link
          to={to}
          className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)] hover:text-[var(--brand)]"
        >
          {article.title}
        </Link>
        <p className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · 閱讀全文 →</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="font-mono text-[11px] whitespace-nowrap text-[var(--muted)] tnum">
          <span className="text-[var(--hot)]">推 {article.pushes}</span>
          <span className="mx-1 text-[var(--line)]">|</span>
          <span className="text-[var(--boo)]">噓 {article.boos}</span>
          <div className="mt-0.5 text-[var(--faint)]">↔ {article.arrows}</div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleSave}
            aria-pressed={saved}
            aria-label={saved ? '取消收藏' : '收藏文章'}
            className={[
              'inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-md border bg-[var(--surface)] px-2 text-[13px] transition',
              saved
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-[var(--line)] text-[var(--faint)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
            ].join(' ')}
            data-testid={`feed-save-${article.id}`}
          >
            {saved ? '★' : '☆'}
          </button>
          <button
            type="button"
            onClick={onToggleQueue}
            aria-pressed={queued}
            aria-label={queued ? '移出閱讀佇列' : '加入閱讀佇列'}
            className={[
              'inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-md border bg-[var(--surface)] px-2 text-[13px] transition',
              queued
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-[var(--line)] text-[var(--faint)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
            ].join(' ')}
            data-testid={`feed-queue-${article.id}`}
          >
            {queued ? '✓' : '+'}
          </button>
        </div>
      </div>
    </article>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [board, setBoard] = useState('全部看板')
  const [sort, setSort] = useState<SortKey>('for-you')
  const searchRef = useRef<HTMLInputElement>(null)
  const recent = useRecent()
  const favorites = useFavorites()
  const queue = useQueue()

  const topBoards = useMemo(() => BOARDS.slice().sort((a, b) => b.subscribers - a.subscribers).slice(0, 6), [])
  const featured = useMemo(() => {
    const sources = ['Tech_Job', 'Stock', 'Lifeismoney', 'NBA', 'Gossiping', 'Japan_Travel']
    const all = sources.flatMap(name => getArticles(name, 'hot'))
    return all.sort((a, b) => b.pushes - a.pushes)
  }, [])
  const featuredStory = featured[0]
  const movingItems = featured.slice(1, 4)

  const allArticles = useMemo(() => {
    const sources = ['Tech_Job', 'Stock', 'Lifeismoney', 'NBA', 'Gossiping', 'Baseball', 'movie', 'KoreaStar', 'TaichungBun', 'PC_Shopping']
    return sources.flatMap(name => getArticles(name, 'hot'))
  }, [])

  const visibleArticles = useMemo(() => {
    const q = query.trim().toLocaleLowerCase()
    return allArticles.filter(article => {
      const haystack = `${article.board} ${article.title} ${article.author}`.toLocaleLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      const matchesBoard = board === '全部看板' || article.board === board
      return matchesQuery && matchesBoard
    })
  }, [allArticles, board, query])

  const sortedArticles = useMemo(() => {
    if (sort === 'hot') return [...visibleArticles].sort((a, b) => b.pushes - a.pushes)
    if (sort === 'latest') return [...visibleArticles].sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    return visibleArticles
  }, [visibleArticles, sort])

  const queuedIds = useMemo(() => new Set(queue.map(item => item.id)), [queue])
  const savedIds = useMemo(() => new Set(favorites.filter(item => item.type === 'article').map(item => item.id)), [favorites])

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

  const toggleSaveArticle = (article: typeof allArticles[number]) => {
    if (savedIds.has(article.id)) {
      removeFavorite('article', article.id)
    } else {
      addFavorite({ type: 'article', id: article.id, label: article.title })
    }
  }

  const toggleQueueArticle = (article: typeof allArticles[number]) => {
    if (queuedIds.has(article.id)) {
      removeFromQueue(article.id)
    } else {
      enqueue({ id: article.id, board: article.board, title: article.title })
    }
  }

  const boardFilters = ['全部看板', ...topBoards.slice(0, 5).map(b => b.name)]

  return (
    <div data-testid="dashboard">
      <section className="grid grid-cols-1 items-end gap-7 border-b border-[var(--line)] pb-12 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="intro-copy">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">OpenPTT / Reading desk</p>
          <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
            The public conversation,<br />
            <span className="text-[var(--brand)]">at your pace.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
            保留 PTT 的文字密度、看板文化與多種觀點，讓搜尋、掃讀、深入閱讀與回訪，構成一條清楚的閱讀路徑。
          </p>
          <form
            className="mt-5 flex max-w-2xl flex-col gap-2 sm:flex-row"
            onSubmit={submitSearch}
            role="search"
          >
            <label htmlFor="dashboard-search" className="sr-only">搜尋看板、文章或作者</label>
            <div className="relative flex-1">
              <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--faint)]">⌕</span>
              <input
                ref={searchRef}
                id="dashboard-search"
                type="search"
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜尋看板、文章或作者"
                className="h-[42px] w-full rounded-md border border-[var(--control)] bg-[var(--surface)] pl-9 pr-12 text-sm text-[var(--ink)] placeholder:text-[var(--faint)]"
                data-testid="dashboard-search"
              />
              <kbd className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded border border-[var(--line)] bg-[var(--surface-soft)] px-1.5 text-[10px] text-[var(--faint)]">/</kbd>
            </div>
            <button
              type="submit"
              className="h-[42px] rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 text-[12px] font-extrabold text-white hover:bg-[var(--brand-deep)]"
            >
              搜尋
            </button>
          </form>
        </div>
        <aside className="border-l-[3px] border-[var(--brand)] bg-[var(--surface)] px-5 py-5">
          <strong className="mb-1 block text-[13px] text-[var(--ink)]">今日閱讀狀態</strong>
          <p className="text-[12px] leading-[1.65] text-[var(--muted)]">
            訪客閱讀模式 · 收藏 {favorites.length} 筆 · 佇列 {queue.length} 篇 · 全部偏好只儲存在這個瀏覽器。
          </p>
        </aside>
      </section>

      <section className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(270px,0.7fr)]">
        {featuredStory && (
          <article className="flex min-h-[328px] flex-col justify-between rounded-lg bg-[var(--ink)] p-7 text-white">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#aebaff]">Editor's pick / 示範選讀</p>
              <h2 className="mt-11 max-w-[630px] text-[clamp(27px,4vw,45px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-white">
                {featuredStory.title}
              </h2>
              <p className="mt-4 max-w-[580px] text-[13px] leading-[1.65] text-[#c8cedc]">
                {featuredStory.author} 帶你看 {featuredStory.board} 板的最新一輪討論。OpenPTT 的主流程是閱讀，推噓摘要只提供判斷線索，不會把你的互動操作混進來。
              </p>
            </div>
            <div className="mt-7 flex items-center justify-between gap-3 text-[11px] text-[#afb7c7]">
              <span>{featuredStory.board} · {featuredStory.author} · {formatRelative(featuredStory.postedAt)}</span>
              <Link
                to={`/article/${featuredStory.id}?board=${featuredStory.board}`}
                className="inline-flex h-10 items-center rounded-md border border-[#5c72e5] bg-[var(--brand)] px-4 text-[12px] font-extrabold text-white hover:bg-[#3759ec]"
              >
                開始閱讀 →
              </Link>
            </div>
          </article>
        )}
        <aside className="border-[var(--line)] pl-7 lg:border-l">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] tracking-[-0.02em] text-[var(--ink)]">What’s moving</h2>
            <span className="text-[10px] text-[var(--faint)]">依推數排序</span>
          </div>
          <div className="grid">
            {movingItems.map((article, index) => (
              <div key={article.id} className="grid grid-cols-[24px_minmax(0,1fr)] items-start gap-2 border-b border-[var(--line)] py-3 last:border-b-0">
                <span className="font-mono text-[12px] leading-[1.4] text-[var(--brand)]">0{index + 1}</span>
                <div>
                  <Link
                    to={`/article/${article.id}?board=${article.board}`}
                    className="block text-[13px] font-extrabold leading-[1.45] text-[var(--ink)] hover:text-[var(--brand)]"
                  >
                    {article.title}
                  </Link>
                  <div className="mt-1 text-[10px] text-[var(--faint)]">
                    {article.board} · 推 {article.pushes} · {formatRelative(article.postedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="mt-10 border-y border-[var(--line)]">
        <div className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1 max-w-[580px]">
            <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--faint)]">⌕</span>
            <input
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="搜尋看板、文章或作者"
              className="h-[42px] w-full rounded-md border border-[var(--control)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--faint)]"
              data-testid="feed-search"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={board}
              onChange={event => setBoard(event.target.value)}
              aria-label="依看板篩選"
              className="h-[38px] rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] font-bold text-[var(--muted)]"
              data-testid="feed-board-select"
            >
              {boardFilters.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
            {(query || board !== '全部看板') && (
              <button
                type="button"
                onClick={() => { setQuery(''); setBoard('全部看板') }}
                className="h-[38px] rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] font-bold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
                data-testid="feed-clear"
              >
                清除
              </button>
            )}
          </div>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-3">
          {boardFilters.map(name => (
            <button
              key={name}
              type="button"
              onClick={() => setBoard(name)}
              aria-pressed={board === name}
              className={[
                'flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition',
                board === name
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                  : 'border-[var(--line)] bg-transparent text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
              ].join(' ')}
              data-testid={`feed-filter-${name}`}
            >
              {name}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <h2 className="text-[22px] tracking-[-0.045em] text-[var(--ink)]">
                {query || board !== '全部看板' ? '搜尋結果' : 'Latest signals'}
              </h2>
              <p className="mt-1 text-[11px] text-[var(--muted)]">
                {sortedArticles.length} 篇示範文章 · 以閱讀訊號輔助判斷
              </p>
            </div>
            <div className="flex items-center gap-1" role="group" aria-label="文章排序">
              {[
                { value: 'for-you' as const, label: '為你整理' },
                { value: 'latest' as const, label: '最新' },
                { value: 'hot' as const, label: '最熱' },
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSort(option.value)}
                  aria-pressed={sort === option.value}
                  className={[
                    'rounded-md px-2 py-1.5 text-[11px] font-extrabold transition',
                    sort === option.value
                      ? 'text-[var(--brand)]'
                      : 'text-[var(--faint)] hover:text-[var(--ink)]',
                  ].join(' ')}
                  data-testid={`feed-sort-${option.value}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          {sortedArticles.length === 0 ? (
            <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]">
              <strong className="mb-1 block text-[var(--ink)]">沒有符合的文章</strong>
              <p>換一個關鍵字或清除目前的看板篩選。</p>
            </div>
          ) : (
            <div className="border-t-2 border-[var(--ink)]" data-testid="dashboard-hot-articles">
              {sortedArticles.map((article, index) => (
                <FeedArticleRow
                  key={article.id}
                  article={article}
                  index={index}
                  saved={savedIds.has(article.id)}
                  queued={queuedIds.has(article.id)}
                  onToggleSave={() => toggleSaveArticle(article)}
                  onToggleQueue={() => toggleQueueArticle(article)}
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="border-t-2 border-[var(--ink)] pt-5">
            <h2 className="mb-1 text-[15px] tracking-[-0.025em] text-[var(--ink)]">Your boards</h2>
            <p className="mb-4 text-[11px] text-[var(--muted)]">最近閱讀與固定追蹤的入口</p>
            <div>
              {topBoards.slice(0, 5).map(boardItem => (
                <div
                  key={boardItem.name}
                  className="flex min-h-[39px] items-center justify-between gap-2 border-b border-[var(--line)]"
                >
                  <Link
                    to={`/board/${boardItem.name}`}
                    className="text-[11px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)]"
                  >
                    {boardItem.name}
                  </Link>
                  <span className="font-mono text-[10px] text-[var(--faint)]">{boardItem.subscribers.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <Link
              to="/boards"
              className="mt-3 inline-block text-[10px] font-extrabold text-[var(--brand)] hover:underline"
            >
              探索全部看板 →
            </Link>
          </section>

          <section className="border-t border-[var(--line)] pt-5">
            <h2 className="mb-1 text-[15px] tracking-[-0.025em] text-[var(--ink)]">Reading queue</h2>
            <p className="mb-4 text-[11px] text-[var(--muted)]">先存下來，等有時間再讀</p>
            <div>
              {queue.length === 0 ? (
                <div className="py-4 text-center text-[11px] text-[var(--muted)]">佇列是空的</div>
              ) : (
                queue.slice(0, 3).map(item => (
                  <div key={item.id} className="flex min-h-[39px] items-center justify-between gap-2 border-b border-[var(--line)]">
                    <Link
                      to={`/article/${item.id}?board=${item.board}`}
                      className="text-[11px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)]"
                    >
                      {item.title}
                    </Link>
                    <span className="font-mono text-[10px] text-[var(--faint)]">{item.board}</span>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/queue"
              className="mt-3 inline-block text-[10px] font-extrabold text-[var(--brand)] hover:underline"
            >
              管理佇列 →
            </Link>
          </section>

          <section className="border-t border-[var(--line)] pt-5">
            <div className="border border-[var(--line)] bg-[var(--surface)] p-4">
              <div className="mb-1 flex items-center gap-1.5 text-[10px] font-extrabold text-[var(--warning)]">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                示範資料
              </div>
              <strong className="mb-1 block text-[11px] text-[var(--ink)]">來源邊界透明</strong>
              <p className="text-[10px] leading-[1.65] text-[var(--muted)]">
                固定快照，不把示範資料稱為即時。正式 adapter 會顯示來源與 stale 狀態，並保留可閱讀內容。
              </p>
            </div>
          </section>

          <section className="border-t border-[var(--line)] pt-5">
            <h2 className="mb-1 text-[15px] tracking-[-0.025em] text-[var(--ink)]">繼續閱讀</h2>
            <p className="mb-4 text-[11px] text-[var(--muted)]">最近 10 篇瀏覽過的看板與文章</p>
            {recent.length === 0 ? (
              <div className="rounded-md border border-dashed border-[var(--line)] p-4 text-[12px] text-[var(--muted)]" data-testid="recent-empty">
                還沒有最近瀏覽。
              </div>
            ) : (
              <ul className="space-y-2">
                {recent.slice(0, 4).map(item => (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      to={item.type === 'board' ? `/board/${item.id}` : `/article/${item.id}?board=${item.board ?? ''}`}
                      className="block border-b border-[var(--line)] py-2 text-[11px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)]"
                    >
                      <span className="block truncate">{item.label}</span>
                      <span className="mt-0.5 block text-[10px] text-[var(--faint)]">
                        {item.type === 'board' ? '看板' : '文章'} · {item.board ?? 'OpenPTT'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <Link
              to="/history"
              className="mt-3 inline-block text-[10px] font-extrabold text-[var(--brand)] hover:underline"
            >
              閱讀歷史 →
            </Link>
          </section>
        </aside>
      </section>
    </div>
  )
}
