import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

interface NavItem {
  to: string
  label: string
  icon: string
  end?: boolean
}

const primaryItems: NavItem[] = [
  { to: '/', label: '閱讀桌', icon: '⌂', end: true },
  { to: '/boards', label: '看板', icon: '▤', end: true },
  { to: '/hot', label: '熱門', icon: '↗', end: true },
  { to: '/fav', label: '收藏', icon: '☆', end: true },
  { to: '/queue', label: '佇列', icon: '▱', end: true },
]

const secondaryItems: NavItem[] = [
  { to: '/live-hot', label: '即時熱門', icon: '🔥' },
  { to: '/history', label: '閱讀歷史', icon: '≡' },
  { to: '/board-history', label: '看板歷史', icon: '▤' },
  { to: '/article-favorites', label: '文章收藏', icon: '▣' },
  { to: '/settings', label: '設定', icon: '⚙' },
  { to: '/about', label: '關於', icon: 'ⓘ' },
]

function primaryLinkClass(isActive: boolean) {
  return [
    'relative inline-flex items-center py-[22px] text-[12px] font-extrabold tracking-[0.06em]',
    isActive
      ? 'text-[var(--ink)]'
      : 'text-[var(--muted)] hover:text-[var(--ink)]',
  ].join(' ')
}

function bottomLinkClass(isActive: boolean) {
  return [
    'flex flex-col items-center justify-center gap-[2px] py-[6px] text-[9px] font-extrabold',
    isActive
      ? 'text-[var(--brand)]'
      : 'text-[var(--faint)] hover:text-[var(--ink)]',
  ].join(' ')
}

function drawerLinkClass(isActive: boolean) {
  return [
    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-bold transition',
    isActive
      ? 'bg-[var(--brand-soft)] text-[var(--brand)]'
      : 'text-[var(--muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--ink)]',
  ].join(' ')
}

function MobileDrawer({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--faint)]">主要功能</p>
        <nav className="space-y-1" aria-label="主要功能">
          {primaryItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onNavigate}
              className={({ isActive }) => drawerLinkClass(isActive)}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <div>
        <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--faint)]">其他入口</p>
        <nav className="space-y-1" aria-label="其他入口">
          {secondaryItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={({ isActive }) => drawerLinkClass(isActive)}
            >
              <span className="w-5 text-center text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setDrawerOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!drawerOpen) return
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawerOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [drawerOpen])

  useEffect(() => {
    if (!drawerOpen) return
    triggerRef.current?.focus()
  }, [drawerOpen])

  const onDrawerNavigate = () => setDrawerOpen(false)

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header
        className="sticky top-0 z-20 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--canvas)_92%,transparent)] backdrop-blur-md"
      >
        <div className="mx-auto flex w-full max-w-[1320px] min-h-[72px] items-center gap-9 px-7">
          <button
            ref={triggerRef}
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="grid h-[37px] w-[37px] place-items-center rounded-md border border-[var(--line)] bg-[var(--surface)] text-base text-[var(--muted)] hover:text-[var(--ink)] lg:hidden"
            aria-label="開啟選單"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            ☰
          </button>
          <Link to="/" className="flex items-center gap-2.5" aria-label="OpenPTT 首頁">
            <span
              aria-hidden="true"
              className="grid h-[31px] w-[31px] place-items-center rounded-full border-2 border-[var(--brand)] text-[17px] font-extrabold leading-none text-[var(--brand)]"
              style={{ transform: 'rotate(-8deg)' }}
            >)(</span>
            <span className="flex flex-col leading-none">
              <strong className="text-[16px] font-black tracking-[-0.055em] text-[var(--ink)]">OpenPTT</strong>
              <small className="mt-[1px] hidden text-[9px] font-extrabold uppercase tracking-[0.18em] text-[var(--faint)] sm:block">
                Reading desk
              </small>
            </span>
          </Link>
          <nav className="hidden flex-1 items-center gap-[22px] lg:flex" aria-label="主導覽">
            {primaryItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => primaryLinkClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive && <span aria-hidden="true" className="absolute inset-x-0 bottom-[-1px] h-[3px] bg-[var(--brand)]" />}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1320px] flex-1 px-7 pb-24 pt-16 lg:pb-16">{children}</main>

      <footer className="mx-auto mt-16 flex w-full max-w-[1320px] flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-7 py-4 text-[10px] text-[var(--faint)]">
        <span>OpenPTT · reading-first, guest-first.</span>
        <span>示範資料 · 偏好只儲存在這個瀏覽器</span>
      </footer>

      <nav
        className="fixed inset-x-0 bottom-0 z-10 grid grid-cols-5 border-t border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_95%,transparent)] px-1.5 py-1.5 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: 'max(7px, env(safe-area-inset-bottom))' }}
        aria-label="主要導覽"
      >
        {primaryItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => bottomLinkClass(isActive)}>
            <span aria-hidden="true" className="text-[17px]">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {drawerOpen && (
        <div className="fixed inset-0 z-30 bg-[rgba(14,18,28,0.42)] lg:hidden" role="presentation" onClick={() => setDrawerOpen(false)}>
          <aside
            id="mobile-drawer"
            className="absolute inset-y-4 right-4 left-4 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-label="功能選單"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--brand)]">OpenPTT</p>
                <h2 className="mt-1 text-lg font-bold tracking-[-0.02em]">功能選單</h2>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-md bg-[var(--surface-soft)] text-lg text-[var(--muted)]"
                aria-label="關閉功能選單"
              >
                ×
              </button>
            </div>
            <MobileDrawer onNavigate={onDrawerNavigate} />
            <p className="mt-6 border-t border-[var(--line)] pt-4 text-[10px] text-[var(--faint)]">
              保留閱讀與探索核心；帳號切換、私人信件、發文互動、推播與付款尚未納入 MVP。
            </p>
          </aside>
        </div>
      )}
    </div>
  )
}
