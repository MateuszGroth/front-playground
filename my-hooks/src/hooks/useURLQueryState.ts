import { useCallback, useMemo, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import useCallbackRef from './useCallbackRef'

interface QueryStateOptions<T = string> {
  key: string
  initialValue?: T
  formatValue?: (value: T) => string | undefined
  parseValue?: (value: string | null) => T
}

const DEFAULT_PARSE = <T>(value: unknown): T => value as T

const DEFAULT_FORMAT = <T = string>(value: T): string | undefined => value as unknown as string

const getNewSearchParams = <T>(
  key: string,
  value: T,
  formatCallback: (arg: T) => string | undefined = DEFAULT_FORMAT
) => {
  const newSearchParams = new URLSearchParams(window.location.search)
  if (value == null) {
    newSearchParams.delete(key)
    return newSearchParams
  }
  const formattedValue = formatCallback(value)

  if (formattedValue == null) {
    newSearchParams.delete(key)
  } else {
    newSearchParams.set(key, formattedValue)
  }

  return newSearchParams
}

export const useURLQueryState = <T = string>(
  options: QueryStateOptions<T>
): [T | undefined, (value: T | undefined) => void] => {
  const [searchParams, setSearchParams] = useSearchParams()
  const setSearchParamsRef = useCallbackRef(setSearchParams)
  const formatValueRef = useCallbackRef(options.formatValue || DEFAULT_FORMAT)
  const parseValueRef = useCallbackRef(options.parseValue || DEFAULT_PARSE)

  const initialValueRef = useRef(options.initialValue)

  const urlSearchParamValue = searchParams.get(options.key)
  const value = useMemo(() => {
    if (urlSearchParamValue == null && initialValueRef.current) {
      return initialValueRef.current
    }

    return parseValueRef.current(urlSearchParamValue)
  }, [urlSearchParamValue, parseValueRef, initialValueRef])

  const onSetValue = useCallback(
    (newValue: T | undefined) => {
      // unset the initial value
      initialValueRef.current = undefined

      // set query param value
      const newSearchParams = getNewSearchParams(options.key, newValue, formatValueRef.current)
      setSearchParamsRef.current(newSearchParams)
    },
    [options.key, formatValueRef, setSearchParamsRef]
  )

  return [value, onSetValue]
}
