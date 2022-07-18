import { useState, useEffect, RefObject } from 'react'

interface TDimensions {
  width: number
  height: number
  top: number
  left: number
}

const useResizeObserver = (ref: RefObject<HTMLElement>): TDimensions | undefined => {
  const [dimensions, setDimensions] = useState<TDimensions>()

  useEffect(() => {
    const referenceNode = ref.current
    if (!referenceNode) {
      return
    }

    const resizeObserver = new ResizeObserver((entries) => {
      setDimensions(entries[0].contentRect)
    })

    resizeObserver.observe(referenceNode)

    return () => {
      if (!referenceNode) {
        return
      }
      resizeObserver.unobserve(referenceNode)
    }
  }, [ref])

  return dimensions
}

export default useResizeObserver
