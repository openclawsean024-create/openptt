import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getArticles } from '../data/boards'

export default function HotPage() {
  const articles = useMemo(() => ['Stock', 'Gossiping', 'Tech_Job', 'NBA', 'Baseball'].flatMap(board => getArticles(board, 'hot')).sort((a, b) => b.pushes - a.pushes), [])

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">TRENDING NOW</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">熱門文章</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">依推文訊號整理的閱讀入口；目前使用示範資料。</p>
      </div>
      <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900" data-testid="hot-list">
        {articles.map(article => (
          <Link key={article.id} to={'/article/' + article.id + '?board=' + article.board} className="block p-4 hover:bg-slate-50 dark:hover:bg-slate-800">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-1 flex flex-wrap gap-1 text-xs">
                  <span className="text-emerald-700 dark:text-emerald-300">{article.board}</span>
                  {article.tags.map(tag => <span key={tag} className="rounded bg-slate-100 px-1.5 text-slate-600 dark:bg-slate-800 dark:text-slate-300">{tag}</span>)}
                </div>
                <strong className="block">{article.title}</strong>
                <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">{article.author} · {new Date(article.postedAt).toLocaleString('zh-Hant')}</span>
              </div>
              <span className="shrink-0 text-xs text-orange-600">{article.pushes} 推</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
