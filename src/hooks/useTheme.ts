import { useState, useEffect, useCallback } from 'react'
import type { Theme } from '../types'

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('readest-theme') as Theme | null
    if (stored) applyTheme(stored)
  }, [])

  const applyTheme = (t: Theme) => {
    const root = document.documentElement
    root.classList.remove('dark', 'sepia')
    if (t === 'dark') root.classList.add('dark')
    if (t === 'sepia') root.classList.add('sepia')
    setThemeState(t)
    localStorage.setItem('readest-theme', t)
  }

  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
  }, [])

  return { theme, setTheme }
}
