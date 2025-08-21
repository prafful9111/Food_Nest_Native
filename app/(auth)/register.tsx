import React, { useState } from "react";
import { View, TextInput, Pressable, Text, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { addRequest } from "@/lib/requestsStore";

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
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!email || !name || !password) {
      Alert.alert("Missing info", "Please enter all fields.");
      return;
    }

    setSubmitting(true);
    try {
      await addRequest({
        email: email.trim(),
        name: name.trim(),
        role,
        password, // stored only in pending request; real user is created on approval
      });

      Alert.alert(
        "Request sent",
        "Your registration request has been sent to SuperAdmin. You'll get an email when approved."
      );

      setEmail("");
      setName("");
      setPassword("");
      setRole("rider");
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Could not send request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12, justifyContent: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "700", marginBottom: 6 }}>Register Yourself</Text>

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
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
        editable={!submitting}
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
        <Picker enabled={!submitting} selectedValue={role} onValueChange={(v) => setRole(v)}>
          {ROLES.map((r) => (
            <Picker.Item key={r.value} label={r.label} value={r.value} />
          ))}
        </Picker>
      </View>

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
        onPress={onSubmit}
        disabled={submitting}
        style={{
          backgroundColor: submitting ? "#8aa0c0" : "#204070",
          padding: 14,
          borderRadius: 12,
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Request Registration</Text>
      </Pressable>

      <Text style={{ marginTop: 8, color: "#666" }}>
        After approval, use the same credentials here to log in.
      </Text>
    </View>
  );
}
