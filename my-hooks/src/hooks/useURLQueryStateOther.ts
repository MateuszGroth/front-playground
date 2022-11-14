import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useCallbackRef from './useCallbackRef'

interface QueryStateOptions<T = string> {
  key: string
  initialValue?: T
  defaultValue?: T
  formatValue?: (value: T) => string
  parseValue?: (value: string | null) => T
}

const DEFAULT_PARSE = <T>(value: unknown): T => value as T

const DEFAULT_FORMAT = (value: string): string => value

const getQueryStringValue = <T>(
  key: string,
  parseCallback: (value: string | null) => T | undefined = DEFAULT_PARSE
): T | undefined => {
  const searchParams = new URLSearchParams(window.location.search)

  return parseCallback(searchParams.get(key))
}

const getNewSearchParams = <T>(
  newValue: T | undefined,
  key: string,
  formatCallback: (value: T) => string
): URLSearchParams => {
  const searchParams = new URLSearchParams(window.location.search)
  if (newValue == null) {
    searchParams.delete(key)
    return searchParams
  }

  const formattedValue = formatCallback(newValue)
  if (formattedValue == null) {
    searchParams.delete(key)
    return searchParams
  }

  searchParams.set(key, formattedValue)

  return searchParams
}

// This hook stores state in react and reads it from url on initial render.
export const useURLQueryState = <T>(options: QueryStateOptions<T>): [T | undefined, (value: T | undefined) => void] => {
  const [value, setValue] = useState<T>(
    getQueryStringValue<T>(options.key, options.parseValue) ??
      (options.initialValue as T) ??
      (options.defaultValue as T)
  )
  const formatValueRef = useCallbackRef(options.formatValue || DEFAULT_FORMAT)
  const navigate = useNavigate()

  const onSetValue = useCallback(
    (newValue?: T) => {
      setValue(typeof newValue === 'undefined' ? (options.defaultValue as T) : newValue)

      const newSearchParams = getNewSearchParams<T>(
        newValue,
        options.key,
        formatValueRef.current as (value: T) => string
      )

      const urlWithoutQuery = window.location.pathname.split('?')[0]
      navigate(`${urlWithoutQuery}?${newSearchParams.toString()}`, { replace: false })
    },
    [options.key, options.defaultValue, navigate, formatValueRef]
  )

  return [value, onSetValue]
}
