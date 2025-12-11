import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import en from "~/locales/en";
import zh from "~/locales/zh";

// 简单的客户端 i18n 配置
// 适用于不需要复杂 SSR i18n 的场景
const i18n = i18next.createInstance();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    zh: { translation: zh },
  },
  lng: "en", // 默认语言
  fallbackLng: "en",
  supportedLngs: ["en", "zh"],
  interpolation: {
    escapeValue: false, // React 已经安全转义
  },
});

export default i18n;

