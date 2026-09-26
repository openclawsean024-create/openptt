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
      <div>
        <section className="border-b border-[var(--line)] pb-12">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Your library</p>
          <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
            Keep the<br />
            <span className="text-[var(--brand)]">good ones.</span>
          </h1>
          <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
            收藏看板與文章，不需要登入，也不把個人閱讀紀錄送到伺服器。
          </p>
        </section>
        <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]">
          <p>還沒有任何最愛</p>
          <p className="mt-2 text-[12px]">到看板或文章頁按「加最愛」就會出現在這裡</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Your library</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          Keep the<br />
          <span className="text-[var(--brand)]">good ones.</span>
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          收藏看板與文章，不需要登入，也不把個人閱讀紀錄送到伺服器。
        </p>
      </section>

      <div className="mt-6 flex gap-2 border-b border-[var(--line)]" role="tablist" aria-label="收藏篩選">
        {tabs.map(currentTab => (
          <button
            key={currentTab.id}
            type="button"
            role="tab"
            aria-selected={tab === currentTab.id}
            aria-pressed={tab === currentTab.id}
            onClick={() => { setTab(currentTab.id); setDragIdx(null) }}
            className={[
              'border-b-2 px-3 py-2 text-[12px] font-extrabold',
              tab === currentTab.id
                ? 'border-[var(--brand)] text-[var(--brand)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)]',
            ].join(' ')}
          >
            {currentTab.label}
          </button>
        ))}
      </div>
      {visibleItems.length === 0 ? (
        <div className="py-10 text-center text-[12px] text-[var(--muted)]" data-testid="favorites-filter-empty">這個分類還沒有收藏。</div>
      ) : (
        <ul className="border-t-2 border-[var(--ink)]" data-testid="favorites-list">
          {visibleItems.map((item, idx) => (
            <li
              key={`${item.type}-${item.id}`}
              draggable={tab === 'all'}
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
              className={['flex items-center justify-between gap-2 border-b border-[var(--line)] py-3', tab === 'all' ? 'cursor-move' : ''].join(' ')}
            >
              <div className="flex flex-1 items-center gap-3">
                <span className="w-12 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--faint)]">
                  {item.type === 'board' ? '看板' : '文章'}
                </span>
                <Link
                  to={item.type === 'board' ? `/board/${item.id}` : `/article/${item.id}?board=`}
                  className="flex-1 text-[14px] font-bold text-[var(--ink)] hover:text-[var(--brand)] hover:underline"
                >
                  {item.label}
                </Link>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.type, item.id)}
                className="inline-flex h-[28px] items-center rounded-md px-2 text-[10px] font-extrabold text-[var(--boo)] hover:bg-[var(--surface-soft)]"
                data-testid="fav-remove"
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-[10px] text-[var(--faint)]">提示：在「全部」分頁拖拽項目可以重新排序。</p>
      {removed && (
        <div
          className="fixed bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-[var(--ink)] bg-[var(--ink)] px-4 py-3 text-[12px] font-bold text-white shadow-2xl"
          role="status"
          aria-live="polite"
          data-testid="favorite-toast"
        >
          <span>已移除「{removed.label}」</span>
          <button type="button" onClick={() => { addFavorite(removed); setRemoved(null) }} className="font-extrabold text-[var(--brand)] hover:underline">復原</button>
        </div>
      )}
    </div>
  )
}
