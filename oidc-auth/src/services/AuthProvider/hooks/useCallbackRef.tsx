import { useEffect, useRef } from 'react'

export const useCallbackRef = (callback: () => void): { current: () => void } => {
  const ref = useRef(callback)

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return ref
}
