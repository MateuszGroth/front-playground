import { useEffect } from 'react'

import { useCallbackRef } from './useCallbackRef'

export const useTokenExpiredEffect = (callback: () => void, tokenExpDateTime: number | undefined) => {
  const callbackRef = useCallbackRef(callback)

  useEffect(() => {
    if (!tokenExpDateTime) {
      return
    }

    const currentTime = new Date().getTime()
    const expiresIn = tokenExpDateTime - currentTime
    if (expiresIn < 0) {
      callbackRef.current()
      return
    }

    const timeout = setTimeout(() => {
      callbackRef.current()
    }, expiresIn)

    return () => {
      clearTimeout(timeout)
    }
  }, [tokenExpDateTime, callbackRef])
}
