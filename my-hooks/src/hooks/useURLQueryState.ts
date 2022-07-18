import { useCallback, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import useCallbackRef from './useCallbackRef'

interface QueryStateOptions<T = string> {
  key: string
  initialValue?: T
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

export const useURLQueryState = <T>(options: QueryStateOptions<T>): [T | undefined, (value: T | undefined) => void] => {
  const [value, setValue] = useState(getQueryStringValue<T>(options.key, options.parseValue) || options.initialValue)
  const formatValueRef = useCallbackRef(options.formatValue || DEFAULT_FORMAT)
  //   to const navigate = useNavigate()
  const navigate = {} as any

  const onSetValue = useCallback(
    (newValue: T | undefined) => {
      setValue(newValue)

      // set query param value
      const searchParams = new URLSearchParams(window.location.search)
      if (newValue == null) {
        searchParams.delete(options.key)
      } else {
        const formatCallback = formatValueRef.current as (value: T) => string
        const formattedValue = formatCallback(newValue)

        searchParams.set(options.key, formattedValue)
      }

      const urlWithoutQuery = window.location.pathname.split('?')[0]
      navigate.replace(`${urlWithoutQuery}?${searchParams.toString()}`, { replace: false })
    },
    [options.key, navigate, formatValueRef]
  )

  return [value, onSetValue]
}
