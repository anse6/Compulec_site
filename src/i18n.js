import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { translations } from "./assets/translations";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: translations.EN
      },
      fr: {
        translation: translations.FR
      }
    },
    lng: "fr", // default language
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
