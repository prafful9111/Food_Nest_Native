import React, { useState, useRef } from "react";
import { View, TextInput, Pressable, Text, Alert, StyleSheet, Animated } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

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
  const [showPassword, setShowPassword] = useState(false);

  // Keep Animated refs but make them static (no animation)
  const titleAnim = useRef(new Animated.Value(1)).current;
  const formAnim = useRef(new Animated.Value(1)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

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
    <View style={styles.container}>
      {/* Branding Section (static) */}
      <Animated.View style={[styles.brandingContainer, { opacity: 1 }]}>
        <Text style={styles.mainTitle}>Food-Nest</Text>
        <Text style={styles.slogan}>Your Street, Your Feast.</Text>
      </Animated.View>

      {/* Form Section (static) */}
      <Animated.View style={[styles.formContainer, { opacity: 1 }]}>
        <View style={styles.inputContainer}>
          <Feather name="mail" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Email"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            editable={!busy}
            style={styles.textInput}
          />
        </View>

        <View style={styles.inputContainer}>
          <Feather name="user" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            editable={!busy}
            style={styles.textInput}
          />
        </View>

        <View style={styles.pickerContainer}>
          <Feather name="briefcase" size={20} color="#666" style={styles.inputIcon} />
          <View style={styles.pickerWrapper}>
            <Picker
              enabled={!busy}
              selectedValue={role}
              onValueChange={(v) => setRole(v)}
              style={styles.picker}
            >
              {ROLES.map((r) => (
                <Picker.Item key={r.value} label={r.label} value={r.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Feather name="lock" size={20} color="#666" style={styles.inputIcon} />
          <TextInput
            placeholder="Password"
            secureTextEntry={!showPassword} 
            value={password}
            onChangeText={setPassword}
            editable={!busy}
            style={styles.textInput}
          />
          <Pressable
  onPress={() => setShowPassword((s) => !s)}
  disabled={busy}
  style={styles.eyeButton}
  hitSlop={12}
>
  <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#666" />
</Pressable>
        </View>
      </Animated.View>

      {/* Button Section (yellow gradient) */}
      <Animated.View style={[styles.buttonContainer, { opacity: 1, transform: [{ scale: 1 }] }]}>
        <Pressable onPress={onSubmit} disabled={busy} style={styles.registerButtonWrap}>
          <LinearGradient
            colors={busy ? ["#FFE082", "#FFCA28", "#FFB300"] : ["#FFE082", "#FFC107", "#FFA000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.registerButton, busy && { opacity: 0.7 }]}
          >
            <Text style={styles.registerButtonText}>
              {busy ? "Sending Request..." : "Request Registration"}
            </Text>
          </LinearGradient>
        </Pressable>

        <Text style={styles.infoText}>
          After approval, use the same credentials here to log in.
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fffbe9", // warm base to match Login
  },
  brandingContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 80,
    marginBottom: 60,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: "800",
    color: "#7A4F01", // rich brown pairs with yellows
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 16,
    fontWeight: "500",
    color: "#8c6e54",
    textAlign: "center",
    fontStyle: "italic",
    letterSpacing: 0.5,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f1e2b6",
    borderRadius: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#f1e2b6",
    borderRadius: 16,
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pickerWrapper: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: "#f1e2b6",
    paddingLeft: 12,
  },
  picker: {
    height: 50,
    color: "#333",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  buttonContainer: {
    alignItems: "center",
  },
  registerButtonWrap: {
    borderRadius: 16,
    shadowColor: "#FFA000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 200,
    overflow: "hidden",
    marginBottom: 16,
  },
  registerButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  registerButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  infoText: {
    color: "#7a6a55",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 20,
  },

  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  
});
