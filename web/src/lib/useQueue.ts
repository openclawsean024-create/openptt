import { useEffect, useState } from 'react'
import { getQueue, subscribeQueue } from './queue'
import type { QueueItem } from './queue'

export function useQueue(): QueueItem[] {
  const [items, setItems] = useState<QueueItem[]>(() => getQueue())
  useEffect(() => subscribeQueue(setItems), [])
  return items
}
