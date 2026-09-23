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
    return <div className="py-12 text-center text-slate-500" data-testid="board-empty">看板不存在或尚無文章</div>
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
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2 text-xs text-slate-500"><Link to="/boards" className="hover:text-emerald-700 hover:underline">看板列表</Link><span>/</span><span>{boardName}</span></div>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><h1 className="text-3xl font-bold tracking-tight">{boardName}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{board.description} · {board.subscribers.toLocaleString()} 人收藏這個板</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setSubscriptionOpen(true)} className="rounded-lg border border-emerald-500 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950" data-testid="keyword-subscription-open">⌕ 關鍵字訂閱{boardSubs.length > 0 ? ' (' + boardSubs.length + ')' : ''}</button>
            <button onClick={toggleFav} data-testid="fav-toggle-board" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800">{faved ? '★ 已收藏' : '☆ 加最愛'}</button>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-4 dark:border-slate-700 sm:flex-row sm:items-center">
          <div>
            <strong>{fetchedAll.length} 篇文章</strong>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400" data-testid="feed-status">
              {isRemote ? <>來源：PTT · 更新於 {new Date(feed.data?.fetchedAt ?? '').toLocaleString('zh-Hant')} · 每小時重新整理</> : feed.loading ? '正在同步 PTT 文章…' : '示範資料 · PTT 暫時無法取得，資料可能過期'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1" role="group" aria-label="文章排序">
            {isRemote && <button onClick={() => feed.refresh()} className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" data-testid="feed-refresh">↻ 更新</button>}
            {[['time', '最新'], ['hot', '熱門'], ['pin', '板主推薦']].map(([value, label]) => <button key={value} onClick={() => { setSort(value as 'time' | 'hot' | 'pin'); setFallbackPage(1) }} aria-pressed={sort === value} className={sort === value ? 'rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}>{label}</button>)}
          </div>
        </div>
        {feed.error && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status" data-testid="feed-stale">PTT 暫時無法同步（{feed.error}），目前顯示可用資料。</div>}
        <ul className="divide-y divide-slate-200 dark:divide-slate-700" data-testid="article-list">
          {items.map(article => {
            const matches = keywordMatches(article)
            return <li key={article.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800" data-testid={'article-row-' + article.id}>
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap gap-1">
                    {article.isPin && <span className="rounded bg-yellow-100 px-1.5 text-xs text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">📌置頂</span>}
                    {article.tags.map(tag => <span key={tag} className="rounded bg-slate-100 px-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>)}
                    {article.isHot && <span className="rounded bg-red-100 px-1.5 text-xs text-red-700 dark:bg-red-950 dark:text-red-300">🔥爆</span>}
                    {matches.map(match => <span key={match.id} className="rounded-full bg-emerald-50 px-2 text-xs font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">命中：{match.keyword}</span>)}
                  </div>
                  <Link to={'/article/' + article.id + '?board=' + boardName} className="block font-semibold hover:text-emerald-700 hover:underline dark:hover:text-emerald-300">{article.title}</Link>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{article.author} · {article.authorIp} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</div>
                </div>
                <div className="shrink-0 text-right text-xs" data-testid={'push-info-' + article.id}><div className="text-orange-600">{article.pushes} 推</div><div className="text-red-600">{article.boos} 噓</div><div className="text-slate-400">{article.arrows} →</div></div>
              </div>
            </li>
          })}
        </ul>
      </section>

      {((isRemote && (feed.data?.olderPath || feed.data?.newerPath)) || (!isRemote && totalPages > 1)) && <div className="mt-4 flex justify-center gap-2 text-sm"><button disabled={isRemote ? !feed.data?.newerPath : fallbackPage === 1} onClick={moveNewer} className="rounded-lg border px-3 py-1.5 disabled:opacity-40 dark:border-slate-600">較新文章</button><span className="px-3 py-1.5">{isRemote ? 'PTT 分頁' : `${fallbackPage} / ${totalPages}`}</span><button disabled={isRemote ? !feed.data?.olderPath : fallbackPage === totalPages} onClick={moveOlder} className="rounded-lg border px-3 py-1.5 disabled:opacity-40 dark:border-slate-600">較舊文章</button></div>}

      {subscriptionOpen && <div className="fixed inset-0 z-30 flex items-end justify-center bg-slate-950/50 p-0 sm:items-center sm:p-5" role="presentation" onClick={() => setSubscriptionOpen(false)}>
        <div className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 sm:rounded-2xl" role="dialog" aria-modal="true" aria-labelledby="subscription-title" onClick={event => event.stopPropagation()}>
          <div className="mb-5 flex items-start justify-between gap-4"><div><h2 id="subscription-title" className="text-xl font-bold">訂閱 {boardName} 的關鍵字</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">只比對這個看板的標題、內文與標籤。</p></div><button onClick={() => setSubscriptionOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800" aria-label="關閉關鍵字訂閱">×</button></div>
          <form onSubmit={createSubscription} className="flex flex-col gap-2 sm:flex-row"><label htmlFor="keyword-input" className="sr-only">輸入關鍵字</label><input id="keyword-input" value={keyword} onChange={event => setKeyword(event.target.value)} placeholder="例如：投資、面試、湖人" maxLength={40} autoFocus className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-950" /><button className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800" type="submit">建立訂閱</button></form>
          <p className="mt-2 min-h-5 text-xs text-red-600" role="alert">{subscriptionError}</p>
          <p className="text-xs text-slate-400">{boardSubs.length} / 10 筆看板訂閱 · 全站上限 30 筆</p>
          <div className="mt-3 space-y-2">{boardSubs.length === 0 ? <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500 dark:bg-slate-800">還沒有追蹤字詞，先建立一筆吧。</p> : boardSubs.map(item => <div key={item.id} className={item.enabled ? 'flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800' : 'flex items-center gap-3 rounded-xl bg-slate-50 p-3 opacity-60 dark:bg-slate-800'}><span className="min-w-0 flex-1 truncate text-sm font-medium">{item.keyword}</span><button onClick={() => toggleSubscription(item.id)} aria-pressed={item.enabled} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">{item.enabled ? '啟用中' : '已停用'}</button><button onClick={() => removeSubscription(item.id)} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950">刪除</button></div>)}</div>
          <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">訂閱只保存在這個瀏覽器；目前只提供站內命中提示，不會送出 Web Push。</p>
        </div>
      </div>}
    </div>
  )
}
