import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
    </GestureHandlerRootView>
  );
}
