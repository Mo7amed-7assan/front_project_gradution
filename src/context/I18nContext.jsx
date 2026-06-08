import React, { createContext, useContext, useEffect, useState } from 'react'
import en from '../i18n/en'
import ar from '../i18n/ar'

/* ─────────────────────────────────────────────────────────
   I18nContext
   • Persists locale in localStorage ("cf_locale")
   • Sets dir="rtl|ltr" and lang="ar|en" on <html>
   • Provides t() helper — e.g. t('nav.home')
   ───────────────────────────────────────────────────────── */
const I18nContext = createContext(null)

const dictionaries = { en, ar }

export function I18nProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    try {
      return localStorage.getItem('cf_locale') || 'en'
    } catch {
      return 'en'
    }
  })

  // Apply dir + lang attributes to <html> on locale change
  useEffect(() => {
    const root = document.documentElement
    const isRTL = locale === 'ar'
    root.setAttribute('dir', isRTL ? 'rtl' : 'ltr')
    root.setAttribute('lang', locale)
    try {
      localStorage.setItem('cf_locale', locale)
    } catch { /* silent */ }
  }, [locale])

  const toggleLocale = () => setLocale(prev => prev === 'en' ? 'ar' : 'en')
  const isRTL = locale === 'ar'
  const dict = dictionaries[locale] || en

  /**
   * t('nav.home') — resolve a dot-separated key from the current dictionary.
   * Returns the key itself as fallback if missing.
   * @param {string} key
   * @param {...any} args — forwarded to function values (e.g. moreSkills(3))
   */
  const t = (key, ...args) => {
    const parts = key.split('.')
    let val = dict
    for (const part of parts) {
      if (val == null) return key
      val = val[part]
    }
    if (typeof val === 'function') return val(...args)
    return val ?? key
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, isRTL, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>')
  return ctx
}
