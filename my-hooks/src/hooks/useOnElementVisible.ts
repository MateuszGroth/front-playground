import { RefObject, useEffect } from 'react'

export const useOnElementVisible = (
  target: RefObject<HTMLElement>,
  callback: (isVisible: boolean) => void,
  options?: IntersectionObserverInit
) => {
  useEffect(() => {
    if (!target.current) {
      return
    }

    const observer = new IntersectionObserver((entries) => {
      const { isIntersecting } = entries[0]
      callback(isIntersecting)
    }, options)
    observer.observe(target.current)

    return () => {
      observer.disconnect()
    }
  }, [target, callback, options])
}
