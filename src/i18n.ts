import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome": "Welcome",
      // Add more as needed
    }
  },
  bn: {
    translation: {
      "Welcome": "স্বাগতম",
      // Add more as needed
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
