import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { signInWithToken } from "@/lib/authStore";
import { api } from "@/lib/api";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Missing info", "Enter email and password.");
    setBusy(true);
    try {
      const res = await api.post<{ token: string; user: { email: string; name: string; role: any } }>(
        "/api/auth/login",
        { email: email.trim().toLowerCase(), password }
      );
      await signInWithToken(res.user, res.token);
      router.replace("/"); // /index will Redirect by role
    } catch (e: any) {
      Alert.alert("Login failed", e.message || "Something went wrong");
    } finally {
      setBusy(false);
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
        editable={!busy}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!busy}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }}
      />
      <Pressable
        onPress={handleLogin}
        disabled={busy}
        style={{ backgroundColor: busy ? "#8aa0c0" : "#204070", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 8 }}
      >
        {busy ? <ActivityIndicator /> : <Text style={{ color: "white", fontWeight: "700" }}>Login</Text>}
      </Pressable>
    </View>
  );
}
