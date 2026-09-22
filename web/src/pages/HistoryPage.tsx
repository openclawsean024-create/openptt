import { Link } from 'react-router-dom'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'

export default function HistoryPage() {
  const items = useRecent()
  const boards = items.filter(item => item.type === 'board')
  const articles = items.filter(item => item.type === 'article')

  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">READING HISTORY</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">閱讀歷史</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">最近 10 個看板與文章只保存在這個瀏覽器。</p>
        </div>
        {items.length > 0 && <button onClick={clearRecent} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="clear-history">清除歷史</button>}
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400" data-testid="history-empty">
          <p>還沒有閱讀歷史。</p>
          <Link to="/boards" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline dark:text-emerald-300">探索看板 →</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-lg font-semibold">最近看板</h2>
            <div className="space-y-2">
              {boards.length === 0 ? <p className="text-sm text-slate-500">尚無看板紀錄。</p> : boards.map(item => <Link key={item.id} to={'/board/' + item.id} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"><strong>{item.label}</strong><span className="mt-1 block text-xs text-slate-500">看板 · 最近閱讀</span></Link>)}
            </div>
          </section>
          <section>
            <h2 className="mb-3 text-lg font-semibold">最近文章</h2>
            <div className="space-y-2">
              {articles.length === 0 ? <p className="text-sm text-slate-500">尚無文章紀錄。</p> : articles.map(item => <Link key={item.id} to={'/article/' + item.id + '?board=' + (item.board ?? '')} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900"><strong className="block truncate">{item.label}</strong><span className="mt-1 block text-xs text-slate-500">{item.board ?? '文章'} · 最近閱讀</span></Link>)}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
