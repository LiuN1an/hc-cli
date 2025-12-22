import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "~/locales/en";
import zh from "~/locales/zh";

// 简单的客户端 i18n 配置
const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: "zh",
  fallbackLng: "en",
  supportedLngs: ["en", "zh"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
