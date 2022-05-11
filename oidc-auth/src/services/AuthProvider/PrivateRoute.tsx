import { useEffect, ReactNode } from 'react'

import { useAuthData } from './hooks/useAuthData'

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { isLogged, login, isInitialized, error } = useAuthData()

  useEffect(() => {
    if (!isInitialized || isLogged || error) {
      return
    }

    const path = window?.location?.pathname || '/'
    const search = window?.location?.search || ''
    login(path + search)
  }, [isLogged, isInitialized, login, error])

  if (!isLogged) {
    return null
  }

  return <>{children}</>
}

export default PrivateRoute
