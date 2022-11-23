/* eslint-disable camelcase */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'

import Auto from './Auto'

jest.useFakeTimers()

const setup = () => {
  fetchMock.mockResponse((req) => {
    if (req.url.includes('pokemon')) {
      return new Promise((resolve) => {
        resolve(
          JSON.stringify({
            count: 100,
            next: 'pokemons10',
            previous: null,
            results: [{ name: 'Bulbasaur', url: 'pokemon/bulbazaur' }],
          })
        )
      })
    }

    return Promise.reject(new Error('bad url'))
  })
  // const user = userEvent.setup()
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime })
  // jest.advanceTimersByTime(1000) when want to something in setTimeout to be executed
  const utils = render(
    <QueryClientProvider client={new QueryClient()}>
      <Auto />
    </QueryClientProvider>
  )

  return { user, ...utils }
}
describe('Auto', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    fetchMock.resetMocks()
  })
  it('should render correctly', () => {
    setup()
    screen.getByTestId('autocomplete')
  })

  it('should show searched options', async () => {
    const { user } = setup()
    await user.type(screen.getByTestId('autocomplete'), 'bulba')
    await screen.findByText('Loading…')
    await screen.findByText('Bulbasaur')
  })

  it('should debounce fetching options', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        () => new Promise((resolve) => resolve({ json: () => Promise.resolve({ pokemons: [] }) } as any))
      )
    const { user } = setup()
    expect(fetchSpy).toHaveBeenCalledTimes(0)
    await user.type(screen.getByTestId('autocomplete'), 'bu')
    expect(fetchSpy).toHaveBeenCalledTimes(1) // fetch on focus with empty query
    await user.type(screen.getByTestId('autocomplete'), 'lb')
    await user.type(screen.getByTestId('autocomplete'), 'a')
    expect(fetchSpy).toHaveBeenCalledTimes(1) // wait for delay to pass
    await screen.findByText('Loading…')
    await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull())

    expect(fetchSpy).toHaveBeenCalledTimes(2)
    fetchSpy.mockRestore()
  })
})
