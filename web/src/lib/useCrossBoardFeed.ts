import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchCrossBoardFeed, type CrossBoardFeed } from '../data/remote'

export interface UseCrossBoardFeedOptions {
  boards?: string[]
  limit?: number
  enabled?: boolean
}

export interface CrossBoardFeedState {
  data: CrossBoardFeed | null
  loading: boolean
  error: string
  refresh: () => Promise<void>
}

export function useCrossBoardFeed({ boards, limit, enabled = true }: UseCrossBoardFeedOptions = {}): CrossBoardFeedState {
  const [data, setData] = useState<CrossBoardFeed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [refreshTick, setRefreshTick] = useState(0)
  const requestId = useRef(0)

  const refresh = useCallback(async () => {
    setRefreshTick(value => value + 1)
  }, [])

  const load = useCallback(async (refresh = false) => {
    if (!enabled || import.meta.env.MODE === 'test') return
    const currentRequest = ++requestId.current
    setLoading(true)
    setError('')
    try {
      const nextData = await fetchCrossBoardFeed({ boards, limit, refresh })
      if (currentRequest === requestId.current) setData(nextData)
    } catch (cause) {
      if (currentRequest === requestId.current) setError(cause instanceof Error ? cause.message : 'PTT 跨板聚合暫時無法取得')
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [boards?.join(','), limit, enabled])

  useEffect(() => {
    void load(refreshTick > 0)
  }, [load, refreshTick])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
