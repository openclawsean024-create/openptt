import { Link } from 'react-router-dom'
import { useFavorites } from '../lib/useFavorites'
import { addFavorite, removeFavorite, reorderFavorites } from '../lib/favorites'
import type { FavoriteItem } from '../lib/favorites'
import { useEffect, useState } from 'react'

type FavoriteTab = 'all' | 'board' | 'article'

export default function FavoritesPage() {
  const items = useFavorites()
  const [tab, setTab] = useState<FavoriteTab>('all')
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [removed, setRemoved] = useState<FavoriteItem | null>(null)

  useEffect(() => {
    if (!removed) return
    const timeout = window.setTimeout(() => setRemoved(null), 4000)
    return () => window.clearTimeout(timeout)
  }, [removed])

  const handleRemove = (type: 'board' | 'article', id: string) => {
    const item = items.find(candidate => candidate.type === type && candidate.id === id)
    removeFavorite(type, id)
    if (item) setRemoved(item)
  }

  const handleDragStart = (idx: number) => setDragIdx(idx)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (dropIdx: number) => {
    if (dragIdx === null || dragIdx === dropIdx) return
    reorderFavorites(dragIdx, dropIdx)
    setDragIdx(null)
  }

  const visibleItems = tab === 'all' ? items : items.filter(item => item.type === tab)
  const tabs: Array<{ id: FavoriteTab; label: string }> = [
    { id: 'all', label: '全部' },
    { id: 'board', label: '看板' },
    { id: 'article', label: '文章' },
  ]

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
      <div className="mb-4 flex gap-2 border-b border-slate-200 dark:border-slate-700" role="tablist" aria-label="收藏篩選">
        {tabs.map(currentTab => (
          <button
            key={currentTab.id}
            type="button"
            role="tab"
            aria-selected={tab === currentTab.id}
            aria-pressed={tab === currentTab.id}
            onClick={() => { setTab(currentTab.id); setDragIdx(null) }}
            className={'border-b-2 px-3 py-2 text-sm font-semibold ' + (tab === currentTab.id
              ? 'border-emerald-500 text-emerald-700 dark:text-emerald-300'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200')}
          >{currentTab.label}</button>
        ))}
      </div>
      {visibleItems.length === 0 ? (
        <div className="py-10 text-center text-sm text-slate-500" data-testid="favorites-filter-empty">這個分類還沒有收藏。</div>
      ) : (
      <ul className="divide-y divide-slate-200 dark:divide-slate-700" data-testid="favorites-list">
        {visibleItems.map((item, idx) => (
          <li
            key={`${item.type}-${item.id}`}
            draggable={tab === 'all'}
            onDragStart={() => handleDragStart(idx)}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(idx)}
            className={'flex items-center justify-between gap-2 py-2 ' + (tab === 'all' ? 'cursor-move' : '')}
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
      )}
      <p className="mt-4 text-xs text-slate-500">提示：在「全部」分頁拖拽項目可以重新排序。</p>
      {removed && (
        <div className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl" role="status" aria-live="polite" data-testid="favorite-toast">
          <span>已移除「{removed.label}」</span>
          <button type="button" onClick={() => { addFavorite(removed); setRemoved(null) }} className="font-bold text-emerald-300 hover:text-emerald-200">復原</button>
        </div>
      )}
    </div>
  )
}
