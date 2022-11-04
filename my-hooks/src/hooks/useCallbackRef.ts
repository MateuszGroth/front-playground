import { useEffect, useRef } from 'react'

const useCallbackRef = <T>(callback: T): { current: T } => {
  const ref = useRef(callback)

  useEffect(() => {
    ref.current = callback
  }, [callback])

  return ref
}

export default useCallbackRef
