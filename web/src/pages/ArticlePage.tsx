import { useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { getArticle } from '../data/boards'
import { addFavorite, removeFavorite, isFavorite } from '../lib/favorites'

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>()
  const [searchParams] = useSearchParams()
  const board = searchParams.get('board') ?? ''

  const article = useMemo(() => {
    if (!articleId) return undefined
    if (board) return getArticle(board, articleId)
    for (const b of ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball']) {
      const a = getArticle(b, articleId)
      if (a) return a
    }
    return undefined
  }, [articleId, board])

  if (!article) return <div className="text-center text-slate-500 py-12" data-testid="article-not-found">文章不存在</div>

  const faved = isFavorite('article', article.id)
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
