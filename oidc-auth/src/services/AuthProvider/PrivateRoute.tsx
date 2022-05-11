import { useEffect, ReactNode } from 'react'

import { useAuthData } from './hooks/useAuthData'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isLogged, login, isInitialized, error } = useAuthData()

  useEffect(() => {
    if (!isInitialized || isLogged || error) {
      return
    }

    login()
  }, [isLogged, isInitialized, login, error])

  if (!isLogged) {
    return null
  }

  return <>{children}</>
}

export default PrivateRoute
