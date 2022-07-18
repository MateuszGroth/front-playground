import { useEffect, ReactNode } from 'react'

import useAuthData from './hooks/useAuthData'

const PrivateRoute = ({ children, ErrorComponent }: { children: ReactNode; ErrorComponent?: ReactNode }) => {
  const { isLoggedIn, login, error, getIsLoggingIn, logout } = useAuthData()

  useEffect(() => {
    if (isLoggedIn || getIsLoggingIn() || error) {
      return
    }

    login()
  }, [isLoggedIn, login, error, getIsLoggingIn])

  if (error) {
    return <>{ErrorComponent ?? <DefaultErrorComponent error={error} logout={logout} />}</>
  }

  if (!isLoggedIn) {
    return null
  }

  return <>{children}</>
}

const DefaultErrorComponent = ({ error, logout }: { error: any; logout: () => void }) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        gap: '1rem',
      }}
    >
      <h2>An Error occured:</h2>
      <p>
        <strong>{JSON.stringify(error)}</strong>
      </p>
      <p>
        <button onClick={() => logout()}>Click here</button> to login again
      </p>
    </div>
  )
}

export default PrivateRoute
