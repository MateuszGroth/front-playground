import { createContext, useContext } from 'react'

type AuthContextData = {
  user?: any
  token?: string
  login: (redirectUri?: string) => void
  logout: () => void
  isLogged: boolean
  isInitialized: boolean
  error?: any
}

export const AuthContext = createContext<AuthContextData>({
  login: () => {},
  logout: () => {},
  isLogged: false,
  isInitialized: false,
})

export const useAuthData = () => {
  const context = useContext(AuthContext)

  return context
}
