import { Link } from 'react-router-dom'
import { useFavorites } from '../lib/useFavorites'
import { removeFavorite } from '../lib/favorites'

export default function ArticleFavoritesPage() {
  const items = useFavorites().filter(item => item.type === 'article')

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Article bookmarks</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(28px,4vw,46px)] font-extrabold leading-[1.12] tracking-[-0.065em] text-[var(--ink)]">
          文章收藏
        </h1>
        <p className="mt-2 text-[12px] text-[var(--muted)]">只顯示從文章閱讀頁收藏的內容。</p>
      </section>

      {items.length === 0 ? (
        <div className="border-b border-[var(--line)] py-12 text-center text-[var(--muted)]" data-testid="article-favorites-empty">
          <p>還沒有收藏文章。</p>
          <Link to="/hot" className="mt-2 inline-block text-[11px] font-extrabold text-[var(--brand)] hover:underline">瀏覽熱門文章 →</Link>
        </div>
      ) : (
        <ul className="border-t-2 border-[var(--ink)]" data-testid="article-favorites-list">
          {items.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b border-[var(--line)] py-4"
            >
              <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--faint)]">文章</span>
              <Link
                to={'/article/' + item.id}
                className="min-w-0 flex-1 truncate text-[14px] font-bold text-[var(--ink)] hover:text-[var(--brand)] hover:underline"
              >
                {item.label}
              </Link>
              <button
                type="button"
                onClick={() => removeFavorite('article', item.id)}
                className="inline-flex h-[28px] items-center rounded-md px-2 text-[10px] font-extrabold text-[var(--boo)] hover:bg-[var(--surface-soft)]"
                data-testid="article-favorite-remove"
              >
                移除
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
