import { useCallback, useEffect, useState } from 'react'
import { fetchBoardPage, type BoardFeedPage } from '../data/remote'

export function useBoardFeed(board: string | undefined, path: string | null) {
  const [data, setData] = useState<BoardFeedPage | null>(null)
  const [loading, setLoading] = useState(Boolean(board))
  const [error, setError] = useState('')

  const load = useCallback(async (refresh = false) => {
    if (!board || import.meta.env.MODE === 'test') return
    setLoading(true)
    setError('')
    try {
      setData(await fetchBoardPage(board, path, refresh))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'PTT 資料暫時無法取得')
    } finally {
      setLoading(false)
    }
  }, [board, path])

  useEffect(() => { void load() }, [load])
  return { data, loading, error, refresh: () => load(true) }
}
