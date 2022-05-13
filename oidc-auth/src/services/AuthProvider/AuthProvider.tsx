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
  return Date.now() + expiresIn * 1000 - 5000 // 5 seconds before token expiration
}

const AuthProvider = (props: Props) => {
  const navigate = useNavigate()
  const {
    children,
    storageItemName = DEFAULT_STORAGE_NAME,
    authBaseUrl,
    authClientId,
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

  const abortControllerRef = useRef<AbortController>()

  const storeAuthData = useCallback(
    (authStoredData: AuthStoredData) => {
      try {
        localStorage.setItem(storageItemNameRef.current, JSON.stringify(authStoredData))
      } catch (err) {}
    },
    [storageItemNameRef]
  )

  const clearAuthStore = useCallback(() => {
    try {
      localStorage.removeItem(storageItemNameRef.current)
    } catch (err) {}
  }, [storageItemNameRef])

  const initialAuthProcess = useCallback(
    async (abortController: AbortController) => {
      void abortController

      const pathname = window?.location?.pathname
      if (!pathname.startsWith(AUTH_REDIRECT_PATHNAME)) {
        return false
      }

      const searchParams = new URLSearchParams(window?.location?.search || '')
      const paramsObj = Object.fromEntries(searchParams.entries())

      const { code, state } = paramsObj
      if (!code || !state) {
        return false
      }

      let authStoredState: AuthStoredState | undefined
      try {
        authStoredState = JSON.parse(window?.sessionStorage?.getItem(AUTH_STATE_STORAGE_KEY) || '{}')
      } catch (err) {}

      if (!authStoredState) {
        return false
      }

      const { redirectUri, state: storedState } = authStoredState
      const isAuthStateValid = storedState === state

      if (!isAuthStateValid) {
        return false
      }

      window?.sessionStorage?.removeItem?.(AUTH_STATE_STORAGE_KEY)
      const response = await getTokenData(authBaseUrlRef.current, authClientIdRef.current, code)

      if (!response || response.error) {
        setError(response?.error || 'AuthProvider: Unknown error')
        return false
      }

      const { access_token, expires_in, refresh_token } = response as TokenResponse
      if (!access_token || !expires_in || !refresh_token) {
        setError('AuthProvider: Invalid token response')
        return false
      }
      navigate(redirectUri || '/', { replace: true })

      const tokenExpiration = getTokenExpiration(expires_in)
      setToken(access_token)
      setRefreshToken(refresh_token)
      setTokenExpDateTime(tokenExpiration)

      return true
    },
    [authBaseUrlRef, authClientIdRef, navigate]
  )

  useEffect(() => {
    if (error) console.warn(error)
  }, [error])

  useEffect(
    () => () => {
      if (abortControllerRef.current) {
        abortControllerRef.current?.abort?.()
      }
    },
    []
  )

  useEffect(() => {
    if (status !== SERVICE_STATUS.INITIALIZING) {
      return
    }

    abortControllerRef.current = new AbortController()
    const callback = async () => {
      await initialAuthProcess(abortControllerRef.current as AbortController)
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
      return setError(response?.error || 'AuthProvider: Unknown error')
    }

    const { expires_in, refresh_token } = response as TokenResponse
    if (!expires_in || !refresh_token) {
      return setError('AuthProvider: Invalid token response')
    }

    const tokenExpiration = getTokenExpiration(expires_in)
    setRefreshToken(refresh_token)
    setTokenExpDateTime(tokenExpiration)
  }, tokenExpDateTime)

  const getStoredData = useCallback(() => {
    try {
      const storedData: AuthStoredData = JSON.parse(localStorage.getItem(storageItemNameRef.current) || '{}')
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

  // login function might be called twice at the same time so we need to make sure we dont redirect twice
  const isLoggingRef = useRef(false)
  const login = useCallback(
    (from?: string) => {
      if (isLoggingRef.current) {
        return
      }

      const storedAuthData = getStoredData()
      if (storedAuthData) {
        setToken(storedAuthData.token)
        setRefreshToken(storedAuthData.refreshToken)
        setTokenExpDateTime(storedAuthData.tokenExpiration)

        return
      }

      isLoggingRef.current = true
      let currentUri = from
      if (currentUri == null) {
        const path = window?.location?.pathname || '/'
        const search = window?.location?.search || ''
        currentUri = path + search
      }
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
    [getStoredData, authBaseUrlRef, authClientIdRef]
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
