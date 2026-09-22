import { Link } from 'react-router-dom'
import { useFavorites } from '../lib/useFavorites'
import { removeFavorite } from '../lib/favorites'

export default function ArticleFavoritesPage() {
  const items = useFavorites().filter(item => item.type === 'article')

  return (
    <div>
      <div className="mb-6"><p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">ARTICLE BOOKMARKS</p><h1 className="mt-2 text-3xl font-bold tracking-tight">文章收藏</h1><p className="mt-2 text-slate-500 dark:text-slate-400">只顯示從文章閱讀頁收藏的內容。</p></div>
      {items.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700" data-testid="article-favorites-empty"><p>還沒有收藏文章。</p><Link to="/hot" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline dark:text-emerald-300">瀏覽熱門文章 →</Link></div> : <div className="space-y-2" data-testid="article-favorites-list">{items.map(item => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"><span className="text-xs text-slate-400">文章</span><Link to={'/article/' + item.id} className="min-w-0 flex-1 truncate font-semibold hover:underline">{item.label}</Link><button onClick={() => removeFavorite('article', item.id)} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950" data-testid="article-favorite-remove">移除</button></div>)}</div>}
    </div>
  )
}
