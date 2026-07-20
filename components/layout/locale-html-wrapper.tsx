'use client'
import { useEffect } from 'react'
import { useLocaleStore } from '@/lib/locale-store'

/**
 * Reads the persisted locale from Zustand and applies
 * lang + dir attributes directly to <html> so the entire
 * document responds to language switching without a reload.
 */
export default function LocaleHtmlWrapper() {
  const locale = useLocaleStore(s => s.locale)

  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('lang', locale)
    html.setAttribute('dir', locale === 'ar' ? 'rtl' : 'ltr')
  }, [locale])

  return null
}
