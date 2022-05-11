import { useEffect, useState, useMemo, ReactNode, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { SERVICE_STATUS, DEFAULT_STORAGE_NAME, AUTH_STATE_STORAGE_KEY, AUTH_REDIRECT_PATHNAME } from './constant'
import { useTokenExpiredEffect } from './hooks/useTokenExpiredEffect'
import { AuthContext } from './hooks/useAuthData'

type TokenResponse = {
  refresh_token: string
  access_token: string
  expires_in: number
}

type AuthStoredState = {
  redirectUri?: string
  state?: string
}

type AuthStoredData = {
  token: string
  refreshToken: string
  tokenExpiration: number
}

type Props = {
  children: ReactNode
  storageItemName?: string
  authBaseUrl: string
  authClientId: string
}

const AuthProvider = (props: Props) => {
  const navigate = useNavigate()
  const { children, storageItemName = DEFAULT_STORAGE_NAME, authBaseUrl, authClientId } = props
  const [status, setStatus] = useState(SERVICE_STATUS.INITIAL)

  const [isLogged, setIsLogged] = useState<boolean>(false)
  const [token, setToken] = useState<string>()
  const [refreshToken, setRefreshToken] = useState<string>()
  const [tokenExpDateTime, setTokenExpDateTime] = useState<number>()
  const [error, setError] = useState<any>()

  const initialAuthProcess = useCallback(async () => {
    const pathname = window?.location?.pathname
    if (!pathname.startsWith(AUTH_REDIRECT_PATHNAME)) {
      return
    }

    const searchParams = new URLSearchParams(window?.location?.search || '')
    const paramsObj = Object.fromEntries(searchParams.entries())

    const { code, state } = paramsObj
    if (!code || !state) {
      return
    }

    let authStoredState: AuthStoredState | undefined
    try {
      authStoredState = JSON.parse(sessionStorage.getItem(AUTH_STATE_STORAGE_KEY) || '{}')
    } catch (err) {
      sessionStorage.removeItem(AUTH_STATE_STORAGE_KEY)
    }
    if (!authStoredState) {
      return
    }

    const { redirectUri, state: storedState } = authStoredState
    sessionStorage.removeItem(AUTH_STATE_STORAGE_KEY)

    const isAuthStateValid = storedState === state
    if (!isAuthStateValid) {
      return
    }

    const tokenRequestBody = new FormData()
    tokenRequestBody.set('code', code)
    tokenRequestBody.set('grant_type', 'authorization_code')
    tokenRequestBody.set('redirect_uri', `${window.location.origin}${AUTH_REDIRECT_PATHNAME}`)
    tokenRequestBody.set('client_id', authClientId)

    const tokenEndpoint = `${authBaseUrl}/oauth/token`
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: tokenRequestBody,
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch((err) => {
        return { error: err }
      })

    if (!response || response.error) {
      return setError(response?.error || 'AuthProvider: Unknown error')
    }

    const { access_token, expires_in, refresh_token } = response as TokenResponse
    if (!access_token || !expires_in || !refresh_token) {
      return setError('AuthProvider: Invalid token response')
    }

    navigate(redirectUri || '/', { replace: true })

    const tokenExpiration = Date.now() + expires_in * 1000 - 5000 // 5 seconds before token expiration
    setToken(access_token)
    setRefreshToken(refresh_token)
    setTokenExpDateTime(tokenExpiration)

    const authStoredData: AuthStoredData = {
      token: access_token,
      refreshToken: refresh_token,
      tokenExpiration,
    }

    window.localStorage.setItem(storageItemName, JSON.stringify(authStoredData))

    setIsLogged(true)
  }, [])

  useEffect(() => {
    if (status !== SERVICE_STATUS.INITIAL) {
      return
    }

    const callback = async () => {
      setStatus(SERVICE_STATUS.INITIALIZING)
      await initialAuthProcess()
      setStatus(SERVICE_STATUS.INITIALIZED)
    }

    callback()
  }, [status])

  useTokenExpiredEffect(async () => {
    if (!refreshToken) {
      return logout()
    }

    const refreshTokenRequestBody = new FormData()
    refreshTokenRequestBody.set('grant_type', 'refresh_token')
    refreshTokenRequestBody.set('refresh_token', refreshToken)
    refreshTokenRequestBody.set('redirect_uri', `${window.location.origin}${AUTH_REDIRECT_PATHNAME}`)
    refreshTokenRequestBody.set('client_id', authClientId)

    const tokenEndpoint = `${authBaseUrl}/oauth/token`
    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      body: refreshTokenRequestBody,
    })
      .then((res) => (res.ok ? res.json() : null))
      .catch((err) => {
        return { error: err }
      })

    if (!response || response.error) {
      return setError(response?.error || 'AuthProvider: Unknown error')
    }

    const { expires_in, refresh_token } = response as TokenResponse
    if (!expires_in || !refresh_token) {
      return setError('AuthProvider: Invalid token response')
    }

    const tokenExpiration = Date.now() + expires_in * 1000 - 5000 // 5 seconds before token expiration
    setRefreshToken(refresh_token)
    setTokenExpDateTime(tokenExpiration)
  }, tokenExpDateTime)

  const getStoredData = useCallback(() => {
    try {
      const storedData: AuthStoredData = JSON.parse(window.localStorage.getItem(storageItemName) || '{}')
      if (!storedData.token || !storedData.tokenExpiration) {
        return
      }

      return { ...storedData }
    } catch (err) {
      localStorage.removeItem(storageItemName)
    }

    return
  }, [])

  const login = useCallback(
    async (redirectUri: string) => {
      const storedAuthData = getStoredData()
      if (storedAuthData) {
        setIsLogged(true)
        setToken(storedAuthData.token)
        setRefreshToken(storedAuthData.refreshToken)
        setTokenExpDateTime(storedAuthData.tokenExpiration)

        return
      }

      const state = uuidv4()
      try {
        const authStateToStore: AuthStoredState = { state, redirectUri }
        window.sessionStorage.setItem(AUTH_STATE_STORAGE_KEY, JSON.stringify(authStateToStore))
      } catch (err) {}

      const authorizeEndpoint = `${authBaseUrl}/oauth/authorize`
      const oauthQueryParams = new URLSearchParams({
        client_id: authClientId,
        redirect_uri: `${window.location.origin}${AUTH_REDIRECT_PATHNAME}`,
        response_type: 'code',
        scope: 'public',
        state,
      })

      // navigate to authorize endpoint
      window.location.replace(`${authorizeEndpoint}?${oauthQueryParams.toString()}`)
    },
    [getStoredData]
  )

  const logout = useCallback(() => {
    setError(undefined)
    setToken(undefined)
    setIsLogged(false)
    setTokenExpDateTime(undefined)

    window.localStorage.removeItem(storageItemName)
  }, [])

  const authContext = useMemo(() => {
    return {
      error,
      token,
      login,
      logout,
      isLogged,
      isInitialized: status === SERVICE_STATUS.INITIALIZED,
    }
  }, [token, login, logout, isLogged, status, error])

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
}

export default AuthProvider
