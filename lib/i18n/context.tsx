'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import en from './en'
import zh from './zh'

const translations = { en, zh }
type Language = keyof typeof translations
type TranslationType = typeof en

const I18nContext = createContext<{
  t: TranslationType
  language: Language
  setLanguage: (lang: Language) => void
}>({
  t: en,
  language: 'en',
  setLanguage: () => {},
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en')

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language
    const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en'
    setLanguage(savedLang || browserLang)
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem('language', lang)
  }

  return (
    <I18nContext.Provider 
      value={{ 
        t: translations[language], 
        language,
        setLanguage: handleSetLanguage
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export const useI18n = () => useContext(I18nContext) 