// app/(auth)/register.tsx
import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";

const roles = [
  { label: "Rider", value: "rider" },
  { label: "Cook", value: "cook" },
  { label: "Supervisor", value: "supervisor" },
  { label: "Refill Coordinator", value: "refill" },
];

export default function RegisterScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"rider" | "cook" | "supervisor" | "refill">(
    "rider"
  );
  const [password, setPassword] = useState("");

  const onSubmit = async () => {
    if (!email || !name || !password) {
      Alert.alert("Missing info", "Please enter all fields.");
      return;
    }

    // TODO: Replace with real API call to send request to SuperAdmin.
    // Example payload:
    const payload = { email, name, role, password };

    console.log("Registration request ->", payload);
    Alert.alert(
      "Request sent",
      "Your registration request has been sent to SuperAdmin. You will receive an email upon approval."
    );

    // optionally clear inputs
    setEmail("");
    setName("");
    setPassword("");
    setRole("rider");
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "600", marginBottom: 8 }}>
        Register Yourself
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
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          padding: 12,
        }}
      />

      <View
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Picker selectedValue={role} onValueChange={(v) => setRole(v)}>
          {roles.map((r) => (
            <Picker.Item key={r.value} label={r.label} value={r.value} />
          ))}
        </Picker>
      </View>

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
        onPress={onSubmit}
        style={{
          backgroundColor: "#204070",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          Request Registration
        </Text>
      </Pressable>

      <Text style={{ marginTop: 8, color: "#555" }}>
        After approval, you’ll receive an email. Use the same credentials here to login.
      </Text>
    </View>
  );
}
