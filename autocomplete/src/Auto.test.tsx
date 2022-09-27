/* eslint-disable camelcase */
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Auto from './Auto'

describe('Auto', () => {
  it('should render correctly', () => {
    render(<Auto />)
    screen.getByTestId('autocomplete')
  })

  it('should show searched options', async () => {
    render(<Auto />)
    userEvent.type(screen.getByTestId('autocomplete'), 'bulba')
    await screen.findByText('Loading…')
    await screen.findByText('Bulbasaur')
  })

  it('should debounce fetching options', async () => {
    const fetchSpy = jest
      .spyOn(global, 'fetch')
      .mockImplementation(
        () => new Promise((resolve) => resolve({ json: () => Promise.resolve({ pokemons: [] }) } as any))
      )
    render(<Auto />)
    userEvent.type(screen.getByTestId('location_select'), 'bu')
    userEvent.type(screen.getByTestId('location_select'), 'lb')
    userEvent.type(screen.getByTestId('location_select'), 'a')

    await screen.findByText('Loading…')
    await waitFor(() => expect(screen.queryByText('Loading…')).toBeNull())

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    fetchSpy.mockRestore()
  })
})
