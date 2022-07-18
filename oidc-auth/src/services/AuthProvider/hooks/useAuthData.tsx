import { createContext, useContext } from 'react'

type AuthContextData = {
  user?: any
  token?: string
  login: (redirectPath?: string) => void
  logout: () => void
  getIsLoggingIn: () => boolean
  isLoggedIn: boolean
  error?: any
}

export const AuthContext = createContext<AuthContextData>({
  login: () => {},
  logout: () => {},
  getIsLoggingIn: () => false,
  isLoggedIn: false,
})

const useAuthData = () => {
  const context = useContext(AuthContext)

  return context
}

export default useAuthData
