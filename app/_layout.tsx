import { Slot } from "expo-router";
import React, { useEffect, useState, createContext, useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { initI18n } from "@/lib/i18n";
import i18n from "@/lib/i18n";

type LangContextType = {
  lang: string;
  setLang: (lng: "en" | "th") => void;
};
const LangContext = createContext<LangContextType>({ lang: "en", setLang: () => {} });

export function useLang() {
  return useContext(LangContext);
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState<string>("en");

  useEffect(() => {
    (async () => {
      await initI18n();
      setLangState(i18n.language);
      setReady(true);
    })();
  }, []);

  const setLang = (lng: "en" | "th") => {
    i18n.changeLanguage(lng);
    setLangState(lng);
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Slot />
    </LangContext.Provider>
  );
}
