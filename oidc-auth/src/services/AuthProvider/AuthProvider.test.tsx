import { screen, waitFor, render } from '@testing-library/react'
// import fetchMock from 'jest-fetch-mock'

// import { render } from 'helpers/testRender.test'

import { AUTH_REDIRECT_PATHNAME, AUTH_STATE_STORAGE_KEY } from './constant'
import AuthProvider from './AuthProvider'
import PrivateRoute from './PrivateRoute'

const fetchMock = jest.fn() as any
const mockNavigate = jest.fn()
const mockReplace = jest.fn()
const mockSessionStorageSet = jest.fn()
const mockLocalStorageSet = jest.fn()
const mockSessionStorageRemove = jest.fn()
const mockLocalStorageRemove = jest.fn()

jest.mock('react-router-dom', () => {
  const actualRouter = jest.requireActual('react-router-dom')
  return {
    ...actualRouter,
    __esModule: true,
    useNavigate: () => mockNavigate,
  }
})
jest.mock('uuid', () => {
  return {
    __esModule: true,
    v4: () => 'state',
  }
})
const testAuthBaseUrl = 'http://podato.com/test-auth'
const testAuthClientId = 'testId'
const testStorageItemName = 'test'
const props = {
  storageItemName: testStorageItemName,
  authBaseUrl: testAuthBaseUrl,
  authClientId: testAuthClientId,
}

const authorizeEndpoint = `${testAuthBaseUrl}/oauth/authorize`
const testOauthQueryParams = {
  client_id: testAuthClientId,
  redirect_uri: `http://podato.com${AUTH_REDIRECT_PATHNAME}`,
  response_type: 'code',
  scope: 'public',
  state: 'state',
}
const testOauthQuerySearch = new URLSearchParams({ ...testOauthQueryParams }).toString()

const tokenEndpoint = `${testAuthBaseUrl}/oauth/token`

const mockTokenRequest = jest.fn()

const setupTokenRequest = (response?: any) => {
  const tokenRequestMock = async (req: any) => {
    mockTokenRequest(req)
    return JSON.stringify(
      response ?? {
        access_token: 'token',
        refresh_token: 'refreshToken',
        expires_in: 60,
      }
    )
  }
  fetchMock.mockResponse((req: any) => {
    if (req.url.includes('/test-auth/oauth/token')) {
      return tokenRequestMock(req)
    }

    return Promise.reject(new Error('bad url'))
  })
}

