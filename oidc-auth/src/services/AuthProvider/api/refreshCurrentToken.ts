import { AUTH_REDIRECT_PATHNAME } from '../constant'

const refreshCurrentToken = async (authBaseUrl: string, authClientId: string, refreshToken: string) => {
  const refreshTokenEndpoint = `${authBaseUrl}/oauth/token`
  const refreshTokenRequestBody = new FormData()
  refreshTokenRequestBody.set('grant_type', 'refresh_token')
  refreshTokenRequestBody.set('refresh_token', refreshToken)
  refreshTokenRequestBody.set('redirect_uri', `${window.location.origin}${AUTH_REDIRECT_PATHNAME}`)
  refreshTokenRequestBody.set('client_id', authClientId)

  return fetch(refreshTokenEndpoint, {
    method: 'POST',
    body: refreshTokenRequestBody,
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch((err) => {
      return { error: err }
    })
}

export default refreshCurrentToken
