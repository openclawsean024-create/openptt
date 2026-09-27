import { useEffect, useState } from 'react'
import { BOARDS, type BoardMeta } from '../data/boards'

const STORAGE_KEY = 'openptt:board-catalog'

function readCachedCatalog(): BoardMeta[] | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? 'null')
    return Array.isArray(parsed) && parsed.length > 0 ? parsed as BoardMeta[] : null
  } catch {
    return null
  }
}

export function useBoardCatalog() {
  const cached = readCachedCatalog()
  const [boards, setBoards] = useState<BoardMeta[]>(cached ?? BOARDS)
  const [catalogReady, setCatalogReady] = useState(Boolean(cached))

  useEffect(() => {
    if (import.meta.env.MODE === 'test') return
    let active = true
    void fetch('/api/ptt/catalog', { headers: { accept: 'application/json' } })
      .then(response => response.ok ? response.json() as Promise<{ boards?: BoardMeta[] }> : Promise.reject(new Error('catalog unavailable')))
      .then(payload => {
        if (!active || !Array.isArray(payload.boards) || payload.boards.length === 0) return
        setBoards(payload.boards)
        setCatalogReady(true)
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.boards))
      })
      .catch(() => undefined)
    return () => { active = false }
  }, [])

  return { boards, catalogReady }
}
