'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import en from './en'
import zh_CN from './zh_CN'
import zh_HK from './zh_HK'
import de from './de'
import fr from './fr'
import ja from './ja'
import ko from './ko'

const translations = { en, zh_CN, zh_HK, de, fr, ja, ko }
export { translations }
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
    const getBrowserLang = () => {
      const lang = navigator.language.toLowerCase()
      if (lang.startsWith('zh-hk') || lang.startsWith('zh-tw')) {
        return 'zh-HK'
      } else if (lang.startsWith('zh')) {
        return 'zh-CN'
      }
      return 'en'
    }
    
    const browserLang = getBrowserLang()
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
