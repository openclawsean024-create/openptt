import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { BOARDS, searchBoards, CATEGORIES, getCategoryStats } from '../data/boards'

export default function BoardListPage() {
  const [search, setSearch] = useState('')
  const boards = useMemo(() => searchBoards(search), [search])
  const stats = getCategoryStats()
  const totalBoards = BOARDS.length
  const totalSubs = BOARDS.reduce((s, b) => s + b.subscribers, 0)

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">看板總覽</h1>
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
        <div className="flex flex-wrap gap-2 mb-4">
          {CATEGORIES.map(cat => (
            <span key={cat} className="px-3 py-1 bg-slate-100 rounded text-sm">{cat} ({stats[cat] ?? 0})</span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">所有看板({boards.length})</h2>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2" data-testid="boards-list">
          {boards.map(b => (
            <li key={b.name}>
              <Link to={`/board/${b.name}`} className="block border border-slate-200 rounded px-3 py-2 hover:bg-slate-50 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{b.name}</span>
                  {b.isHot && <span className="text-xs text-orange-600">🔥</span>}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{b.category} · {b.subscribers.toLocaleString()} 訂閱</div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
