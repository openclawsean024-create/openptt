import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { BOARDS, getArticles } from '../data/boards'
import { addSubscription, getBoardSubscriptions, keywordMatches, removeSubscription, toggleSubscription } from '../lib/subscriptions'
import { useSubscriptions } from '../lib/useSubscriptions'
import { recordRecent } from '../lib/recent'
import { addFavorite, removeFavorite } from '../lib/favorites'
import { useFavorites } from '../lib/useFavorites'
import { useBoardFeed } from '../lib/useBoardFeed'

const PAGE_SIZE = 20

export default function BoardPage() {
  const { boardName } = useParams<{ boardName: string }>()
  const board = BOARDS.find(item => item.name === boardName)
  const [sort, setSort] = useState<'time' | 'hot' | 'pin'>('time')
  const [pagePath, setPagePath] = useState<string | null>(null)
  const [fallbackPage, setFallbackPage] = useState(1)
  const [subscriptionOpen, setSubscriptionOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [subscriptionError, setSubscriptionError] = useState('')
  useSubscriptions()
  const favorites = useFavorites()
  const feed = useBoardFeed(boardName, pagePath)
  const fallbackAll = useMemo(() => (boardName ? getArticles(boardName, sort) : []), [boardName, sort])
  const fetchedAll = useMemo(() => {
    const source = feed.data?.articles ?? fallbackAll
    if (sort === 'hot') return [...source].sort((a, b) => b.pushes - a.pushes)
    if (sort === 'pin') return [...source].sort((a, b) => Number(b.isPin) - Number(a.isPin))
    return [...source].sort((a, b) => b.postedAt.localeCompare(a.postedAt))
  }, [feed.data?.articles, fallbackAll, sort])
  const isRemote = feed.data?.source === 'ptt'
  const items = isRemote ? fetchedAll : fetchedAll.slice((fallbackPage - 1) * PAGE_SIZE, fallbackPage * PAGE_SIZE)
  const totalPages = Math.max(1, Math.ceil(fetchedAll.length / PAGE_SIZE))
  const boardSubs = boardName ? getBoardSubscriptions(boardName) : []
  const faved = !!boardName && favorites.some(item => item.type === 'board' && item.id === boardName)

  useEffect(() => {
    if (boardName && board) recordRecent({ type: 'board', id: boardName, label: boardName })
  }, [boardName, board])

  if (!boardName || !board || (!feed.loading && fetchedAll.length === 0)) {
    return (
      <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="board-empty">
        看板不存在或尚無文章
      </div>
    )
  }

  const toggleFav = () => {
    if (faved) removeFavorite('board', boardName)
    else addFavorite({ type: 'board', id: boardName, label: boardName })
  }

  const createSubscription = (event: React.FormEvent) => {
    event.preventDefault()
    const error = addSubscription(boardName, keyword)
    if (error) {
      setSubscriptionError(error)
      return
    }
    setKeyword('')
    setSubscriptionError('')
    setSubscriptionOpen(false)
  }

  const moveOlder = () => {
    if (isRemote && feed.data?.olderPath) setPagePath(feed.data.olderPath)
    else setFallbackPage(value => Math.min(totalPages, value + 1))
  }

  const moveNewer = () => {
    if (isRemote && feed.data?.newerPath) setPagePath(feed.data.newerPath)
    else setFallbackPage(value => Math.max(1, value - 1))
  }

  return (
    <div>
      <nav aria-label="麵包屑" className="mb-3 flex items-center gap-2 text-[11px] text-[var(--faint)]">
        <Link to="/boards" className="hover:text-[var(--brand)] hover:underline">看板列表</Link>
        <span aria-hidden="true">/</span>
        <span className="font-extrabold text-[var(--brand)]">{boardName}</span>
      </nav>

      <header className="border-b border-[var(--line)] pb-6">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Board reader</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-[var(--ink)]">
              {boardName}
            </h1>
            <p className="mt-1 text-[12px] text-[var(--muted)]">
              {board.description} · {board.subscribers.toLocaleString()} 人收藏這個板
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSubscriptionOpen(true)}
              className="inline-flex h-[38px] items-center rounded-md border border-[var(--brand)] bg-[var(--brand-soft)] px-3 text-[12px] font-extrabold text-[var(--brand)] hover:bg-[var(--surface-soft)]"
              data-testid="keyword-subscription-open"
            >
              ⌕ 關鍵字訂閱{boardSubs.length > 0 ? ` (${boardSubs.length})` : ''}
            </button>
            <button
              type="button"
              onClick={toggleFav}
              data-testid="fav-toggle-board"
              className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 text-[12px] font-bold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              {faved ? '★ 已收藏' : '☆ 加最愛'}
            </button>
          </div>
        </div>
      </header>

      <section className="mt-6 border-t-2 border-[var(--ink)]">
        <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] py-3 sm:flex-row sm:items-center">
          <div>
            <strong className="text-[var(--ink)]">{fetchedAll.length} 篇文章</strong>
            <div className="mt-1 font-mono text-[10px] text-[var(--muted)]" data-testid="feed-status">
              {isRemote
                ? <>來源：PTT · 更新於 {new Date(feed.data?.fetchedAt ?? '').toLocaleString('zh-Hant')} · 每小時重新整理</>
                : feed.loading
                  ? '正在同步 PTT 文章…'
                  : '示範資料 · PTT 暫時無法取得，資料可能過期'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="文章排序">
            {isRemote && (
              <button
                type="button"
                onClick={() => feed.refresh()}
                className="inline-flex h-[34px] items-center rounded-md px-3 text-[11px] font-extrabold text-[var(--faint)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]"
                data-testid="feed-refresh"
              >
                ↻ 更新
              </button>
            )}
            {([['time', '最新'], ['hot', '熱門'], ['pin', '板主推薦']] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => { setSort(value); setFallbackPage(1) }}
                aria-pressed={sort === value}
                className={[
                  'inline-flex h-[34px] items-center rounded-md px-3 text-[11px] font-extrabold transition',
                  sort === value
                    ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
                    : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        {feed.error && (
          <div className="border-b border-[var(--warning)] bg-[var(--warning-soft)] px-4 py-3 text-[12px] text-[var(--warning)]" role="status" data-testid="feed-stale">
            PTT 暫時無法同步（{feed.error}），目前顯示可用資料。
          </div>
        )}
        <ul data-testid="article-list">
          {items.map((article, index) => {
            const matches = keywordMatches(article)
            return (
              <li
                key={article.id}
                className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
                data-testid={'article-row-' + article.id}
              >
                <div className="font-mono text-[12px] text-[var(--faint)]">{String(index + 1).padStart(2, '0')}</div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
                    {article.isPin && (
                      <span className="inline-flex items-center rounded bg-[var(--warning-soft)] px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--warning)]">
                        📌置頂
                      </span>
                    )}
                    {article.tags.map(tag => (
                      <span key={tag} className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">{tag}</span>
                    ))}
                    {article.isHot && (
                      <span className="inline-flex items-center rounded bg-[var(--hot-soft)] px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--hot)]">
                        🔥爆
                      </span>
                    )}
                    {matches.map(match => (
                      <span key={match.id} className="inline-flex items-center rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-[10px] font-extrabold text-[var(--brand)]">
                        命中：{match.keyword}
                      </span>
                    ))}
                  </div>
                  <Link
                    to={'/article/' + article.id + '?board=' + boardName}
                    className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)] hover:text-[var(--brand)]"
                  >
                    {article.title}
                  </Link>
                  <div className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · {article.authorIp} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</div>
                </div>
                <div className="flex flex-col items-end gap-1 font-mono text-[11px] text-[var(--muted)] tnum" data-testid={'push-info-' + article.id}>
                  <span className="text-[var(--hot)]">推 {article.pushes}</span>
                  <span className="text-[var(--boo)]">噓 {article.boos}</span>
                  <span className="text-[var(--faint)]">↔ {article.arrows}</span>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      {((isRemote && (feed.data?.olderPath || feed.data?.newerPath)) || (!isRemote && totalPages > 1)) && (
        <div className="mt-4 flex justify-center gap-2 text-[12px]">
          <button
            type="button"
            disabled={isRemote ? !feed.data?.newerPath : fallbackPage === 1}
            onClick={moveNewer}
            className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            較新文章
          </button>
          <span className="px-3 py-1.5">{isRemote ? 'PTT 分頁' : `${fallbackPage} / ${totalPages}`}</span>
          <button
            type="button"
            disabled={isRemote ? !feed.data?.olderPath : fallbackPage === totalPages}
            onClick={moveOlder}
            className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 disabled:cursor-not-allowed disabled:opacity-40"
          >
            較舊文章
          </button>
        </div>
      )}

      {subscriptionOpen && (
        <div
          className="fixed inset-0 z-30 flex items-end justify-center bg-[rgba(14,18,28,0.42)] p-0 sm:items-center sm:p-5"
          role="presentation"
          onClick={() => setSubscriptionOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-t-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl sm:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="subscription-title"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 id="subscription-title" className="text-xl font-bold tracking-[-0.02em] text-[var(--ink)]">
                  訂閱 {boardName} 的關鍵字
                </h2>
                <p className="mt-1 text-[12px] text-[var(--muted)]">只比對這個看板的標題、內文與標籤。</p>
              </div>
              <button
                type="button"
                onClick={() => setSubscriptionOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md bg-[var(--surface-soft)] text-lg text-[var(--muted)]"
                aria-label="關閉關鍵字訂閱"
              >
                ×
              </button>
            </div>
            <form onSubmit={createSubscription} className="flex flex-col gap-2 sm:flex-row">
              <label htmlFor="keyword-input" className="sr-only">輸入關鍵字</label>
              <input
                id="keyword-input"
                value={keyword}
                onChange={event => setKeyword(event.target.value)}
                placeholder="例如：投資、面試、湖人"
                maxLength={40}
                autoFocus
                className="h-[42px] min-w-0 flex-1 rounded-md border border-[var(--control)] bg-[var(--surface)] px-3 text-sm"
              />
              <button
                type="submit"
                className="inline-flex h-[42px] items-center justify-center rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 text-[12px] font-extrabold text-white hover:bg-[var(--brand-deep)]"
              >
                建立訂閱
              </button>
            </form>
            <p className="mt-2 min-h-[20px] text-[11px] text-[var(--boo)]" role="alert">{subscriptionError}</p>
            <p className="text-[10px] text-[var(--faint)]">{boardSubs.length} / 10 筆看板訂閱 · 全站上限 30 筆</p>
            <div className="mt-3 space-y-2">
              {boardSubs.length === 0 ? (
                <p className="rounded-md bg-[var(--surface-soft)] p-4 text-center text-[12px] text-[var(--muted)]">還沒有追蹤字詞，先建立一筆吧。</p>
              ) : (
                boardSubs.map(item => (
                  <div
                    key={item.id}
                    className={[
                      'flex items-center gap-3 rounded-md border border-[var(--line)] px-3 py-2',
                      item.enabled ? 'bg-[var(--surface-soft)]' : 'bg-[var(--surface-soft)] opacity-60',
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{item.keyword}</span>
                    <button
                      type="button"
                      onClick={() => toggleSubscription(item.id)}
                      aria-pressed={item.enabled}
                      className="inline-flex h-[28px] items-center rounded-md border border-[var(--line)] px-2 text-[10px] font-bold text-[var(--muted)]"
                    >
                      {item.enabled ? '啟用中' : '已停用'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSubscription(item.id)}
                      className="inline-flex h-[28px] items-center rounded-md px-2 text-[10px] font-bold text-[var(--boo)] hover:bg-[var(--surface)]"
                    >
                      刪除
                    </button>
                  </div>
                ))
              )}
            </div>
            <p className="mt-5 border-t border-[var(--line)] pt-4 text-[10px] text-[var(--faint)]">
              訂閱只保存在這個瀏覽器；目前只提供站內命中提示，不會送出 Web Push。
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
