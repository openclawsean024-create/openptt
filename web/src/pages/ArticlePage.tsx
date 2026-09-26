import { useEffect, useMemo } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import DOMPurify from 'dompurify'
import { getArticle } from '../data/boards'
import { addFavorite, removeFavorite } from '../lib/favorites'
import { useFavorites } from '../lib/useFavorites'
import { recordRecent } from '../lib/recent'
import { useRemoteArticle } from '../lib/useRemoteArticle'
import { enqueue, removeFromQueue } from '../lib/queue'
import { useQueue } from '../lib/useQueue'

export default function ArticlePage() {
  const { articleId } = useParams<{ articleId: string }>()
  const [searchParams] = useSearchParams()
  const board = searchParams.get('board') ?? ''

  const fallbackArticle = useMemo(() => {
    if (!articleId) return undefined
    if (board) return getArticle(board, articleId)
    for (const candidate of ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball']) {
      const candidateArticle = getArticle(candidate, articleId)
      if (candidateArticle) return candidateArticle
    }
    return undefined
  }, [articleId, board])
  const remote = useRemoteArticle(board, articleId)
  const article = remote.article ?? fallbackArticle
  const favorites = useFavorites()
  const queue = useQueue()

  useEffect(() => {
    if (article) recordRecent({ type: 'article', id: article.id, label: article.title, board: article.board })
  }, [article])

  if (!article && remote.loading) {
    return (
      <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="article-loading">
        正在載入 PTT 文章全文…
      </div>
    )
  }

  if (!article) {
    return (
      <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="article-not-found">
        <p className="font-extrabold text-[var(--ink)]">文章不存在</p>
        <p className="mt-2 text-[12px]">這篇文章可能已被移除，或 PTT 來源暫時無法取得。</p>
        <div className="mt-4 flex justify-center gap-3 text-[12px]">
          {board && (
            <Link
              to={`/board/${board}`}
              className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 font-bold text-[var(--ink)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              ← 回看板
            </Link>
          )}
          <Link
            to="/boards"
            className="inline-flex h-[38px] items-center rounded-md border border-[var(--brand)] bg-[var(--brand)] px-3 font-extrabold text-white hover:bg-[var(--brand-deep)]"
          >
            看板列表
          </Link>
        </div>
      </div>
    )
  }

  const faved = favorites.some(item => item.type === 'article' && item.id === article.id)
  const queued = queue.some(item => item.id === article.id)
  const toggleFav = () => {
    if (faved) removeFavorite('article', article.id)
    else addFavorite({ type: 'article', id: article.id, label: article.title })
  }
  const toggleQueue = () => {
    if (queued) removeFromQueue(article.id)
    else enqueue({ id: article.id, board: article.board, title: article.title })
  }

  return (
    <article className="mx-auto max-w-[760px]">
      <nav aria-label="麵包屑" className="mb-3 flex items-center gap-2 text-[11px] text-[var(--faint)]">
        <Link to={`/board/${article.board}`} className="font-extrabold text-[var(--brand)] hover:underline">← {article.board}</Link>
      </nav>

      <div className="mb-3 flex flex-wrap items-center gap-2 text-[10px]">
        {article.isPin && (
          <span className="inline-flex items-center rounded bg-[var(--warning-soft)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--warning)]">📌置頂</span>
        )}
        {article.tags.map(tag => (
          <span key={tag} className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">{tag}</span>
        ))}
        {article.isHot && (
          <span className="inline-flex items-center rounded bg-[var(--hot-soft)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--hot)]">🔥爆文</span>
        )}
      </div>

      <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Article reader</p>
      <h1 className="mt-2 text-[clamp(27px,4vw,46px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-[var(--ink)]">
        {article.title}
      </h1>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--line)] pb-3 text-[11px] text-[var(--muted)]">
        <span>
          {article.author} @ {article.authorIp} · 發於 {new Date(article.postedAt).toLocaleString('zh-Hant')}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleQueue}
            data-testid="queue-toggle-article"
            aria-pressed={queued}
            className={[
              'inline-flex h-[34px] items-center rounded-md border px-3 text-[11px] font-extrabold',
              queued
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
            ].join(' ')}
          >
            {queued ? '✓ 已加入佇列' : '+ 加到佇列'}
          </button>
          <button
            type="button"
            onClick={toggleFav}
            data-testid="fav-toggle-article"
            className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            {faved ? '★ 已收藏' : '☆ 加最愛'}
          </button>
        </div>
      </div>

      {remote.error && (
        <div className="mt-4 rounded-md border border-[var(--warning)] bg-[var(--warning-soft)] px-3 py-2 text-[12px] text-[var(--warning)]" role="status" data-testid="article-stale">
          PTT 全文同步暫時失敗，目前顯示可用資料。
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border border-[var(--line)] bg-[var(--surface-soft)] px-4 py-3 font-mono text-[11px] text-[var(--muted)] tnum" data-testid="push-summary">
        <span className="text-[var(--hot)]">▲ 推 {article.pushes}</span>
        <span className="text-[var(--boo)]">▼ 噓 {article.boos}</span>
        <span className="text-[var(--faint)]">→ {article.arrows}</span>
        {article.pushToBooRatio && article.pushToBooRatio < 99 && (
          <span className={[
            'font-bold',
            article.pushedToward === 'positive' ? 'text-[var(--hot)]' : article.pushedToward === 'negative' ? 'text-[var(--boo)]' : 'text-[var(--muted)]',
          ].join(' ')}>
            比 {article.pushToBooRatio}:1
          </span>
        )}
      </div>

      <div
        className="prose mt-6 max-w-[650px] text-[17px] leading-[1.95] text-[var(--ink)] dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.content) }}
      />
    </article>
  )
}
