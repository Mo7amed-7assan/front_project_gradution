import React, { createContext, useContext, useEffect, useState } from 'react'

/* ─────────────────────────────────────────────────────────
   ThemeContext
   • Reads/writes "cf_theme" from localStorage
   • Applies [data-theme="light"|"dark"] to <html>
   • Default: "dark"
   ───────────────────────────────────────────────────────── */
const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('cf_theme') || 'dark'
    } catch {
      return 'dark'
    }
  })

  // Apply [data-theme] attribute to <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('cf_theme', theme)
    } catch { /* silent */ }
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const isDark = theme === 'dark'

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>')
  return ctx
}
