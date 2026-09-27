import { useEffect, useState } from 'react'
import { fetchSearch, type SearchFeed } from '../data/remote'

export function useArticleSearch(query: string, boards?: string[], limit = 30) {
  const [data, setData] = useState<SearchFeed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const cleanQuery = query.trim()
    if (!cleanQuery || import.meta.env.MODE === 'test') {
      setData(null)
      setLoading(false)
      setError('')
      return
    }
    let active = true
    setLoading(true)
    setError('')
    void fetchSearch({ query: cleanQuery, boards, limit })
      .then(next => { if (active) setData(next) })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : '搜尋暫時無法取得') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [query, boards?.join(','), limit])

  return { data, loading, error }
}
