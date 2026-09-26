import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'

export default function LiveHotPage() {
  const [updatedAt, setUpdatedAt] = useState('13 分鐘前')
  const articles = useMemo(
    () => ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball']
      .flatMap(board => getArticles(board, 'hot'))
      .sort((a, b) => b.pushes - a.pushes)
      .slice(0, 8),
    [],
  )

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
              參考對標 App 的即時熱門入口；目前以 mock feed 展示更新與熱度層級。
            </p>
          </div>
          <button
            type="button"
            onClick={() => setUpdatedAt('剛剛')}
            className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
            data-testid="refresh-live-hot"
          >
            ↻ 重新整理
          </button>
        </div>
        <div className="mt-4 border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center text-[12px] text-[var(--muted)]" data-testid="live-hot-updated">
          更新：{updatedAt} · 顯示分級限制看板熱門文章
        </div>
      </section>

      <div className="mt-8 border-t-2 border-[var(--ink)]" data-testid="live-hot-list">
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
                <span aria-hidden="true">·</span>
                <span>即時</span>
              </div>
              <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)]">
                {article.title}
              </span>
              <div className="mt-1 text-[10px] text-[var(--faint)]">{article.author} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</div>
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
