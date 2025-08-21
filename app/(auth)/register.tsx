import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/lib/api";

type Role = "rider" | "cook" | "supervisor" | "refill";
const ROLES: { label: string; value: Role }[] = [
  { label: "Rider", value: "rider" },
  { label: "Cook", value: "cook" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Refill Coordinator", value: "refill" },
];

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<Role>("rider");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async () => {
    if (!email || !name || !password) return Alert.alert("Missing info", "Please enter all fields.");
    setBusy(true);
    try {
      await api.post("/api/auth/register-request", {
        email: email.trim(), name: name.trim(), role, password
      });
      Alert.alert("Request sent", "SuperAdmin will approve your account.");
      setEmail(""); setName(""); setPassword(""); setRole("rider");
    } catch (e: any) {
      Alert.alert("Error", e.message || "Could not send request.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 6 }}>Register Yourself</Text>
      <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address"
        value={email} onChangeText={setEmail} editable={!busy}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }} />
      <TextInput placeholder="Full Name" value={name} onChangeText={setName} editable={!busy}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }} />
      <View style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, overflow: "hidden" }}>
        <Picker enabled={!busy} selectedValue={role} onValueChange={(v) => setRole(v)}>
          {ROLES.map((r) => <Picker.Item key={r.value} label={r.label} value={r.value} />)}
        </Picker>
      </View>
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} editable={!busy}
        style={{ borderWidth: 1, borderColor: "#ccc", borderRadius: 12, padding: 12 }} />
      <Pressable onPress={onSubmit} disabled={busy}
        style={{ backgroundColor: busy ? "#8aa0c0" : "#204070", padding: 14, borderRadius: 12, alignItems: "center", marginTop: 8 }}>
        <Text style={{ color: "white", fontWeight: "700" }}>Request Registration</Text>
      </Pressable>
      <Text style={{ marginTop: 8, color: "#666" }}>After approval, use the same credentials here to log in.</Text>
    </View>
  );
}
