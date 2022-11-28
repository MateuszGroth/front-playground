import { useState, useEffect } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'

export type Option = { name: string; url: string; isSelected?: boolean }

const SEARCH_DEBOUNCE_DEYAL = 500
const PER_PAGE = 30
const fetchPokemons = async (
  search: string,
  pageParam: any
): Promise<{ count: number; next: string | null; previous: string | null; results: Option[] }> => {
  const offset = (pageParam - 1) * PER_PAGE
  const correctedOffset = offset < 0 ? 0 : offset
  return fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PER_PAGE}&offset=${correctedOffset}`).then((r) => r.json())
}

export const useData = (open: boolean, search: string, delay = SEARCH_DEBOUNCE_DEYAL) => {
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_DEYAL)

  return useInfiniteQuery(
    ['pokemon', debouncedSearch],
    ({ pageParam = 1 }) => {
      return fetchPokemons(debouncedSearch, pageParam)
    },
    {
      enabled: open,
      staleTime: 600000,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage.next) {
          return
        }
        const total = lastPage.count
        const params = new URLSearchParams(lastPage.next.split('?', 2)[1])
        const { offset } = Object.fromEntries(params)
        if (+offset > total) {
          return
        }
        const nextPage = Math.floor(+offset / PER_PAGE) + 1
        return nextPage
      },
      getPreviousPageParam: (firstPage, allPages) => {
        if (!firstPage.previous) {
          return
        }

        const params = new URLSearchParams(firstPage.previous.split('?', 2)[1])
        const { offset } = Object.fromEntries(params)

        const prevPage = Math.floor(+offset / +PER_PAGE) + 1
        if (prevPage < 0) {
          return 0
        }

        return prevPage
      },
    }
  )
}

// https://usehooks.com/useDebounce/
// T is a generic type for value parameter, our case this will be string
function useDebounce<T>(value: T, delay: number): T {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed
      // within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler)
      }
    },
    [value, delay] // Only re-call effect if value or delay changes
  )

  return debouncedValue
}
