import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

import en from "../locales/en.json";
import th from "../locales/th.json";

const STORAGE_KEY = "i18n.language";

const resources = {
  en: { translation: en },
  th: { translation: th }
};

// Resolve initial language: persisted -> device -> 'en'
async function resolveInitialLanguage(): Promise<string> {
  try {
    const persisted = await AsyncStorage.getItem(STORAGE_KEY);
    if (persisted) return persisted;
  } catch {}
  const locale = Localization.getLocales()?.[0]?.languageCode ?? "en";
  return (locale === "th") ? "th" : "en";
}

// Initialize i18n (call once, early)
export async function initI18n() {
  const initialLng = await resolveInitialLanguage();

  await i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: "v4",
      resources,
      lng: initialLng,
      fallbackLng: "en",
      interpolation: { escapeValue: false }
    });

  // Persist whenever it changes
  i18n.on("languageChanged", async (lng) => {
    try { await AsyncStorage.setItem(STORAGE_KEY, lng); } catch {}
  });

  return i18n;
}

export default i18n;
