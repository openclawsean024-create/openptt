import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'
import { useCrossBoardFeed } from '../lib/useCrossBoardFeed'

const LIVE_HOT_BOARDS = ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball', 'Lifeismoney', 'HatePolitics']

function formatRelative(input: string | number) {
  const target = typeof input === 'number' ? input : new Date(input).getTime()
  if (!Number.isFinite(target)) return ''
  const diff = Date.now() - target
  if (diff < 60_000) return '剛剛'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`
  return new Date(target).toLocaleString('zh-Hant')
}

export default function LiveHotPage() {
  const [updatedAt, setUpdatedAt] = useState('13 分鐘前')
  const [tick, setTick] = useState(0)
  const crossFeed = useCrossBoardFeed({ boards: LIVE_HOT_BOARDS, limit: 12 })
  // FR-018 / AC-040: render API-provided articles (PTT and mock) so the
  // live badge is never applied to local fallback data. The local
  // `getArticles` snapshot is only used when the API call returned nothing,
  // and is always rendered with the demo badge.
  const apiArticles = crossFeed.data?.articles ?? []
  const usedApiFeed = apiArticles.length > 0
  const localFallback = useMemo(
    () => LIVE_HOT_BOARDS.flatMap(board => getArticles(board, 'hot')).sort((a, b) => b.pushes - a.pushes).slice(0, 8),
    [],
  )
  const articles = usedApiFeed
    ? [...apiArticles].sort((a, b) => b.pushes - a.pushes).slice(0, 8)
    : localFallback.map(article => ({ ...article, source: 'mock' as const }))
  const source = usedApiFeed ? (crossFeed.data?.source ?? 'mock') : 'mock'
  const partial = crossFeed.data?.partial ?? false

  useEffect(() => {
    if (tick === 0) return
    void crossFeed.refresh()
  }, [tick, crossFeed.refresh])

  useEffect(() => {
    if (source !== 'ptt' || !crossFeed.data?.fetchedAt) return
    setUpdatedAt(formatRelative(crossFeed.data.fetchedAt))
  }, [source, crossFeed.data?.fetchedAt])

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Live trending</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
              即時熱門<span className="text-[var(--brand)]">.</span>
            </h1>
            <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
              {source === 'ptt'
                ? `跨板聚合每小時更新${partial ? ' · 部分看板失敗回退示範' : ''}。`
                : 'PTT 來源暫時無法取得，目前以示範快照保留可閱讀入口；不宣稱即時。'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setUpdatedAt('剛剛')
              setTick(value => value + 1)
            }}
            className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            data-testid="refresh-live-hot"
          >
            ↻ 重新整理
          </button>
        </div>
        <div
          className="mt-4 border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center text-[12px] text-[var(--muted)]"
          data-testid="live-hot-updated"
        >
          {crossFeed.loading
            ? '同步中…'
            : source === 'ptt'
              ? `更新：${updatedAt} · 來源 PTT${partial ? '（部分看板失敗）' : ''}`
              : `更新：${updatedAt} · 示範快照（資料可能過期）`}
        </div>
        {crossFeed.error && (
          <div className="mt-3 border border-[var(--warning)] bg-[var(--warning-soft)] px-3 py-2 text-[11px] text-[var(--warning)]" role="status" data-testid="live-hot-stale-banner">
            即時熱門聚合暫時無法同步（{crossFeed.error}），目前顯示可用資料。
          </div>
        )}
      </section>

      <div className="mt-8 border-t-2 border-[var(--ink)]" data-testid="live-hot-list">
        {articles.map((article, index) => (
          <Link
            key={`${article.board}-${article.id}`}
            to={'/article/' + article.id + '?board=' + article.board}
            className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
          >
            <div className="font-mono text-[12px] text-[var(--faint)]">{String(index + 1).padStart(2, '0')}</div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
                <span className="font-extrabold text-[var(--brand)]">{article.board}</span>
                <span aria-hidden="true">·</span>
                <span data-testid={`live-hot-source-${article.id}`}>{article.source === 'mock' ? '示範' : '即時'}</span>
              </div>
              <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)]">
                {article.title}
              </span>
              <div className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · {formatRelative(article.postedAt)}</div>
            </div>
            <div className="flex flex-col items-end font-mono text-[11px] font-extrabold text-[var(--hot)] tnum">
              推 {article.pushes}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