describe('AuthProvider', () => {
  beforeEach(() => {
    delete (global.window as any).location
    delete (global.window as any).sessionStorage
    delete (global.window as any).localStorage
    window.location = new URL('http://podato.com/') as any
    window.localStorage = {} as any
    window.sessionStorage = {} as any
    window.location.replace = mockReplace
    window.localStorage.setItem = mockLocalStorageSet
    window.localStorage.removeItem = mockLocalStorageRemove
    window.sessionStorage.setItem = mockSessionStorageSet
    window.sessionStorage.removeItem = mockSessionStorageRemove
  })
  it('should render correctly', () => {
    render(<AuthProvider {...props}>Test Auth Provider</AuthProvider>)
    screen.getByText('Test Auth Provider')
  })
  it('should not attempt to login without accessing PrivateRoute', () => {
    render(<AuthProvider {...props}>Test Auth Provider</AuthProvider>)
    expect(mockReplace).toBeCalledTimes(0)
  })

  describe('Initial Login Process', () => {
    it('should attempt to login when PrivateRoute is rendered and no credentials are stored', () => {
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(mockReplace).toBeCalledTimes(1)
      expect(mockReplace).toBeCalledWith(authorizeEndpoint + '?' + testOauthQuerySearch)
    })
    it('should store state and redirect Uri when PrivateRoute is rendered and no credentials are stored', () => {
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(mockSessionStorageSet).toBeCalledTimes(1)
      expect(mockSessionStorageSet).toBeCalledWith(
        AUTH_STATE_STORAGE_KEY,
        JSON.stringify({ state: 'state', redirectUri: '/' })
      )
    })
    it('should store correct redirect Uri when PrivateRoute is rendered and no credentials are stored', () => {
      window.location = new URL('http://podato.com/test-location?test=true') as any
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(mockSessionStorageSet).toBeCalledTimes(1)
      expect(mockSessionStorageSet).toBeCalledWith(
        AUTH_STATE_STORAGE_KEY,
        JSON.stringify({ state: 'state', redirectUri: '/test-location?test=true' })
      )
    })
    it('should use attempt to use stored credentials when PrivateRoute is rendered', () => {
      const getMock = jest.fn()
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
    })
    it('should use valid stored credentials when PrivateRoute is rendered and not try to login', () => {
      const validStoredTokenData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        tokenExpiration: Date.now() + 60 * 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(validStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
      expect(mockSessionStorageSet).toBeCalledTimes(0)
    })
    it('should use stored credentials without refresh token when PrivateRoute is rendered and not try to login', () => {
      const validStoredTokenData = {
        token: 'test-token',
        tokenExpiration: Date.now() + 60 * 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(validStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
      expect(mockSessionStorageSet).toBeCalledTimes(0)
    })
    it('should not use stored credentials without token when PrivateRoute is rendered and try to login', () => {
      const invalidStoredTokenData = {
        refreshToken: 'test-token',
        tokenExpiration: Date.now() + 60 * 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(invalidStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
      expect(mockSessionStorageSet).toBeCalledTimes(1)
    })
    it('should not use stored credentials without tokenExpiration when PrivateRoute is rendered and try to login', () => {
      const invalidStoredTokenData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(invalidStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
      expect(mockSessionStorageSet).toBeCalledTimes(1)
    })
    it('should not use stored credentials with expired token when PrivateRoute is rendered and try to login', () => {
      const invalidStoredTokenData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        tokenExpiration: Date.now() - 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(invalidStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      expect(getMock).toBeCalledTimes(1)
      expect(getMock).toBeCalledWith(testStorageItemName)
      expect(mockSessionStorageSet).toBeCalledTimes(1)
    })
    it('should use valid stored credentials when PrivateRoute is rendered and display the children', async () => {
      const validStoredTokenData = {
        token: 'test-token',
        refreshToken: 'test-refresh-token',
        tokenExpiration: Date.now() + 60 * 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(validStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await screen.findByText('Test Auth Provider')
    })
    it('should attempt to login after token expires and there is no refresh token', async () => {
      const validStoredTokenData = {
        token: 'test-token',
        tokenExpiration: Date.now() + 100,
      }
      const getMock = jest.fn().mockReturnValueOnce(JSON.stringify(validStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => expect(getMock).toBeCalledTimes(1))
      await screen.findByText('Test Auth Provider')
      await waitFor(() => expect(mockReplace).toBeCalledTimes(1))
      expect(mockReplace).toBeCalledWith(authorizeEndpoint + '?' + testOauthQuerySearch)
    })
    it('should refresh token each time it expires and there is refresh token', async () => {
      setupTokenRequest({
        token: 'test-token',
        expires_in: 3.1,
        refresh_token: 'new-test-refresh-token',
      })
      const validStoredTokenData = {
        token: 'test-token',
        tokenExpiration: Date.now() + 100,
        refreshToken: 'test-refresh-token',
      }
      const getMock = jest.fn().mockReturnValueOnce(JSON.stringify(validStoredTokenData))
      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => expect(getMock).toBeCalledTimes(1))
      await screen.findByText('Test Auth Provider')

      await waitFor(() => expect(mockTokenRequest).toBeCalledTimes(1))

      const refreshTokenRequestBody = new FormData()
      refreshTokenRequestBody.set('grant_type', 'refresh_token')
      refreshTokenRequestBody.set('refresh_token', 'test-refresh-token')
      refreshTokenRequestBody.set('redirect_uri', `http://podato.com${AUTH_REDIRECT_PATHNAME}`)
      refreshTokenRequestBody.set('client_id', testAuthClientId)

      expect(global.fetch).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        body: refreshTokenRequestBody,
      })

      await waitFor(() => expect(screen.queryByText('Test Auth Provider')).not.toBeNull())
      await waitFor(() => expect(mockTokenRequest).toBeCalledTimes(2))

      refreshTokenRequestBody.set('refresh_token', 'new-test-refresh-token')
      expect(global.fetch).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        body: refreshTokenRequestBody,
      })

      await waitFor(() => expect(mockLocalStorageSet).toBeCalledTimes(2))
      await waitFor(() =>
        expect(mockLocalStorageSet).toHaveBeenLastCalledWith(
          'test',
          expect.stringContaining(
            JSON.stringify({
              token: 'test-token',
              refreshToken: 'new-test-refresh-token',
            }).replace(/[{}]/g, '')
          )
        )
      )
      await waitFor(() => expect(screen.queryByText('Test Auth Provider')).not.toBeNull())
    })
    it('should clear stored credentials if they are invalid', async () => {
      const invalidStoredTokenData = {
        refreshToken: 'test-refresh-token',
        tokenExpiration: Date.now() + 60 * 1000,
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(invalidStoredTokenData))

      window.localStorage.getItem = getMock
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => expect(getMock).toBeCalledTimes(1))
      await waitFor(() => expect(mockLocalStorageRemove).toBeCalledTimes(1))
      expect(mockLocalStorageRemove).toBeCalledWith(testStorageItemName)
    })
  })
  describe('After Logging', () => {
    beforeEach(() => {
      const stateData = {
        state: 'state',
        redirectUri: '/test-redirect',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(stateData))
      window.sessionStorage.getItem = getMock
    })

    it('should display Loading component if the app got redirected to auth path', async () => {
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}`) as any
      render(
        <AuthProvider {...props} LoadingComponent={<>Test Loading Component</>}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      screen.getByText('Test Loading Component')
      await waitFor(() => expect(screen.queryByText('Test Auth Provider')).toBeNull())
    })
    it('should attempt to login again if search params are invalid', async () => {
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?search=invalid`) as any
      window.location.replace = mockReplace
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )
      await waitFor(() => expect(mockNavigate).toBeCalledTimes(1))
      expect(mockNavigate).toBeCalledWith('/test-redirect', { replace: true })
      window.location = new URL(`http://podato.com/test-redirect`) as any
      window.location.replace = mockReplace
      await waitFor(() => expect(mockReplace).toBeCalledTimes(1))
      expect(mockReplace).toBeCalledWith(authorizeEndpoint + '?' + testOauthQuerySearch)
    })
    it('should attempt to login again if there is no code', async () => {
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state`) as any
      window.location.replace = mockReplace
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )
      await waitFor(() => expect(mockNavigate).toBeCalledTimes(1))
      expect(mockNavigate).toBeCalledWith('/test-redirect', { replace: true })
      window.location = new URL(`http://podato.com/test-redirect`) as any
      window.location.replace = mockReplace
      await waitFor(() => expect(mockReplace).toBeCalledTimes(1))
      expect(mockReplace).toBeCalledWith(authorizeEndpoint + '?' + testOauthQuerySearch)
    })
    it('should attempt to login again if search state does not match what has been stored', async () => {
      const notMatchingStateData = {
        state: 'not matching',
        redirectUri: '/test-redirect-uri',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(notMatchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=other&code=valid-code`) as any
      window.location.replace = mockReplace
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )
      await waitFor(() => expect(getMock).toBeCalledTimes(1))
      await waitFor(() => expect(getMock).toBeCalledWith(AUTH_STATE_STORAGE_KEY))
      await waitFor(() => expect(mockNavigate).toBeCalledTimes(1))
      expect(mockNavigate).toBeCalledWith('/test-redirect-uri', { replace: true })
      window.location = new URL(`http://podato.com/test-redirect-uri`) as any
      window.location.replace = mockReplace
      await waitFor(() => expect(mockReplace).toBeCalledTimes(1))
      expect(mockReplace).toBeCalledWith(authorizeEndpoint + '?' + testOauthQuerySearch)
    })
    it('should fetch token with the code received from the redirect url', async () => {
      setupTokenRequest()
      const matchingStateData = {
        state: 'state',
        redirectUri: '/test-redirect-uri',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(matchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state&code=valid-test-code`) as any
      window.location.replace = mockReplace
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )
      await waitFor(() => expect(mockTokenRequest).toBeCalledTimes(1))
      expect(mockTokenRequest).toBeCalledWith(
        expect.objectContaining({
          method: 'POST',
        })
      )

      const tokenRequestBody = new FormData()
      tokenRequestBody.set('code', 'valid-test-code')
      tokenRequestBody.set('grant_type', 'authorization_code')
      tokenRequestBody.set('redirect_uri', `http://podato.com${AUTH_REDIRECT_PATHNAME}`)
      tokenRequestBody.set('client_id', testAuthClientId)

      expect(global.fetch).toHaveBeenCalledWith(tokenEndpoint, {
        method: 'POST',
        body: tokenRequestBody,
      })

      await waitFor(() => expect(mockLocalStorageSet).toBeCalledTimes(1))
      await waitFor(() =>
        expect(mockLocalStorageSet).toHaveBeenLastCalledWith(
          'test',
          expect.stringContaining(
            JSON.stringify({
              token: 'token',
              refreshToken: 'refreshToken',
            }).replace(/[{}]/g, '')
          )
        )
      )
      await waitFor(() => expect(screen.queryByText('Test Auth Provider')).not.toBeNull())
    })
    it('should login successfully after receiving valid token response', async () => {
      setupTokenRequest()
      const matchingStateData = {
        state: 'state',
        redirectUri: '/test-redirect-uri',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(matchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state&code=valid-test-code`) as any
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await screen.findByText('Test Auth Provider')
    })
    it('should navigate to correct url after successful login', async () => {
      setupTokenRequest()
      const matchingStateData = {
        state: 'state',
        redirectUri: '/test-redirect-uri?search=test_search_param',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(matchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state&code=valid-test-code`) as any
      render(
        <AuthProvider {...props}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await screen.findByText('Test Auth Provider')
      expect(mockNavigate).toBeCalledTimes(1)
      expect(mockNavigate).toBeCalledWith('/test-redirect-uri?search=test_search_param', { replace: true })
    })
    it('should fail to login after received invalid token response', async () => {
      setupTokenRequest({})
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      const matchingStateData = {
        state: 'state',
        redirectUri: '/test-redirect-uri',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(matchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state&code=valid-test-code`) as any
      render(
        <AuthProvider {...props} LoadingComponent={<>Test Loading Component</>}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => expect(screen.queryByText('Test Loading Component')).toBeNull())
      expect(screen.queryByText('Test Auth Provider')).toBeNull()
      expect(consoleWarnMock).toBeCalledTimes(1)
      consoleWarnMock.mockRestore()
    })
    it('should fail to login after received an error from token endpoint', async () => {
      setupTokenRequest({ error: 'test' })
      const consoleWarnMock = jest.spyOn(console, 'warn').mockImplementation()
      const matchingStateData = {
        state: 'state',
        redirectUri: '/test-redirect-uri',
      }
      const getMock = jest.fn().mockReturnValue(JSON.stringify(matchingStateData))
      window.sessionStorage.getItem = getMock
      window.location = new URL(`http://podato.com${AUTH_REDIRECT_PATHNAME}?state=state&code=valid-test-code`) as any
      render(
        <AuthProvider {...props} LoadingComponent={<>Test Loading Component</>}>
          <PrivateRoute>Test Auth Provider</PrivateRoute>
        </AuthProvider>
      )

      await waitFor(() => expect(screen.queryByText('Test Loading Component')).toBeNull())
      expect(screen.queryByText('Test Auth Provider')).toBeNull()
      expect(consoleWarnMock).toBeCalledTimes(1)
      consoleWarnMock.mockRestore()
    })
  })
})
