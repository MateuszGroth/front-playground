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

// 5000 is default
jest.setTimeout(10000)

// @ts-expect-error: mocking getContext function
HTMLCanvasElement.prototype.getContext = (contextId: string, options) => {
  return {
    measureText: (text) => ({ width: text.length * 6 }),
  }
}
