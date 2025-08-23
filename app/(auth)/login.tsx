import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Pressable, Text, Alert, ActivityIndicator, StyleSheet, Animated } from "react-native";
import { useRouter } from "expo-router";
import { signInWithToken } from "@/lib/authStore";
import { api } from "@/lib/api";
import { Feather } from "@expo/vector-icons";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  
  // Animation refs
  const titleAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animate elements in sequence
    Animated.sequence([
      Animated.timing(titleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(formAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      {/* Branding Section */}
      <Animated.View 
        style={[
          styles.brandingContainer,
          {
            opacity: titleAnim,
            transform: [{ 
              translateY: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0]
              })
            }, { 
              scale: titleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1]
              })
            }]
          }
        ]}
      >
        <Text style={styles.mainTitle}>Food-Nest</Text>
        <Text style={styles.slogan}>Your Street, Your Feast.</Text>
      </Animated.View>

      {/* Form Section */}
      <Animated.View 
        style={[
          styles.formContainer,
          {
            opacity: formAnim,
            transform: [{ translateY: formAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [30, 0]
            })}]
          }
        ]}
      >
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
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!busy}
            style={styles.textInput}
          />
        </View>
      </Animated.View>

      <Animated.View
        style={[
          styles.buttonContainer,
          {
            opacity: buttonAnim,
            transform: [{ scale: buttonAnim }]
          }
        ]}
      >
        <Pressable
          onPress={handleLogin}
          disabled={busy}
          style={[styles.loginButton, busy && styles.loginButtonDisabled]}
        >
          {busy ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f8f9fa',
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
    color: '#204070',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 1,
  },
  slogan: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
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
    borderColor: '#e1e5e9',
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
  buttonContainer: {
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#204070',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: '#204070',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    minWidth: 200,
  },
  loginButtonDisabled: {
    backgroundColor: '#8aa0c0',
  },
  loginButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
