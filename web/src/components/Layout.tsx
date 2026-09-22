import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const mainItems = [
  { to: '/', label: '首頁', icon: '⌂', end: true },
  { to: '/boards', label: '看板列表', icon: '▤', end: true },
  { to: '/hot', label: '熱門文章', icon: 'ϟ', end: true },
  { to: '/fav', label: '我的收藏', icon: '☆', end: true },
]

const featureItems = [
  { to: '/live-hot', label: '即時熱門', icon: '🔥' },
  { to: '/groups', label: '分組討論', icon: '▦' },
  { to: '/board-history', label: '看板歷史', icon: '▤' },
]
const historyItems = [
  { to: '/history', label: '閱讀歷史', icon: '≡' },
  { to: '/push-history', label: '推文歷史', icon: '▰' },
  { to: '/article-favorites', label: '文章收藏', icon: '▣' },
  { to: '/image-history', label: '圖片上傳紀錄', icon: '▧' },
]
const systemItems = [
  { to: '/settings', label: '設定', icon: '⚙' },
  { to: '/donate', label: '贊助', icon: '♡' },
  { to: '/about', label: '關於', icon: 'ⓘ' },
]

function itemClass(isActive: boolean) {
  return 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ' + (isActive
    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100')
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">瀏覽</p>
        <nav className="space-y-1" aria-label="瀏覽">
          {mainItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">主要功能</p>
        <nav className="space-y-1" aria-label="主要功能">
          {featureItems.map(item => <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">歷史</p>
        <nav className="space-y-1" aria-label="歷史">
          {historyItems.map(item => <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
      <div>
        <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">系統</p>
        <nav className="space-y-1" aria-label="系統">
          {systemItems.map(item => <NavLink key={item.to} to={item.to} onClick={onNavigate} className={({ isActive }) => itemClass(isActive)}><span className="w-5 text-center text-base">{item.icon}</span>{item.label}</NavLink>)}
        </nav>
      </div>
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => setMenuOpen(false), [location.pathname])

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 overflow-y-auto border-r border-slate-200 bg-white px-4 py-6 dark:border-slate-800 dark:bg-slate-900 lg:block">
        <Link to="/" className="mb-8 flex items-center gap-3 px-3" aria-label="回到 OpenPTT 首頁">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500 text-lg font-black text-white">O</span>
          <span><strong className="block tracking-tight">OpenPTT</strong><small className="text-[11px] text-slate-400">閱讀模式 · Web</small></span>
        </Link>
        <Navigation />
        <div className="mt-8 border-t border-slate-200 px-3 pt-4 text-[11px] text-slate-400 dark:border-slate-800"><strong className="mb-1 block text-slate-500 dark:text-slate-300">示範資料</strong>內容為 mock，僅用於 UI flow 與閱讀體驗驗證。</div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90 sm:px-8">
          <div className="hidden text-sm text-slate-500 dark:text-slate-400 sm:block"><strong className="text-slate-800 dark:text-slate-100">OpenPTT</strong>　/　{location.pathname === '/' ? '首頁' : location.pathname.startsWith('/board/') ? '看板閱讀' : location.pathname.startsWith('/article/') ? '文章閱讀' : '閱讀空間'}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMenuOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 text-lg lg:hidden dark:border-slate-700" aria-label="開啟功能選單" aria-expanded={menuOpen}>☰</button>
            <span className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 sm:inline-flex"><i className="h-2 w-2 rounded-full bg-emerald-500" />訪客閱讀模式</span>
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-128px)] w-full max-w-6xl px-4 py-7 pb-24 sm:px-8 lg:py-10">{children}</main>
        <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400 dark:border-slate-800">OpenPTT · mock data only · local reading preferences</footer>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-4 border-t border-slate-200 bg-white/95 px-2 py-2 backdrop-blur lg:hidden dark:border-slate-800 dark:bg-slate-900/95" aria-label="主要導覽">
        {mainItems.map(item => <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => 'grid place-items-center gap-0.5 rounded-lg py-1 text-[10px] ' + (isActive ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}><span className="text-base">{item.icon}</span><span>{item.label === '看板列表' ? '看板' : item.label.replace('我的', '')}</span></NavLink>)}
      </nav>

      {menuOpen && <div className="fixed inset-0 z-30 bg-slate-950/40 lg:hidden" role="presentation" onClick={() => setMenuOpen(false)}>
        <div className="absolute inset-x-4 top-4 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900" role="dialog" aria-modal="true" aria-label="功能選單" onClick={event => event.stopPropagation()}>
          <div className="mb-5 flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[0.16em] text-emerald-700 dark:text-emerald-300">OPENPTT MENU</p><h2 className="mt-1 text-xl font-bold">功能選單</h2></div><button onClick={() => setMenuOpen(false)} className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-lg dark:bg-slate-800" aria-label="關閉功能選單">×</button></div>
          <Navigation onNavigate={() => setMenuOpen(false)} />
          <p className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">保留閱讀與探索核心；帳號切換、私人信件、發文互動與付款尚未納入。</p>
        </div>
      </div>}
    </div>
  )
}
