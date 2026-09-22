import { useEffect, useState } from 'react'
import { getRecent, subscribeRecent } from './recent'
import type { RecentItem } from './recent'

export function useRecent(): RecentItem[] {
  const [items, setItems] = useState<RecentItem[]>(() => getRecent())

  useEffect(() => subscribeRecent(setItems), [])

  return items
}
