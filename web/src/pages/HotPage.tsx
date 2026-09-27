import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'
import { useCrossBoardFeed } from '../lib/useCrossBoardFeed'

const HOT_BOARDS = ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball', 'movie', 'KoreaStar', 'Lifeismoney', 'HatePolitics']

function formatRelative(input: string | number) {
  const target = typeof input === 'number' ? input : new Date(input).getTime()
  if (!Number.isFinite(target)) return ''
  const diff = Date.now() - target
  if (diff < 60_000) return '剛剛'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分鐘前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小時前`
  return new Date(target).toLocaleString('zh-Hant')
}

export default function HotPage() {
  const crossFeed = useCrossBoardFeed({ boards: HOT_BOARDS, limit: 30 })
  // FR-018 / AC-040: prefer API-provided articles (both PTT and mock) so the
  // source label never relabels local fallback data as live. The local
  // `getArticles` snapshot is only used when the API call itself errored
  // without returning data, and is always rendered with the demo badge.
  const apiArticles = crossFeed.data?.articles ?? []
  const usedApiFeed = apiArticles.length > 0
  const localFallback = useMemo(
    () => HOT_BOARDS.flatMap(board => getArticles(board, 'hot')).sort((a, b) => b.pushes - a.pushes),
    [],
  )
  const articles = usedApiFeed
    ? [...apiArticles].sort((a, b) => b.pushes - a.pushes)
    : localFallback.map(article => ({ ...article, source: 'mock' as const }))
  const source = usedApiFeed ? (crossFeed.data?.source ?? 'mock') : 'mock'
  const partial = crossFeed.data?.partial ?? false
  const successfulBoards = useMemo(
    () => (crossFeed.data?.boards ?? []).filter(report => report.status === 'ptt').length,
    [crossFeed.data],
  )

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Trending signals</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          What people<br />
          <span className="text-[var(--brand)]">are reading.</span>
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          熱門是發現入口，不是推薦真理。OpenPTT 把推噓摘要與來源時間放在同一個掃讀單位。
        </p>
      </section>

      <section className="mt-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <strong className="text-[var(--ink)]">Trending now ({articles.length})</strong>
            <p className="mt-1 text-[11px] text-[var(--muted)]" data-testid="hot-source-meta">
              {crossFeed.loading
                ? '正在同步跨板熱門…'
                : source === 'ptt'
                  ? `來源：PTT · 跨 ${successfulBoards} 板${partial ? '（部分看板失敗）' : ''} · 最近同步於 ${formatRelative(crossFeed.data?.fetchedAt ?? '')}`
                  : '示範快照 · PTT 暫時無法取得，資料可能過期'}
            </p>
          </div>
        </div>
        {crossFeed.error && (
          <div className="border border-[var(--warning)] bg-[var(--warning-soft)] px-3 py-2 text-[11px] text-[var(--warning)]" role="status" data-testid="hot-stale-banner">
            跨板熱門聚合暫時無法同步（{crossFeed.error}），目前以示範快照保留可閱讀體驗。
          </div>
        )}
        <div className="border-t-2 border-[var(--ink)]" data-testid="hot-list">
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
                  {article.tags.map(tag => (
                    <span key={tag} className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] text-[var(--muted)]">{tag}</span>
                  ))}
                  {article.source === 'mock' && (
                    <span className="rounded bg-[var(--surface-soft)] px-1.5 py-0.5 text-[10px] font-extrabold text-[var(--muted)]" data-testid={`hot-source-mock-${article.id}`}>
                      示範
                    </span>
                  )}
                </div>
                <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)]">
                  {article.title}
                </span>
                <div className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · {formatRelative(article.postedAt)}</div>
              </div>
              <div className="flex flex-col items-end font-mono text-[11px] text-[var(--muted)] tnum">
                <span className="text-[var(--hot)]">推 {article.pushes}</span>
                <span className="text-[var(--boo)]">噓 {article.boos}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
