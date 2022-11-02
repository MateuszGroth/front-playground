import { useState, useCallback, useRef, useEffect } from 'react'

const useLocalStorage = <T>(key: string, initialValue: T): [T, (value: T | ((prevState?: T) => T)) => void] => {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  // Use references to not recreate the state setter function ...
  // ... with the use of useCallback
  const keyRef = useRef(key)
  useEffect(() => {
    keyRef.current = key
  }, [key])

  const storedValueRef = useRef(storedValue)
  useEffect(() => {
    storedValueRef.current = storedValue
  }, [storedValue])

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = useCallback((value: T | ((prevState?: T) => T)): void => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValueRef.current) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(keyRef.current, JSON.stringify(valueToStore))
      }
    } catch (e) {
      void e
    }
  }, [])

  return [storedValue, setValue]
}

export default useLocalStorage
