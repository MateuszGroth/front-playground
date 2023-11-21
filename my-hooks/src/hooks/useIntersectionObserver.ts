import { type RefObject, useEffect, useMemo, useState } from 'react'

export const useIntersectionObserver = (target: RefObject<HTMLElement>, options?: IntersectionObserverInit) => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  const { root, rootMargin, threshold } = options ?? {}
  const memoizedOptions = useMemo(() => {
    return { root, rootMargin, threshold }
  }, [root, rootMargin, threshold])

  useEffect(() => {
    const observedElement = target.current
    if (!observedElement) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, memoizedOptions)

    observer.observe(observedElement)

    return () => {
      observer.disconnect()
    }
  }, [memoizedOptions, target])

  return isIntersecting
}
