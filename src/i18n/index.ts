import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import * as RNLocalize from 'react-native-localize';
import en from './locales/en.json';
import ko from './locales/ko.json';

const locales = RNLocalize.getLocales();
const deviceLanguage = locales[0]?.languageCode ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: {translation: en},
    ko: {translation: ko},
  },
  lng: deviceLanguage === 'ko' ? 'ko' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
