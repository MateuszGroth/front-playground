import { AUTH_REDIRECT_PATHNAME } from '../constant'

const getTokenData = async (authBaseUrl: string, authClientId: string, code: string) => {
  const tokenEndpoint = `${authBaseUrl}/oauth/token`
  const tokenRequestBody = new FormData()
  tokenRequestBody.set('code', code)
  tokenRequestBody.set('grant_type', 'authorization_code')
  tokenRequestBody.set('redirect_uri', `${window.location.origin}${AUTH_REDIRECT_PATHNAME}`)
  tokenRequestBody.set('client_id', authClientId)

  return fetch(tokenEndpoint, {
    method: 'POST',
    body: tokenRequestBody,
  })
    .then((res) => (res.ok ? res.json() : null))
    .catch((err) => {
      return { error: err }
    })
}

export default getTokenData
