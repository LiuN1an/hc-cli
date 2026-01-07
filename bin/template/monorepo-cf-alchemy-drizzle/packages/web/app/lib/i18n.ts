import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '~/locales/en';
import zh from '~/locales/zh';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh }
  },
  lng: 'zh', // Default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false // React already escapes
  }
});

export default i18n;
