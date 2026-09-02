import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import de from './locales/de.json';

const LANGUAGE_STORAGE_KEY = 'user-language';

const resources = {
  en: { translation: en },
  de: { translation: de },
};

const getDeviceLanguage = (): string => {
  const locales = RNLocalize.getLocales();
  if (locales.length > 0) {
    const languageCode = locales[0].languageCode;
    return languageCode === 'de' ? 'de' : 'en'; // fallback to English for any other language
  }
  return 'en';
};

export const initI18n = async () => {
  let savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

  if (!savedLanguage) {
    savedLanguage = getDeviceLanguage();
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
  });
};

export const changeLanguage = async (lang: 'en' | 'de') => {
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  await i18n.changeLanguage(lang);
};

export default i18n;
