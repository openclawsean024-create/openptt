import { useEffect, useState } from 'react'
import { fetchRemoteArticle } from '../data/remote'
import type { Article } from '../data/boards'

export function useRemoteArticle(board: string, articleId: string | undefined) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(Boolean(articleId && board) && import.meta.env.MODE !== 'test')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!articleId || !board || import.meta.env.MODE === 'test') return
    let active = true
    setLoading(true)
    setError('')
    void fetchRemoteArticle(board, articleId)
      .then(result => { if (active) setArticle(result.article) })
      .catch(cause => { if (active) setError(cause instanceof Error ? cause.message : 'PTT 文章暫時無法取得') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [articleId, board])

  return { article, loading, error }
}
