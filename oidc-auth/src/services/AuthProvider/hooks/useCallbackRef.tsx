import { useEffect, useRef } from 'react'

export const useCallbackRef = (callback: (...arg: any[]) => any): { current: (...arg: any[]) => any } => {
  const ref = useRef(callback)

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return ref
}
