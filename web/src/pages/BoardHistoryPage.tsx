import { Link } from 'react-router-dom'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'

export default function BoardHistoryPage() {
  const boards = useRecent().filter(item => item.type === 'board')

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Board history</p>
        <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="mt-3 max-w-[760px] text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-[var(--ink)]">
              看板歷史
            </h1>
            <p className="mt-2 text-[12px] text-[var(--muted)]">快速回到最近看過的板。</p>
          </div>
          {boards.length > 0 && (
            <button
              type="button"
              onClick={clearRecent}
              className="inline-flex h-[38px] items-center rounded-md border border-[var(--line)] px-3 text-[12px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
              data-testid="clear-board-history"
            >
              清除歷史
            </button>
          )}
        </div>
      </section>

      {boards.length === 0 ? (
        <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="board-history-empty">
          <p>還沒有看板歷史。</p>
          <Link to="/boards" className="mt-2 inline-block text-[11px] font-extrabold text-[var(--brand)] hover:underline">探索看板 →</Link>
        </div>
      ) : (
        <ul className="border-t-2 border-[var(--ink)]">
          {boards.map(item => (
            <li key={item.id}>
              <Link
                to={'/board/' + item.id}
                className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
              >
                <div className="font-mono text-[12px] text-[var(--faint)]">▤</div>
                <div className="min-w-0">
                  <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)] hover:text-[var(--brand)]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-[10px] text-[var(--faint)]">看板 · 最近閱讀</span>
                </div>
                <div className="flex items-end justify-end text-[10px] font-extrabold text-[var(--brand)]">→</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
