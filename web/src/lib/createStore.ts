// Minimal vanilla store hook (no zustand dep needed for Sprint 1)
import { useState, useEffect } from 'react'

type Listener<T> = (state: T) => void

export function create<T extends object>(initializer: (set: (partial: Partial<T>) => void, get: () => T) => T) {
  let state: T
  const listeners = new Set<Listener<T>>()

  function setState(partial: Partial<T>) {
    state = { ...state, ...partial }
    listeners.forEach((l) => l(state))
  }

  function getState() {
    return state
  }

  state = initializer(setState, getState)

  return function useStore<U>(selector: (state: T) => U = (s) => s as unknown as U): U {
    const [value, setValue] = useState<U>(() => selector(state))
    useEffect(() => {
      const listener = (newState: T) => {
        const newValue = selector(newState)
        setValue((prev) => (Object.is(prev, newValue) ? prev : newValue))
      }
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    }, [])
    return value
  }
}
