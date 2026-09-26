import { useThemeStore } from '../lib/theme'

export default function ThemeToggle({ testId = 'theme-toggle' }: { testId?: string }) {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const label =
    theme === 'light' ? '☀ 淺色' : theme === 'dark' ? '☾ 深色' : '⚙ 系統'

  return (
    <button
      type="button"
      onClick={cycle}
      className="inline-flex h-[38px] items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3 text-[11px] font-bold tracking-[0.06em] text-[var(--muted)] hover:border-[var(--brand)] hover:text-[var(--brand)]"
      aria-label="切換主題"
      data-testid={testId}
    >
      {label}
    </button>
  )
}
