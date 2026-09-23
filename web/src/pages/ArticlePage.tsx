import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { getArticle } from '../data/boards'
import { addFavorite, removeFavorite } from '../lib/favorites'
import { useFavorites } from '../lib/useFavorites'
import { recordRecent } from '../lib/recent'
import { useRemoteArticle } from '../lib/useRemoteArticle'

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>()
  const [searchParams] = useSearchParams()
  const board = searchParams.get('board') ?? ''

  const fallbackArticle = useMemo(() => {
    if (!articleId) return undefined
    if (board) return getArticle(board, articleId)
    for (const b of ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball']) {
      const a = getArticle(b, articleId)
      if (a) return a
    }
    return undefined
  }, [articleId, board])
  const remote = useRemoteArticle(board, articleId)
  const article = remote.article ?? fallbackArticle
  const favorites = useFavorites()

  useEffect(() => {
    if (article) recordRecent({ type: 'article', id: article.id, label: article.title, board: article.board })
  }, [article])

  if (!article && remote.loading) return <div className="py-12 text-center text-slate-500" data-testid="article-loading">正在載入 PTT 文章全文…</div>

  if (!article) return (
    <div className="py-12 text-center text-slate-500" data-testid="article-not-found">
      <p className="font-semibold">文章不存在</p>
      <p className="mt-2 text-sm">這篇文章可能已被移除，或 PTT 來源暫時無法取得。</p>
      <div className="mt-4 flex justify-center gap-3 text-sm">
        {board && <Link to={`/board/${board}`} className="rounded-lg border border-slate-300 px-3 py-2 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800">← 回看板</Link>}
        <Link to="/boards" className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white hover:bg-emerald-700">看板列表</Link>
      </div>
    </div>
  )

  const faved = favorites.some(item => item.type === 'article' && item.id === article.id)
  const toggleFav = () => {
    if (faved) removeFavorite('article', article.id)
    else addFavorite({ type: 'article', id: article.id, label: article.title })
  }

  return (
    <article>
      <Link to={`/board/${article.board}`} className="text-xs text-slate-500 hover:underline">← {article.board}</Link>
      <div className="mt-1 mb-3 flex flex-wrap gap-1">
        {article.isPin && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 rounded">📌置頂</span>}
        {article.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 rounded">{t}</span>)}
        {article.isHot && <span className="text-xs bg-red-100 text-red-700 px-2 rounded">🔥爆文</span>}
      </div>
      <h1 className="text-2xl font-bold mb-2">{article.title}</h1>
      <div className="text-xs text-slate-500 mb-2 flex items-center justify-between">
        <span>{article.author} @ {article.authorIp} · 發於 {new Date(article.postedAt).toLocaleString('zh-Hant')}</span>
        <button onClick={toggleFav} data-testid="fav-toggle-article" className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100 text-sm">
          {faved ? '★ 已收藏' : '☆ 加最愛'}
        </button>
      </div>

      {remote.error && <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200" role="status" data-testid="article-stale">PTT 全文同步暫時失敗，目前顯示可用資料。</div>}

      <div className="border border-slate-200 rounded p-3 mb-4 flex items-center gap-6 text-sm" data-testid="push-summary">
        <span className="text-orange-600">▲ {article.pushes} 推</span>
        <span className="text-red-600">▼ {article.boos} 噓</span>
        <span className="text-slate-400">→ {article.arrows}</span>
        {article.pushToBooRatio && article.pushToBooRatio < 99 && (
          <span className={`font-medium ${article.pushedToward === 'positive' ? 'text-orange-600' : article.pushedToward === 'negative' ? 'text-red-600' : 'text-slate-500'}`}>
            比 {article.pushToBooRatio}:1
          </span>
        )}
      </div>

      <div className="prose dark:prose-invert max-w-none mb-6" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }} />
    </article>
  )
}
