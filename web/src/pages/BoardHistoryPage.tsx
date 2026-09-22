import { Link } from 'react-router-dom'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'

export default function BoardHistoryPage() {
  const boards = useRecent().filter(item => item.type === 'board')

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4"><div><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">BOARD HISTORY</p><h1 className="mt-2 text-3xl font-bold tracking-tight">看板歷史</h1><p className="mt-2 text-slate-500 dark:text-slate-400">快速回到最近看過的板。</p></div>{boards.length > 0 && <button onClick={clearRecent} className="rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600" data-testid="clear-board-history">清除歷史</button>}</div>
      {boards.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700" data-testid="board-history-empty"><p>還沒有看板歷史。</p><Link to="/boards" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline dark:text-emerald-300">探索看板 →</Link></div> : <div className="space-y-2">{boards.map(item => <Link key={item.id} to={'/board/' + item.id} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"><strong>{item.label}</strong><span className="mt-1 block text-xs text-slate-500">最近閱讀</span></Link>)}</div>}
    </div>
  )
}
