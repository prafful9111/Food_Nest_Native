import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { SUPERADMIN_CREDENTIALS } from "@/constants/auth";
import { signIn } from "@/lib/authStore";
import { verifyCredentials } from "@/lib/usersStore";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing info", "Please enter email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const e = email.trim().toLowerCase();

      // 1) Hardcoded SuperAdmin
      if (e === SUPERADMIN_CREDENTIALS.email && password === SUPERADMIN_CREDENTIALS.password) {
        signIn({ email: e, role: "superadmin" });
        router.replace("/"); // hand off to /index which Redirects to the right dashboard
        return;
      }

      // 2) Approved users (from local users store)
      const u = await verifyCredentials(e, password);
      if (u) {
        signIn({ email: u.email, name: u.name, role: u.role });
        router.replace("/");
        return;
      }

      Alert.alert("Login failed", "Invalid credentials.");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 6 }}>Login</Text>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        editable={!submitting}
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
        editable={!submitting}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
        }}
      />

      <Pressable
        onPress={handleLogin}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? "#8aa0c0" : "#204070",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        {submitting ? (
          <ActivityIndicator />
        ) : (
          <Text style={{ color: "white", fontWeight: "700" }}>Login</Text>
        )}
      </Pressable>

      {/* Dev tip – remove in prod */}
      <Text style={{ marginTop: 8, color: "#666" }}>
        SuperAdmin: {SUPERADMIN_CREDENTIALS.email} / {SUPERADMIN_CREDENTIALS.password}
      </Text>
    </View>
  );
}
