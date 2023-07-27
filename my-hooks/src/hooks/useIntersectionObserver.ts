import { RefObject, useEffect, useState } from 'react'

const useIntersectionObserver = <TRef extends RefObject<HTMLElement>>(
  ref: TRef,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const observedElement = ref.current
    if (!observedElement) {
      return
    }

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(observedElement)

    return () => {
      observer.disconnect()
    }
  }, [])

  return isIntersecting
}
