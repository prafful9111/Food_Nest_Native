// app/(auth)/login.tsx
import React, { useEffect, useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import { SUPERADMIN_CREDENTIALS } from "@/constants/auth";
import { signIn, onAuthChange, getUser } from "@/lib/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // If already logged in, bounce to role dashboard
  useEffect(() => {
    const unsub = onAuthChange(() => {
      const u = getUser();
      if (!u) return;
      if (u.role === "superadmin") {
        router.replace("/roles/superadmin/overview");
      } else if (u.role === "rider") {
        router.replace("/roles/rider/RiderOverview");
      } else if (u.role === "cook") {
        router.replace("/roles/cook/CookOverview");
      } else if (u.role === "supervisor") {
        router.replace("/roles/supervisor/SupervisorOverview");
      } else if (u.role === "refill") {
        router.replace("/roles/refill/RefillCoordinatorOverview");
      }
    });
    // check once on mount
    const u = getUser();
    if (u) {
      router.replace(
        u.role === "superadmin"
          ? "/roles/superadmin/overview"
          : u.role === "rider"
          ? "/roles/rider/RiderOverview"
          : u.role === "cook"
          ? "/roles/cook/CookOverview"
          : u.role === "supervisor"
          ? "/roles/supervisor/SupervisorOverview"
          : "/roles/refill/RefillCoordinatorOverview"
      );
    }
    return unsub;
  }, [router]);

  const handleLogin = () => {
    // For now only SuperAdmin is checked locally.
    if (
      email.trim().toLowerCase() === SUPERADMIN_CREDENTIALS.email &&
      password === SUPERADMIN_CREDENTIALS.password
    ) {
      signIn({ email, role: "superadmin" });
      return;
    }
    Alert.alert("Login failed", "Invalid credentials for SuperAdmin.");
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 8 }}>
        SuperAdmin Login
      </Text>
      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
        }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
        }}
      />

      <Pressable
        onPress={handleLogin}
        style={{
          backgroundColor: "#204070",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>Login</Text>
      </Pressable>

      <Text style={{ marginTop: 8, color: "#555" }}>
        Tip: Use {SUPERADMIN_CREDENTIALS.email} / {SUPERADMIN_CREDENTIALS.password}
      </Text>
    </View>
  );
}
