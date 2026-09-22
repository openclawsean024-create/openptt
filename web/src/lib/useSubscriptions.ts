import { useEffect, useState } from 'react'
import { getSubscriptions, subscribeSubscriptions } from './subscriptions'
import type { KeywordSubscription } from './subscriptions'

export function useSubscriptions(): KeywordSubscription[] {
  const [items, setItems] = useState<KeywordSubscription[]>(() => getSubscriptions())

  useEffect(() => subscribeSubscriptions(setItems), [])

  return items
}
