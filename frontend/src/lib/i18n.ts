import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import jaTranslation from '@/locales/ja/translation.json'
import enTranslation from '@/locales/en/translation.json'

const resources = {
  ja: {
    translation: jaTranslation,
  },
  en: {
    translation: enTranslation,
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ja', // デフォルト言語
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n