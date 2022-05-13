import { useEffect, ReactNode } from 'react'

import { useAuthData } from './hooks/useAuthData'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isLoggedIn, login, error, getIsLoggingIn } = useAuthData()

  useEffect(() => {
    if (isLoggedIn || getIsLoggingIn() || error) {
      return
    }

    login()
  }, [isLoggedIn, login, error, getIsLoggingIn])

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}

export default PrivateRoute
