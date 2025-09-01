import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 24 }}>{t("appName")}</Text>
    </View>
  );
}
