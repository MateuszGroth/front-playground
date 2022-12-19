import { useState, useMemo, useEffect, createContext, useContext } from 'react'

// import { defaultThemeMode, lightPalette, darkPalette, themeDefaults } from './constants'

const defaultThemeMode = 'dark'
type ThemeMode = 'dark' | 'light'
const darkTheme = {}
const lightTheme = {}
export function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    throw new Error(
      'getCookie() is not supported on the server. Fallback to a different value when rendering on the server.'
    )
  }

  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) {
    return parts[1].split(';').shift()
  }

  return undefined
}

export const isThemeMode = (value: unknown): value is ThemeMode =>
  typeof value === 'string' && ['light', 'dark'].includes(value)

export const getMetaThemeColor = (mode: ThemeMode) => {
  const themeColor = {
    light: '#f8f8f8',
    dark: '#212121',
  }
  return themeColor[mode]
}

const defaultContext = {
  changeTheme: (arg: ThemeMode) => {},
  themeMode: defaultThemeMode as ThemeMode,
}

export const ThemeContext = createContext<typeof defaultContext>(defaultContext)

const getInitialThemeMode = () => {
  const storedPaletteMode = getCookie('paletteMode')
  if (isThemeMode(storedPaletteMode)) {
    return storedPaletteMode
  }

  const { matches } = window.matchMedia('(prefers-color-scheme: dark)') || {}

  return matches ? 'dark' : 'light'
}

const ThemeProvider = ({ children }: { children: any }) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode)

  useEffect(() => {
    const metas = document.querySelectorAll('meta[name="theme-color"]')
    metas.forEach((meta) => {
      meta.setAttribute('content', getMetaThemeColor(themeMode))
    })

    if (themeMode === 'dark') {
      document.body.classList.remove('mode-light')
      document.body.classList.add('mode-dark')
    } else {
      document.body.classList.remove('mode-dark')
      document.body.classList.add('mode-light')
    }
  }, [themeMode])

  const contextValue = useMemo(
    () => ({
      changeTheme: (newThemeMode: ThemeMode) => {
        if (typeof document !== 'undefined') {
          document.cookie = `paletteMode=${newThemeMode};path=/;max-age=31536000`
        }
        setThemeMode(newThemeMode as ThemeMode)
      },
      themeMode,
    }),
    [themeMode]
  )

  const appTheme = useMemo(() => {
    return themeMode === 'dark' ? darkTheme : lightTheme
  }, [themeMode])

  void appTheme

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

export default ThemeProvider
