import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchBoardPage, type BoardFeedPage } from '../data/remote'

export function useBoardFeed(board: string | undefined, path: string | null) {
  const [data, setData] = useState<BoardFeedPage | null>(null)
  const [loading, setLoading] = useState(Boolean(board) && import.meta.env.MODE !== 'test')
  const [error, setError] = useState('')
  const requestId = useRef(0)

  const load = useCallback(async (refresh = false) => {
    if (!board || import.meta.env.MODE === 'test') return
    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const nextData = await fetchBoardPage(board, path, refresh)
      if (currentRequest === requestId.current) setData(nextData)
    } catch (cause) {
      if (currentRequest === requestId.current) setError(cause instanceof Error ? cause.message : 'PTT 資料暫時無法取得')
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [board, path])

  useEffect(() => { void load() }, [load])
  return { data, loading, error, refresh: () => load(true) }
}
