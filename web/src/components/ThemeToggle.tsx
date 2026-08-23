import { useThemeStore } from '../lib/theme'

export default function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const cycle = () => {
    const next = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light'
    setTheme(next)
  }

  const label =
    theme === 'light' ? '☀ 淺色' : theme === 'dark' ? '🌙 深色' : '⚙ 系統'

  return (
    <button
      onClick={cycle}
      className="px-2 py-1 rounded border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm"
      data-testid="theme-toggle"
    >
      {label}
    </button>
  )
}
