import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';

export const SUPPORTED_LOCALES = ['en', 'fr', 'es'];

function detectBrowserLocale() {
  const browserLang = navigator.language?.slice(0, 2);
  return SUPPORTED_LOCALES.includes(browserLang) ? browserLang : 'en';
}

// §11: unauthenticated pages use browser language detection falling back to
// en. Once a user logs in, AuthContext switches to their persisted
// User.locale — this initial value only matters pre-login.
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
    es: { translation: es },
  },
  lng: detectBrowserLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export default i18n;
