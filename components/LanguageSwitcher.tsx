import React from "react";
import { View, Pressable, Text } from "react-native";
import { useLang } from "@/app/_layout";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang();
  const { t } = useTranslation();

  return (
    <View style={{ flexDirection: "row", gap: 8 }}>
      <Pressable
        onPress={() => setLang("en")}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: lang === "en" ? "#007aff" : "#ccc"
        }}
      >
        <Text>{t("language.english")}</Text>
      </Pressable>

      <Pressable
        onPress={() => setLang("th")}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: lang === "th" ? "#007aff" : "#ccc"
        }}
      >
        <Text>{t("language.thai")}</Text>
      </Pressable>
    </View>
  );
}
