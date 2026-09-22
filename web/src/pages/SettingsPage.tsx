import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useThemeStore } from '../lib/theme'
import { clearAllSubscriptions, removeSubscription, subscriptionLimits, toggleSubscription } from '../lib/subscriptions'
import { useSubscriptions } from '../lib/useSubscriptions'
import { clearAllFavorites } from '../lib/favorites'
import { useFavorites } from '../lib/useFavorites'
import { clearRecent } from '../lib/recent'
import { useRecent } from '../lib/useRecent'

const THEME_STORAGE_KEY = 'openptt:theme'

export default function SettingsPage() {
  const theme = useThemeStore(state => state.theme)
  const setTheme = useThemeStore(state => state.setTheme)
  const subscriptions = useSubscriptions()
  const favorites = useFavorites()
  const recent = useRecent()
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
      <div className="mb-6">
        <p className="text-xs font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">PREFERENCES</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">閱讀偏好</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">不需要登入；偏好與訂閱只保存在這個瀏覽器。</p>
      </div>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="theme-heading">
        <h2 id="theme-heading" className="text-lg font-semibold">主題</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">選擇符合環境的閱讀色彩。</p>
        <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="主題選擇">
          {(['system', 'light', 'dark'] as const).map(option => <button key={option} onClick={() => setTheme(option)} aria-pressed={theme === option} className={theme === option ? 'rounded-lg border border-emerald-500 bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'rounded-lg border border-slate-300 px-3 py-2 text-sm dark:border-slate-600'}>{option === 'system' ? '系統' : option === 'light' ? '淺色' : '深色'}</button>)}
        </div>
      </section>

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="subscription-heading" data-testid="subscription-manager">
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="subscription-heading" className="text-lg font-semibold">關鍵字訂閱</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">只比對指定看板的標題、內文與標籤；目前只提供站內命中提示。</p></div>
          <span className="shrink-0 text-xs text-slate-400">{subscriptions.length} / {subscriptionLimits.total}</span>
        </div>
        {grouped.length === 0 ? (
          <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-500 dark:border-slate-700" data-testid="subscription-empty">還沒有任何關鍵字訂閱。<br /><Link to="/boards" className="mt-2 inline-block font-semibold text-emerald-700 hover:underline dark:text-emerald-300">先去探索看板 →</Link></div>
        ) : grouped.map(board => (
          <div key={board} className="mt-5">
            <div className="mb-2 flex items-center justify-between"><Link to={'/board/' + board} className="font-semibold hover:underline">{board}</Link><span className="text-xs text-slate-400">{subscriptions.filter(item => item.board === board).length} / {subscriptionLimits.perBoard}</span></div>
            <div className="space-y-2">
              {subscriptions.filter(item => item.board === board).map(item => <div key={item.id} className={item.enabled ? 'flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800' : 'flex items-center gap-3 rounded-xl bg-slate-50 p-3 opacity-60 dark:bg-slate-800'}><span className="min-w-0 flex-1 truncate text-sm font-medium">{item.keyword}</span><button onClick={() => toggleSubscription(item.id)} aria-pressed={item.enabled} className="rounded-lg border border-slate-300 px-2 py-1 text-xs dark:border-slate-600">{item.enabled ? '啟用中' : '已停用'}</button><button onClick={() => removeSubscription(item.id)} className="rounded-lg px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950" data-testid="subscription-remove">刪除</button></div>)}
            </div>
          </div>
        ))}
        <p className="mt-5 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">訂閱保存在 localStorage，不會送出 Web Push；推播權限屬於後續版本。</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900" aria-labelledby="privacy-heading" data-testid="data-privacy">
        <h2 id="privacy-heading" className="text-lg font-semibold">資料與隱私</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">OpenPTT 不蒐集帳號、付款、推播權限；以下按鈕只清掉這個瀏覽器 localStorage 裡的 OpenPTT 資料。</p>
        <ul className="mt-4 space-y-3" role="list">
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" data-testid="privacy-row-favorites">
            <div className="min-w-0">
              <p className="text-sm font-semibold">清除本機收藏</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">目前 {favorites.length} 筆收藏（看板 + 文章）。</p>
            </div>
            <button type="button" onClick={handleClearFavorites} disabled={favorites.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="privacy-clear-favorites">清除收藏</button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" data-testid="privacy-row-subscriptions">
            <div className="min-w-0">
              <p className="text-sm font-semibold">清除本機關鍵字訂閱</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">目前 {subscriptions.length} 筆訂閱。</p>
            </div>
            <button type="button" onClick={handleClearSubscriptions} disabled={subscriptions.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="privacy-clear-subscriptions">清除訂閱</button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" data-testid="privacy-row-recent">
            <div className="min-w-0">
              <p className="text-sm font-semibold">清除最近瀏覽</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">目前 {recent.length} 筆最近閱讀紀錄。</p>
            </div>
            <button type="button" onClick={handleClearRecent} disabled={recent.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="privacy-clear-recent">清除最近瀏覽</button>
          </li>
          <li className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700" data-testid="privacy-row-theme">
            <div className="min-w-0">
              <p className="text-sm font-semibold">重置主題為系統預設</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">目前主題：{theme === 'system' ? '系統' : theme === 'light' ? '淺色' : '深色'}。</p>
            </div>
            <button type="button" onClick={handleResetTheme} disabled={theme === 'system'} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:hover:bg-slate-800" data-testid="privacy-reset-theme">重置主題</button>
          </li>
        </ul>
        {lastCleared && (
          <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300" role="status" aria-live="polite" data-testid="privacy-feedback">已{lastCleared}。</p>
        )}
      </section>
    </div>
  )
}
