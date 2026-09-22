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
  const totalSubs = BOARDS.reduce((s, b) => s + b.subscribers, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">看板列表</h1>
        <div className="text-xs text-slate-500" data-testid="board-count">共 {totalBoards} 個看板 · {totalSubs.toLocaleString()} 訂閱</div>
      </div>

      <input
        type="text"
        placeholder="🔍 搜尋看板名 / 描述 / 分類..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full mb-4 px-3 py-2 border border-slate-300 rounded"
        data-testid="board-search"
      />

      {search && (
        <div className="mb-4 text-sm text-slate-600" data-testid="search-count">找到 {boards.length} 個看板</div>
      )}

      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">分類({CATEGORIES.length})</h2>
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1" role="group" aria-label="看板分類">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(current => current === cat ? '' : cat)}
              aria-pressed={category === cat}
              className={'shrink-0 rounded-full px-3 py-1 text-sm transition ' + (category === cat
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300')}
            >{cat} ({stats[cat] ?? 0})</button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">所有看板({boards.length})</h2>
        {boards.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700" data-testid="board-empty">
            <div className="text-3xl" aria-hidden="true">⌕</div>
            <p className="mt-2 font-semibold">找不到相關看板</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">換個關鍵字或清除篩選條件試試。</p>
            <button
              type="button"
              onClick={() => { setSearch(''); setCategory('') }}
              className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              data-testid="board-search-clear"
            >清除搜尋</button>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2 md:grid-cols-3" data-testid="boards-list">
            {boards.map(b => (
              <li key={b.name}>
                <Link to={`/board/${b.name}`} className="block rounded border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{b.name}</span>
                    {b.isHot && <span className="text-xs text-orange-600">🔥</span>}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-500">{b.category} · {b.subscribers.toLocaleString()} 訂閱</div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
