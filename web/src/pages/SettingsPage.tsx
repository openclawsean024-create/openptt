import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../lib/theme'
import { clearAllSubscriptions, removeSubscription, subscriptionLimits, toggleSubscription } from '../lib/subscriptions'
import { useSubscriptions } from '../lib/useSubscriptions'
import { clearAllFavorites } from '../lib/favorites'
import { useFavorites } from '../lib/useFavorites'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'
import { clearQueue } from '../lib/queue'
import { useQueue } from '../lib/useQueue'

const THEME_STORAGE_KEY = 'openptt:theme'

export default function SettingsPage() {
  const theme = useThemeStore(state => state.theme)
  const setTheme = useThemeStore(state => state.setTheme)
  const subscriptions = useSubscriptions()
  const favorites = useFavorites()
  const recent = useRecent()
  const queue = useQueue()
  const grouped = Array.from(new Set(subscriptions.map(item => item.board)))
  const [lastCleared, setLastCleared] = useState<string | null>(null)

  const confirmAnd = (label: string, action: () => void) => {
    if (typeof window !== 'undefined' && !window.confirm(`確定要${label}？此動作只會清掉這個瀏覽器 localStorage 裡的 OpenPTT 資料，無法復原。`)) {
      return
    }
    action()
    setLastCleared(label)
  }

  const handleClearFavorites = () => confirmAnd('清除本機收藏', clearAllFavorites)
  const handleClearSubscriptions = () => confirmAnd('清除本機關鍵字訂閱', clearAllSubscriptions)
  const handleClearRecent = () => confirmAnd('清除最近瀏覽', clearRecent)
  const handleClearQueue = () => confirmAnd('清空閱讀佇列', clearQueue)
  const handleResetTheme = () => {
    if (typeof window !== 'undefined' && !window.confirm('確定要重置主題為系統預設？')) {
      return
    }
    try {
      localStorage.removeItem(THEME_STORAGE_KEY)
    } catch {
      // private browsing fallback
    }
    setTheme('system')
    setLastCleared('重置主題')
  }

  return (
    <div>
      <section className="border-b border-[var(--line)] pb-12">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">Preferences</p>
        <h1 className="mt-3 max-w-[760px] text-[clamp(38px,6vw,72px)] font-extrabold leading-[1.03] tracking-[-0.075em] text-[var(--ink)]">
          閱讀偏好
        </h1>
        <p className="mt-4 max-w-[560px] text-[16px] leading-[1.75] text-[var(--muted)]">
          不需要登入；偏好與訂閱只保存在這個瀏覽器。
        </p>
      </section>

      <section className="mt-10 border-t-2 border-[var(--ink)] pt-5">
        <h2 className="text-[15px] tracking-[-0.025em] text-[var(--ink)]">主題</h2>
        <p className="mt-1 text-[11px] text-[var(--muted)]">選擇符合環境的閱讀色彩。</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="主題選擇">
          {(['system', 'light', 'dark'] as const).map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              aria-pressed={theme === option}
              className={[
                'inline-flex h-[34px] items-center rounded-md border px-3 text-[12px] font-extrabold',
                theme === option
                  ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[var(--brand)]'
                  : 'border-[var(--line)] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]',
              ].join(' ')}
            >
              {option === 'system' ? '系統' : option === 'light' ? '淺色' : '深色'}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-10 border-t border-[var(--line)] pt-5" aria-labelledby="subscription-heading" data-testid="subscription-manager">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="subscription-heading" className="text-[15px] tracking-[-0.025em] text-[var(--ink)]">關鍵字訂閱</h2>
            <p className="mt-1 text-[11px] text-[var(--muted)]">只比對指定看板的標題、內文與標籤；目前只提供站內命中提示。</p>
          </div>
          <span className="shrink-0 text-[10px] font-mono text-[var(--faint)]">
            {subscriptions.length} / {subscriptionLimits.total}
          </span>
        </div>
        {grouped.length === 0 ? (
          <div className="mt-5 border border-dashed border-[var(--line)] p-5 text-center text-[12px] text-[var(--muted)]" data-testid="subscription-empty">
            還沒有任何關鍵字訂閱。<br />
            <Link to="/boards" className="mt-2 inline-block text-[11px] font-extrabold text-[var(--brand)] hover:underline">
              先去探索看板 →
            </Link>
          </div>
        ) : (
          grouped.map(board => (
            <div key={board} className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <Link to={'/board/' + board} className="text-[12px] font-extrabold text-[var(--ink)] hover:text-[var(--brand)] hover:underline">
                  {board}
                </Link>
                <span className="text-[10px] text-[var(--faint)]">
                  {subscriptions.filter(item => item.board === board).length} / {subscriptionLimits.perBoard}
                </span>
              </div>
              <ul className="space-y-2">
                {subscriptions.filter(item => item.board === board).map(item => (
                  <li
                    key={item.id}
                    className={[
                      'flex items-center gap-3 rounded-md border border-[var(--line)] px-3 py-2',
                      item.enabled ? 'bg-[var(--surface-soft)]' : 'bg-[var(--surface-soft)] opacity-60',
                    ].join(' ')}
                  >
                    <span className="min-w-0 flex-1 truncate text-[12px] font-bold">{item.keyword}</span>
                    <button
                      type="button"
                      onClick={() => toggleSubscription(item.id)}
                      aria-pressed={item.enabled}
                      className="inline-flex h-[28px] items-center rounded-md border border-[var(--line)] px-2 text-[10px] font-bold text-[var(--muted)]"
                    >
                      {item.enabled ? '啟用中' : '已停用'}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSubscription(item.id)}
                      className="inline-flex h-[28px] items-center rounded-md px-2 text-[10px] font-bold text-[var(--boo)] hover:bg-[var(--surface)]"
                      data-testid="subscription-remove"
                    >
                      刪除
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
        <p className="mt-5 border-t border-[var(--line)] pt-4 text-[10px] text-[var(--faint)]">
          訂閱保存在 localStorage，不會送出 Web Push；推播權限屬於後續版本。
        </p>
      </section>

      <section className="mt-10 border-t border-[var(--line)] pt-5" aria-labelledby="privacy-heading" data-testid="data-privacy">
        <h2 id="privacy-heading" className="text-[15px] tracking-[-0.025em] text-[var(--ink)]">資料與隱私</h2>
        <p className="mt-1 text-[11px] text-[var(--muted)]">OpenPTT 不蒐集帳號、付款、推播權限；以下按鈕只清掉這個瀏覽器 localStorage 裡的 OpenPTT 資料。</p>
        <ul className="mt-4 space-y-3" role="list">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3" data-testid="privacy-row-favorites">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold">清除本機收藏</p>
              <p className="text-[10px] text-[var(--faint)]">目前 {favorites.length} 筆收藏（看板 + 文章）。</p>
            </div>
            <button
              type="button"
              onClick={handleClearFavorites}
              disabled={favorites.length === 0}
              className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="privacy-clear-favorites"
            >
              清除收藏
            </button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3" data-testid="privacy-row-subscriptions">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold">清除本機關鍵字訂閱</p>
              <p className="text-[10px] text-[var(--faint)]">目前 {subscriptions.length} 筆訂閱。</p>
            </div>
            <button
              type="button"
              onClick={handleClearSubscriptions}
              disabled={subscriptions.length === 0}
              className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="privacy-clear-subscriptions"
            >
              清除訂閱
            </button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3" data-testid="privacy-row-queue">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold">清空閱讀佇列</p>
              <p className="text-[10px] text-[var(--faint)]">目前 {queue.length} 篇佇列文章。</p>
            </div>
            <button
              type="button"
              onClick={handleClearQueue}
              disabled={queue.length === 0}
              className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="privacy-clear-queue"
            >
              清空佇列
            </button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3" data-testid="privacy-row-recent">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold">清除最近瀏覽</p>
              <p className="text-[10px] text-[var(--faint)]">目前 {recent.length} 筆最近閱讀紀錄。</p>
            </div>
            <button
              type="button"
              onClick={handleClearRecent}
              disabled={recent.length === 0}
              className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="privacy-clear-recent"
            >
              清除最近瀏覽
            </button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--line)] p-3" data-testid="privacy-row-theme">
            <div className="min-w-0">
              <p className="text-[12px] font-extrabold">重置主題為系統預設</p>
              <p className="text-[10px] text-[var(--faint)]">目前主題：{theme === 'system' ? '系統' : theme === 'light' ? '淺色' : '深色'}。</p>
            </div>
            <button
              type="button"
              onClick={handleResetTheme}
              disabled={theme === 'system'}
              className="inline-flex h-[34px] items-center rounded-md border border-[var(--line)] px-3 text-[11px] font-extrabold text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
              data-testid="privacy-reset-theme"
            >
              重置主題
            </button>
          </li>
        </ul>
        {lastCleared && (
          <p className="mt-4 text-[12px] font-bold text-[var(--brand)]" role="status" aria-live="polite" data-testid="privacy-feedback">
            已{lastCleared}。
          </p>
        )}
      </section>
    </div>
  )
}
