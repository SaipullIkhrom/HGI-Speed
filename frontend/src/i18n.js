// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationID from './locales/id/common.json';
import translationEN from './locales/en/common.json';

const resources = {
  id: { translation: translationID },
  en: { translation: translationEN }
};

i18n
  .use(LanguageDetector) // Otomatis deteksi bahasa browser pengguna
  .use(initReactI18next) // Integrasi dengan React
  .init({
    resources,
    fallbackLng: 'id', // Jika bahasa negara mereka tidak didukung, balik ke Bahasa Indonesia
    debug: false,
    interpolation: {
      escapeValue: false // React sudah aman dari XSS injection
    }
  });

export default i18n;
