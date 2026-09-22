import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'

export default function LiveHotPage() {
  const [updatedAt, setUpdatedAt] = useState('13 分鐘前')
  const articles = useMemo(() => ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball'].flatMap(board => getArticles(board, 'hot')).sort((a, b) => b.pushes - a.pushes).slice(0, 8), [])

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">LIVE TRENDING</p><h1 className="mt-2 text-3xl font-bold tracking-tight">即時熱門</h1><p className="mt-2 text-slate-500 dark:text-slate-400">參考對標 App 的即時熱門入口；目前以 mock feed 展示更新與熱度層級。</p></div>
        <button onClick={() => setUpdatedAt('剛剛')} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="refresh-live-hot">↻ 重新整理</button>
      </div>
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-3 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900" data-testid="live-hot-updated">更新：{updatedAt} · 顯示分級限制看板熱門文章</div>
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900" data-testid="live-hot-list">
        {articles.map(article => <Link key={article.id} to={'/article/' + article.id + '?board=' + article.board} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="mb-1 text-xs text-emerald-700 dark:text-emerald-300">{article.board}</div><strong className="block">{article.title}</strong><span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{article.author} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</span></div><span className="shrink-0 text-xs font-semibold text-orange-600">{article.pushes} 推</span></div></Link>)}
      </div>
    </div>
  )
}
