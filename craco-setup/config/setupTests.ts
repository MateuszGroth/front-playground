// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// eslint-disable-next-line import/no-extraneous-dependencies
import fetchMock, { enableFetchMocks } from 'jest-fetch-mock'

enableFetchMocks()

beforeEach(() => {
  // clear url before every test because history is shared resource

  jest.clearAllMocks()
  fetchMock.resetMocks()
})

process.env.REACT_APP_PODATO_API_URL = 'https://stagingpodato-api.riskmethods.net/api/v1'
process.env.REACT_APP_OAUTH_CLIENT_ID = 'anything'
process.env.REACT_APP_ENV = 'prod'
process.env.REACT_JEST_ENV = 'true'

// 5000 is default
jest.setTimeout(10000)

jest.mock('store/index', () => {
  const actualStore = jest.requireActual('store/index') as Record<string, any>
  return {
    __esModule: true,
    ...actualStore,
    getStore: () => {
      const store = actualStore.getStore()
      return {
        ...store,
        getState: () => {
          const actualState = store?.getState()
          return {
            ...actualState,
            env: {
              NODE_ENV: process.env.NODE_ENV,
              REACT_APP_PODATO_API_URL: process.env.REACT_APP_PODATO_API_URL,
            },
          }
        },
      }
    },
  }
})

// @ts-expect-error: mocking getContext function
HTMLCanvasElement.prototype.getContext = (contextId: string, options) => {
  return {
    measureText: (text) => ({ width: text.length * 6 }),
  }
}
