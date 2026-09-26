import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'

export default function HotPage() {
  const articles = useMemo(
    () => ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball', 'movie', 'KoreaStar', 'Lifeismoney']
      .flatMap(board => getArticles(board, 'hot'))
      .sort((a, b) => b.pushes - a.pushes),
    [],
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
            <p className="mt-1 text-[11px] text-[var(--muted)]">依推數排序，跨看板聚合。</p>
          </div>
        </div>
        <div className="border-t-2 border-[var(--ink)]" data-testid="hot-list">
          {articles.map((article, index) => (
            <Link
              key={article.id}
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
                </div>
                <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)]">
                  {article.title}
                </span>
                <div className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</div>
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
