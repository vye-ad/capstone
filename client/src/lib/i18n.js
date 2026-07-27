import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';

// §11 calls for en/fr/es plus a locale switcher — that's a week 3 build-order
// item. Only `en` exists so far; wiring fr/es and the switcher happens then.
i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
