// app/(auth)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function AuthLayout() {
  return (
    <Tabs screenOptions={{ headerShown: true, headerTitle: "Welcome" }}>
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="log-in-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="register"
        options={{
          title: "Register",
          tabBarIcon: ({ size, color }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
