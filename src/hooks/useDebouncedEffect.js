import { useEffect } from 'react'

export function useDebouncedEffect(effect, deps, delay) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      effect()
    }, delay)

    return () => clearTimeout(timeout)
  }, deps)
}
