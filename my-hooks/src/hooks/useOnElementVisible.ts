import type { RefObject } from 'react'
import { useMemo } from 'react'
import { useEffect } from 'react'
import useCallbackRef from './useCallbackRef'

//trigger callback if element is visible in the viewport
export const useOnElementVisible = (
  target: RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) => {
  const { root, rootMargin, threshold } = options ?? {}
  const callbackRef = useCallbackRef(callback)

  const memoizedOptions = useMemo(() => {
    return { root, rootMargin, threshold }
  }, [root, rootMargin, threshold])

  useEffect(() => {
    if (target?.current) {
      const observer = new IntersectionObserver((entries) => {
        const { isIntersecting } = entries[0]
        callbackRef.current(isIntersecting)
      }, memoizedOptions)
      observer.observe(target.current)
      return () => {
        observer.disconnect()
      }
    }
  }, [target, callbackRef, memoizedOptions])
}
