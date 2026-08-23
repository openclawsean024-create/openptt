import { useEffect, useState } from 'react'
import { subscribeFavorites, _readFavorites } from './favorites'
import type { FavoriteItem } from './favorites'

export function useFavorites(): FavoriteItem[] {
  const [items, setItems] = useState<FavoriteItem[]>(() => _readFavorites())
  useEffect(() => {
    return subscribeFavorites(setItems)
  }, [])
  return items
}
