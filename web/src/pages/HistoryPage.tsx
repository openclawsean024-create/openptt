import { Link } from 'react-router-dom'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'

export default function HistoryPage() {
  const items = useRecent()
  const boards = items.filter(item => item.type === 'board')
  const articles = items.filter(item => item.type === 'article')

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Reading history</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
              Recent reading
            </h1>
            <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
              最近 10 個看板與文章只保存在這個瀏覽器。
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 text-[12px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              data-testid="clear-history"
            >
              清除歷史
            </button>
          )}
        </div>
      </section>

      {items.length === 0 ? (
        <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="history-empty">
          <p>還沒有閱讀歷史。</p>
          <Link
            to="/boards"
            className="mt-2 inline-block text-[11px] font-extrabold text-[var(--brand)] hover:underline"
          >
            探索看板 →
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-x-8 gap-y-8 lg:grid-cols-2">
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <strong className="text-[var(--ink)]">最近看板 ({boards.length})</strong>
            </div>
            <ul className="border-t-2 border-[var(--ink)]">
              {boards.length === 0 ? (
                <li className="border-b border-[var(--line)] py-4 text-[12px] text-[var(--muted)]">尚無看板紀錄。</li>
              ) : (
                boards.map(item => (
                  <li key={item.id}>
                    <Link
                      to={'/board/' + item.id}
                      className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-4 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
                    >
                      <div className="font-mono text-[12px] text-[var(--faint)]">▤</div>
                      <div className="min-w-0">
                        <span className="block text-[14px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)]">{item.label}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--faint)]">看板 · 最近閱讀</span>
                      </div>
                      <div className="flex items-end justify-end text-[10px] font-extrabold text-[var(--brand)]">→</div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
          <section>
            <div className="mb-3 flex items-end justify-between gap-3">
              <strong className="text-[var(--ink)]">最近文章 ({articles.length})</strong>
            </div>
            <ul className="border-t-2 border-[var(--ink)]">
              {articles.length === 0 ? (
                <li className="border-b border-[var(--line)] py-4 text-[12px] text-[var(--muted)]">尚無文章紀錄。</li>
              ) : (
                articles.map(item => (
                  <li key={item.id}>
                    <Link
                      to={'/article/' + item.id + '?board=' + (item.board ?? '')}
                      className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-4 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
                    >
                      <div className="font-mono text-[12px] text-[var(--faint)]">▰</div>
                      <div className="min-w-0">
                        <span className="block truncate text-[14px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)]">{item.label}</span>
                        <span className="mt-0.5 block text-[10px] text-[var(--faint)]">{item.board ?? '文章'} · 最近閱讀</span>
                      </div>
                      <div className="flex items-end justify-end text-[10px] font-extrabold text-[var(--brand)]">→</div>
                    </Link>
                  </li>
                ))
              )}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
