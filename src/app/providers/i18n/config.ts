import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import uk from './locales/uk.json';
// Keep EN in imports for now but don't use it as active
import en from './locales/en.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      uk: { translation: uk },
      en: { translation: en }
    },
    lng: 'uk', // 🔥 Force Ukrainian as the only language
    fallbackLng: 'uk',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
