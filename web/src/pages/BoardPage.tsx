import { useState, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getArticles } from '../data/boards'
import { addFavorite, removeFavorite, isFavorite } from '../lib/favorites'

const PAGE_SIZE = 20

export default function BoardPage() {
  const { boardName } = useParams<{ boardName: string }>()
  const [sort, setSort] = useState<'time' | 'hot' | 'pin'>('time')
  const [page, setPage] = useState(1)
  const all = useMemo(() => (boardName ? getArticles(boardName, sort) : []), [boardName, sort])
  const totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const items = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (!boardName || all.length === 0) {
    return <div className="text-center text-slate-500 py-12" data-testid="board-empty">看板不存在或尚無文章</div>
  }

  const faved = isFavorite('board', boardName)
  const toggleFav = () => {
    if (faved) removeFavorite('board', boardName)
    else addFavorite({ type: 'board', id: boardName, label: boardName })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{boardName}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFav}
            data-testid="fav-toggle-board"
            className="px-3 py-1 rounded border border-slate-300 hover:bg-slate-100 text-sm"
          >
            {faved ? '★ 已收藏' : '☆ 加最愛'}
          </button>
          <select
            value={sort}
            onChange={e => setSort(e.target.value as 'time' | 'hot' | 'pin')}
            className="px-2 py-1 rounded border border-slate-300 bg-white text-sm"
            data-testid="sort-select"
          >
            <option value="time">最新</option>
            <option value="hot">熱門</option>
            <option value="pin">板主推薦</option>
          </select>
        </div>
      </div>

      <ul className="divide-y divide-slate-200" data-testid="article-list">
        {items.map(a => (
          <li key={a.id} className="py-2" data-testid={`article-row-${a.id}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <div className="flex flex-wrap gap-1 mb-1">
                  {a.isPin && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 rounded">📌置頂</span>}
                  {a.tags.map(t => <span key={t} className="text-xs bg-slate-100 text-slate-600 px-1.5 rounded">{t}</span>)}
                  {a.isHot && <span className="text-xs bg-red-100 text-red-700 px-1.5 rounded">🔥爆</span>}
                </div>
                <Link to={`/article/${a.id}?board=${boardName}`} className="block hover:underline">{a.title}</Link>
                <div className="text-xs text-slate-500 mt-0.5">
                  {a.author} · {a.authorIp} · {new Date(a.postedAt).toLocaleString('zh-Hant')}
                </div>
              </div>
              <div className="text-xs text-right" data-testid={`push-info-${a.id}`}>
                <div className="text-orange-600">{a.pushes} 推</div>
                <div className="text-red-600">{a.boos} 噓</div>
                <div className="text-slate-400">{a.arrows} →</div>
                {a.pushToBooRatio && a.pushToBooRatio < 99 && <div className="text-slate-500">比 {a.pushToBooRatio}</div>}
              </div>
            </div>
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2 text-sm">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-2 py-1 rounded border disabled:opacity-40">上一頁</button>
          <span className="px-3 py-1">{page} / {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-2 py-1 rounded border disabled:opacity-40">下一頁</button>
        </div>
      )}
    </div>
  )
}
