import React, { useState, useRef } from "react";
import { View, TextInput, Pressable, Text, Alert, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { signInWithToken } from "@/lib/authStore";
import { api } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Keep Animated refs but set to static (no animation)
  const titleAnim = useRef(new Animated.Value(1)).current;
  const formAnim = useRef(new Animated.Value(1)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

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
    <View style={styles.container}>
      {/* Branding Section (no animation now) */}
      <Animated.View style={[styles.brandingContainer, { opacity: 1 }]}>
        <Text style={styles.mainTitle}>Food-Nest</Text>
        <Text style={styles.slogan}>Your Street, Your Feast.</Text>
      </Animated.View>

      {/* Form Section (no animation now) */}
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

      {/* Button Section (gradient yellows) */}
      <Animated.View style={[styles.buttonContainer, { opacity: 1 }]}>
        <Pressable onPress={handleLogin} disabled={busy} style={[styles.loginButtonContainer]}>
          <LinearGradient
            colors={busy ? ["#FFE082", "#FFCA28", "#FFB300"] : ["#FFE082", "#FFC107", "#FFA000"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.loginButtonGradient, busy && { opacity: 0.7 }]}
          >
            {busy ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </LinearGradient>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fffbe9', // subtle warm base for food vibe
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 60,
  },
  mainTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#7A4F01', // rich brown pairs well with yellows
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8c6e54',
    textAlign: 'center',
    fontStyle: 'italic',
    letterSpacing: 0.5,
  },
  formContainer: {
    gap: 16,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#f1e2b6',
    borderRadius: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  loginButtonContainer: {
    borderRadius: 16,
    shadowColor: '#FFA000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
    minWidth: 200,
    overflow: "hidden",
  },
  loginButtonGradient: {
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
