import { useEffect, useState, useMemo, ReactNode, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

import { SERVICE_STATUS, DEFAULT_STORAGE_NAME, AUTH_STATE_STORAGE_KEY, AUTH_REDIRECT_PATHNAME } from './constant'
import { getTokenData, refreshCurrentToken } from './api'
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
  storageType?: 'local' | 'session'
  storageItemName?: string
  authBaseUrl: string
  authClientId: string
  LoadingComponent?: ReactNode
}

const getInitialStatus = () => {
  // if the pathname is ${AUTH_REDIRECT_PATHNAME} we are supposed to receive a code needed to get a token
  const pathname = window?.location?.pathname

  return pathname.startsWith(AUTH_REDIRECT_PATHNAME) ? SERVICE_STATUS.INITIALIZING : SERVICE_STATUS.INITIALIZED
}

const getTokenExpiration = (expiresIn: number): number => {
  // expiresIn is the time in seconds until the token expires
  return Date.now() + expiresIn * 1000 - 3000 // 3 seconds before token expiration
}

let isFetchingToken = false

const AuthProvider = (props: Props) => {
  const navigate = useNavigate()
  const {
    children,
    storageItemName = DEFAULT_STORAGE_NAME,
    authBaseUrl,
    authClientId,
    storageType = 'local',
    LoadingComponent = 'Loading...',
  } = props

  const [error, setError] = useState<any>()
  const [status, setStatus] = useState(getInitialStatus)

  const [token, setToken] = useState<string>()
  const [refreshToken, setRefreshToken] = useState<string>()
  const [tokenExpDateTime, setTokenExpDateTime] = useState<number>()

  const authBaseUrlRef = useRef(authBaseUrl)
  const authClientIdRef = useRef(authClientId)
  const storageItemNameRef = useRef(storageItemName)
  const storageRef = useRef(storageType === 'session' ? sessionStorage : localStorage)

  const storeAuthData = useCallback(
    (authStoredData: AuthStoredData) => {
      try {
        storageRef.current.setItem(storageItemNameRef.current, JSON.stringify(authStoredData))
      } catch (err) {}
    },
    [storageItemNameRef, storageRef]
  )

  const clearAuthStore = useCallback(() => {
    try {
      storageRef.current.removeItem(storageItemNameRef.current)
    } catch (err) {}
  }, [storageItemNameRef])

  const getStoredAuthData = useCallback(() => {
    try {
      const storedData: AuthStoredData = JSON.parse(storageRef.current.getItem(storageItemNameRef.current) || '{}')
      const isInvalidTokenData = !storedData.token || !storedData.tokenExpiration
      const isExpiredToken = new Date(storedData.tokenExpiration).getTime() < Date.now()
      if (isInvalidTokenData || isExpiredToken) {
        clearAuthStore()
        return
      }

      return { ...storedData }
    } catch (err) {
      clearAuthStore()
    }

    return
  }, [clearAuthStore])

  const setStoredAuthData = useCallback((storedAuthData: AuthStoredData) => {
    setToken(storedAuthData.token)
    setRefreshToken(storedAuthData.refreshToken)
    setTokenExpDateTime(storedAuthData.tokenExpiration)
  }, [])

  const initialAuthProcess = useCallback(async (): Promise<boolean> => {
    if (isFetchingToken) {
      // token is being fetched, wait for it to finish
      return false
    }

    const pathname = window?.location?.pathname
    if (!pathname.startsWith(AUTH_REDIRECT_PATHNAME)) {
      return true
    }

    let authStoredState: AuthStoredState | undefined
    try {
      authStoredState = JSON.parse(window?.sessionStorage?.getItem(AUTH_STATE_STORAGE_KEY) || '{}')
    } catch (err) {}

    if (!authStoredState) {
      // no auth stored state - naviagate away from the auth page
      navigate('/', { replace: true })
      return true
    }

    const { redirectUri, state: storedState } = authStoredState
    const storedAuthData = getStoredAuthData()
    if (storedAuthData) {
      // use stored auth data, no need to fetch a new token
      navigate(redirectUri || '/', { replace: true })
      setStoredAuthData(storedAuthData)
      return true
    }

    const searchParams = new URLSearchParams(window?.location?.search || '')
    const paramsObj = Object.fromEntries(searchParams.entries())

    const { code, state } = paramsObj
    const isAuthStateValid = storedState === state
    if (!code || !state || !isAuthStateValid) {
      // invalid code or state - naviagate away to the redirect Uri
      navigate(redirectUri || '/', { replace: true })
      return true
    }

    isFetchingToken = true
    window?.sessionStorage?.removeItem?.(AUTH_STATE_STORAGE_KEY)
    const response = await getTokenData(authBaseUrlRef.current, authClientIdRef.current, code)
    isFetchingToken = false
    if (!response || response.error) {
      navigate(redirectUri || '/', { replace: true })
      setError(response?.error || 'AuthProvider: Unknown error')
      return true
    }

    const { access_token, expires_in, refresh_token } = response as TokenResponse
    if (!access_token || !expires_in || !refresh_token) {
      navigate(redirectUri || '/', { replace: true })
      setError('AuthProvider: Invalid token response')
      return true
    }

    navigate(redirectUri || '/', { replace: true })

    const tokenExpiration = getTokenExpiration(expires_in)
    setToken(access_token)
    setRefreshToken(refresh_token)
    setTokenExpDateTime(tokenExpiration)

    return true
  }, [authBaseUrlRef, authClientIdRef, setStoredAuthData, getStoredAuthData, navigate])

  useEffect(() => {
    if (error) console.warn(error)
  }, [error])

  useEffect(() => {
    if (status !== SERVICE_STATUS.INITIALIZING) {
      return
    }

    const callback = async () => {
      const isInitialized = await initialAuthProcess()
      if (!isInitialized) {
        return
      }

      setStatus(SERVICE_STATUS.INITIALIZED)
    }

    callback()
  }, [status, initialAuthProcess])

  useEffect(() => {
    const isValidToken = token && tokenExpDateTime && tokenExpDateTime > Date.now()
    const isValidRefreshToken = !!refreshToken
    if (!isValidToken || !isValidRefreshToken) {
      return
    }

    const authStoredData: AuthStoredData = {
      token,
      refreshToken,
      tokenExpiration: tokenExpDateTime,
    }
    storeAuthData(authStoredData)
  }, [token, refreshToken, tokenExpDateTime, storeAuthData])

  useTokenExpiredEffect(async () => {
    if (!refreshToken) {
      return logout()
    }

    const response = await refreshCurrentToken(authBaseUrl, authClientId, refreshToken)
    if (!response || response.error) {
      return setError(response?.error || 'AuthProvider: Refresh token unknown error')
    }

    const { expires_in, refresh_token, access_token } = response as TokenResponse
    if (!expires_in || !refresh_token || !access_token) {
      return setError('AuthProvider: Invalid refresh token response')
    }

    const tokenExpiration = getTokenExpiration(expires_in)
    setToken(access_token)
    setRefreshToken(refresh_token)
    setTokenExpDateTime(tokenExpiration)
  }, tokenExpDateTime)

  // login function might be called twice at the same time so we need to make sure we dont redirect twice
  const isLoggingRef = useRef(false)
  const login = useCallback(
    (from?: string) => {
      if (!authBaseUrlRef.current) {
        setError('AuthProvider: authBaseUrl is not set')
        return
      }

      if (isLoggingRef.current) {
        return
      }

      const storedAuthData = getStoredAuthData()
      if (storedAuthData) {
        setStoredAuthData(storedAuthData)
        return
      }

      isLoggingRef.current = true
      let currentUri = from
      if (currentUri == null) {
        const path = window?.location?.pathname || '/'
        const search = window?.location?.search || ''
        currentUri = path + search
      }
      // handle case when react app has been mounted, unmounted then mounted again instatly...
      // we need to make sure we dont redirect twice
      if (currentUri.startsWith(AUTH_REDIRECT_PATHNAME)) {
        return
      }

      const state = uuidv4()
      try {
        const authStateToStore: AuthStoredState = { state, redirectUri: currentUri }
        window?.sessionStorage?.setItem?.(AUTH_STATE_STORAGE_KEY, JSON.stringify(authStateToStore))
      } catch (err) {}

      const authorizeEndpoint = `${authBaseUrlRef.current}/oauth/authorize`
      const oauthQueryParams = new URLSearchParams({
        client_id: authClientIdRef.current,
        redirect_uri: `${window?.location?.origin}${AUTH_REDIRECT_PATHNAME}`,
        response_type: 'code',
        scope: 'public',
        state,
      })

      // navigate to authorize endpoint
      window?.location?.replace?.(`${authorizeEndpoint}?${oauthQueryParams.toString()}`)
    },
    [getStoredAuthData, setStoredAuthData, authBaseUrlRef, authClientIdRef]
  )

  const logout = useCallback(() => {
    clearAuthStore()

    setError(undefined)
    setToken(undefined)
    setRefreshToken(undefined)
    setTokenExpDateTime(undefined)
  }, [clearAuthStore])

  const getIsLoggingIn = useCallback(() => isLoggingRef.current, [isLoggingRef])

  const authContext = useMemo(() => {
    return {
      error,
      token,
      login,
      logout,
      isLoggedIn: !!token,
      getIsLoggingIn,
    }
  }, [token, login, logout, error, getIsLoggingIn])

  if (status === SERVICE_STATUS.INITIALIZING) {
    return <>{LoadingComponent}</>
  }

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
}

export default AuthProvider
