import { useState, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BOARDS, searchBoards, CATEGORIES, getCategoryStats } from '../data/boards'

export default function BoardListPage() {
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(() => searchParams.get('search') ?? '')
  const [category, setCategory] = useState('')
  const boards = useMemo(() => {
    return searchBoards(search).filter(board => !category || board.category === category)
  }, [category, search])
  const stats = getCategoryStats()
  const totalBoards = BOARDS.length
  const totalSubs = BOARDS.reduce((sum, board) => sum + board.subscribers, 0)

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Board explorer</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          Find your<br />
          <span className="text-[var(--brand)]">next board.</span>
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          用板名或描述探索 {totalBoards} 個看板。OpenPTT 先把上下文說清楚，再把你送進文章。
        </p>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <strong className="text-[var(--ink)]">{`所有看板(${boards.length})`}</strong>
            <p className="mt-1 text-[11px] text-[var(--muted)]" data-testid="board-count">
              共 {totalBoards} 個看板 · {totalSubs.toLocaleString()} 訂閱
            </p>
          </div>
        </div>

        <div className="relative mb-4 max-w-[580px]">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--faint)]">⌕</span>
          <input
            type="search"
            placeholder="搜尋看板名 / 描述 / 分類"
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="h-[42px] w-full rounded-md border border-[var(--control)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--ink)] placeholder:text-[var(--faint)]"
            data-testid="board-search"
          />
        </div>

        {search && (
          <div className="mb-4 text-[13px] text-[var(--muted)]" data-testid="search-count">
            找到 {boards.length} 個看板
          </div>
        )}

        <div className="mb-4 flex gap-2 overflow-x-auto pb-1" role="group" aria-label="看板分類">
          <button
            type="button"
            onClick={() => setCategory('')}
            aria-pressed={category === ''}
            className={[
              'flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition',
              category === ''
                ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                : 'border-[var(--line)] bg-transparent text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
            ].join(' ')}
          >
            全部 ({totalBoards})
          </button>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(value => value === cat ? '' : cat)}
              aria-pressed={category === cat}
              className={[
                'flex-shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-extrabold transition',
                category === cat
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                  : 'border-[var(--line)] bg-transparent text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
              ].join(' ')}
            >
              {cat} ({stats[cat] ?? 0})
            </button>
          ))}
        </div>
      </section>

      {boards.length === 0 ? (
        <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="board-empty">
          <div className="text-[28px]" aria-hidden="true">⌕</div>
          <p className="mt-2 font-semibold text-[var(--ink)]">找不到相關看板</p>
          <p className="mt-1 text-[12px] text-[var(--muted)]">換個關鍵字或清除篩選條件試試。</p>
          <button
            type="button"
            onClick={() => { setSearch(''); setCategory('') }}
            className="mt-4 inline-flex h-[38px] items-center rounded-md border border-[var(--brand)] bg-[var(--brand)] px-4 text-[11px] font-extrabold text-white hover:bg-[var(--brand-deep)]"
            data-testid="board-search-clear"
          >
            清除搜尋
          </button>
        </div>
      ) : (
        <ul className="border-t-2 border-[var(--ink)]" data-testid="boards-list">
          {boards.map(board => (
            <li key={board.name}>
              <Link
                to={`/board/${board.name}`}
                className="grid grid-cols-[48px_minmax(0,1fr)_96px] items-start gap-4 border-b border-[var(--line)] py-5 hover:bg-[color-mix(in_srgb,var(--surface-soft)_54%,transparent)]"
              >
                <div className="font-mono text-[12px] text-[var(--faint)]">{board.name.charAt(0)}</div>
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] text-[var(--faint)]">
                    <span className="font-extrabold text-[var(--brand)]">{board.name}</span>
                    <span aria-hidden="true">·</span>
                    <span>{board.category}</span>
                    {board.isHot && (
                      <span className="ml-1 inline-flex items-center rounded bg-[var(--hot-soft)] px-1.5 py-0.5 text-[9px] font-extrabold text-[var(--hot)]">
                        熱
                      </span>
                    )}
                  </div>
                  <span className="block text-[18px] font-extrabold leading-[1.45] tracking-[-0.025em] text-[var(--ink)]">
                    {board.description}
                  </span>
                  <p className="mt-1 text-[10px] text-[var(--faint)]">{board.subscribers.toLocaleString()} 人關注 · 開啟看板 →</p>
                </div>
                <div className="flex items-end justify-end text-[10px] font-extrabold text-[var(--brand)]">
                  →
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
