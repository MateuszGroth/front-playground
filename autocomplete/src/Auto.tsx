import { useState, useEffect, useMemo, useCallback, forwardRef, ForwardedRef } from 'react'
import { Chip, TextField, Autocomplete, CircularProgress } from '@mui/material'
import { useInfiniteQuery } from '@tanstack/react-query'
import { throttle } from 'lodash'

const SEARCH_DEBOUNCE_DEYAL = 500

type Option = { name: string; url: string }
const PER_PAGE = 30
const fetchPokemons = async (
  search: string,
  pageParam: any
): Promise<{ count: number; next: string | null; previous: string | null; results: Option[] }> => {
  const offset = (pageParam - 1) * PER_PAGE
  const correctedOffset = offset < 0 ? 0 : offset
  return fetch(`https://pokeapi.co/api/v2/pokemon?limit=${PER_PAGE}&offset=${correctedOffset}`).then((r) => r.json())
}

const Auto = () => {
  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [value, setValue] = useState<Option[]>([])
  const debouncedSearch = useDebounce(inputValue, SEARCH_DEBOUNCE_DEYAL)

  const pokemonsQueryData = useInfiniteQuery(
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

  const { fetchNextPage, hasNextPage, isFetching, data } = pokemonsQueryData

  const newOptions = useMemo<Option[]>(() => {
    const fetched =
      data?.pages.flatMap((page) => {
        return page.results
      }) ?? []
    const uniqueOptions: Option[] = []
    return [...value, ...fetched].reduce((acc, curr) => {
      if (!acc.some(({ name }) => name === curr.name)) {
        acc.push(curr)
      }
      return acc
    }, uniqueOptions)
  }, [value, data])

  const handleChange = (ev: any, newValue: Option[]) => {
    setValue(newValue)
  }
  const handleScroll = useCallback(
    (ev: any) => {
      if (!hasNextPage || isFetching) {
        return
      }
      const listHeight = ev.target.scrollHeight
      const offsetBottom = ev.target.scrollTop + ev.target.offsetHeight
      const shouldFetch = listHeight - offsetBottom < 200
      if (!shouldFetch) {
        return
      }

      fetchNextPage()
    },
    [hasNextPage, isFetching, fetchNextPage]
  )

  const throttledHandleScroll = useMemo(() => {
    return throttle(handleScroll, 300)
  }, [handleScroll])

  const isLoading = isFetching

  return (
    <Autocomplete
      sx={{ flexBasis: '15rem', minWidth: '15rem' }}
      multiple
      filterSelectedOptions
      size="small"
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue.trim())
      }}
      getOptionLabel={(option) => option.name}
      isOptionEqualToValue={(option, value) => option.name === value.name}
      loading={isLoading}
      onChange={handleChange}
      value={value}
      options={newOptions}
      filterOptions={(x) => x}
      renderTags={(value: readonly Option[], getTagProps) =>
        value.map((option: Option, index: number) => (
          <Chip variant="outlined" size="small" label={option.name} {...getTagProps({ index })} />
        ))
      }
      clearIcon={isLoading ? <></> : undefined}
      ListboxComponent={ListBox}
      ListboxProps={{
        onScroll: throttledHandleScroll,
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          size={'small'}
          name={'autocomplete'}
          label={'My Autocomplete'}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading && (
                  <CircularProgress color="primary" size={20} sx={{ position: 'absolute', right: '37px' }} />
                )}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
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

type ListBoxProps = React.HTMLAttributes<HTMLUListElement>

const ListBox = forwardRef(function ListBoxBase(props: ListBoxProps, ref: ForwardedRef<HTMLUListElement>) {
  const { children, ...rest } = props

  return (
    // role=list-box must not be removed. It makes the autocomplete not scroll to the top on options change
    // eslint-disable-next-line jsx-a11y/aria-role
    <ul {...rest} ref={ref} role="list-box">
      {children}
    </ul>
  )
})

export default Auto
