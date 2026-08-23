import { create } from './createStore'

type Theme = 'light' | 'dark' | 'system'

interface ThemeState {
  theme: Theme
  resolved: 'light' | 'dark'
  setTheme: (t: Theme) => void
  init: () => void
}

const STORAGE_KEY = 'openptt:theme'

function applyTheme(resolved: 'light' | 'dark') {
  const root = document.documentElement
  if (resolved === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

function systemPref(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: 'system',
  resolved: 'light',
  setTheme: (t: Theme) => {
    let resolved: 'light' | 'dark' = 'light'
    try {
      localStorage.setItem(STORAGE_KEY, t)
    } catch {
      // private browsing fallback - just continue in memory
    }
    if (t === 'system') resolved = systemPref()
    else resolved = t
    applyTheme(resolved)
    set({ theme: t, resolved })
  },
  init: () => {
    let saved: Theme = 'system'
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw === 'light' || raw === 'dark' || raw === 'system') {
        saved = raw
      }
    } catch {
      // private browsing - fall back to system preference, in-memory only
    }
    const resolved = saved === 'system' ? systemPref() : saved
    applyTheme(resolved)
    set({ theme: saved, resolved })
  },
}))
