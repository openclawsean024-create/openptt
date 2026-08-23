import { Link } from 'react-router-dom'
import { useFavorites } from '../lib/useFavorites'
import { removeFavorite, emitFavorites, reorderFavorites } from '../lib/favorites'
import { useState } from 'react'

export default function FavoritesPage() {
  const items = useFavorites()
  const [dragIdx, setDragIdx] = useState<number | null>(null)

  const handleRemove = (type: 'board' | 'article', id: string) => {
    removeFavorite(type, id)
    emitFavorites()
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) return
    reorderFavorites(dragIdx, dropIdx)
    emitFavorites()
    setDragIdx(null)
  }

  if (items.length === 0) {
    return (
      <div className="text-center text-slate-500 py-12">
        <p>還沒有任何最愛</p>
        <p className="text-sm mt-2">到看板或文章頁按「加最愛」就會出現在這裡</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">我的最愛</h1>
      <ul className="divide-y divide-slate-200 dark:divide-slate-700" data-testid="favorites-list">
        {items.map((item, idx) => (
          <li
            key={`${item.type}-${item.id}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            className="py-2 flex items-center justify-between gap-2 cursor-move"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-slate-400 w-12">
                {item.type === 'board' ? '看板' : '文章'}
              </span>
              <Link
                to={item.type === 'board' ? `/board/${item.id}` : `/article/${item.id}?board=`}
                className="hover:underline flex-1"
              >
                {item.label}
              </Link>
            </div>
            <button
              onClick={() => handleRemove(item.type, item.id)}
              className="px-2 py-1 rounded text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              data-testid="fav-remove"
            >
              移除
            </button>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500 mt-4">提示:拖拽項目可以重新排序</p>
    </div>
  )
}
