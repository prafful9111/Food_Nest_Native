import React, { useState, useRef } from "react";
import {
  View,
  TextInput,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { signInWithToken } from "@/lib/authStore";
import { api } from "@/lib/api";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';


type Mode = "login" | "forgot" | "otp" | "reset";

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // forgot password flow state
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Keep Animated refs but static (no animation)
  const titleAnim = useRef(new Animated.Value(1)).current;
  const formAnim = useRef(new Animated.Value(1)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  const handleLogin = async () => {
    if (!email || !password) {
      return Alert.alert("Missing info", "Enter email and password.");
    }
    setBusy(true);
    try {
      // 1) Call backend
      const res = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password
      });
  
      // 2) Support both axios-like and fetch-like shapes
      const payload = (res && (res as any).data) ? (res as any).data : res;
      const user    = payload?.user;
      const jwt     = payload?.token || payload?.accessToken;
  
      if (!jwt) {
        throw new Error("No token returned from server");
      }
  
      // 3) Persist to AsyncStorage (keys used elsewhere)
      await AsyncStorage.multiSet([
        ["token", jwt],                                  // <— our fetch helpers read this
        ["user", JSON.stringify(user || {})],
        ["role", String(user?.role || "")],
        ["userId", String(user?._id || user?.id || "")]
      ]);
  
      // 4) Keep your existing auth store update (if it expects token + user)
      await signInWithToken(user, jwt);
  
      // 5) Navigate (your app redirects by role on /index)
      router.replace("/");
    } catch (e: any) {
      const msg =
        e?.response?.data?.error ||
        e?.response?.data?.message ||
        e?.message ||
        "Something went wrong";
      Alert.alert("Login failed", String(msg));
    } finally {
      setBusy(false);
    }
  };
  

  // --- Forgot password flow handlers ---
  const requestOtp = async () => {
    if (!email) return Alert.alert("Email required", "Please enter your account email.");
    setBusy(true);
    try {
      await api.post("/api/auth/forgot/request-otp", { email: email.trim().toLowerCase() });
      Alert.alert("OTP sent", "We’ve sent a code to your email.");
      setMode("otp");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Could not request OTP.");
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp || otp.trim().length < 4) return Alert.alert("Invalid code", "Enter the code from your email.");
    setBusy(true);
    try {
      await api.post("/api/auth/forgot/verify", {
        email: email.trim().toLowerCase(),
        code: otp.trim(),
      });
      setMode("reset");
    } catch (e: any) {
      Alert.alert("Invalid or expired", e?.message || "Please check the code and try again.");
    } finally {
      setBusy(false);
    }
  };

  const resetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      return Alert.alert("Weak password", "Password must be at least 6 characters.");
    }
    if (newPassword !== confirmPassword) {
      return Alert.alert("Mismatch", "New password and confirmation don’t match.");
    }
    setBusy(true);
    try {
      await api.post("/api/auth/forgot/reset", {
        email: email.trim().toLowerCase(),
        code: otp.trim(),
        newPassword,
      });
      Alert.alert("Success", "Password updated. Please log in.");
      // clean state & go back to login
      setPassword("");
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      setMode("login");
    } catch (e: any) {
      Alert.alert("Could not reset", e?.message || "Please request a new code and try again.");
    } finally {
      setBusy(false);
    }
  };

  // Common yellow gradient button
  const YellowButton = ({
    onPress,
    children,
    disabled,
    style,
  }: {
    onPress: () => void;
    children: React.ReactNode;
    disabled?: boolean;
    style?: any;
  }) => (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.loginButtonContainer, style]}>
      <LinearGradient
        colors={disabled ? ["#FFE082", "#FFCA28", "#FFB300"] : ["#FFE082", "#FFC107", "#FFA000"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.loginButtonGradient, disabled && { opacity: 0.7 }]}
      >
        {busy ? <ActivityIndicator color="white" /> : <Text style={styles.loginButtonText}>{children}</Text>}
      </LinearGradient>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Branding Section */}
      <Animated.View style={[styles.brandingContainer, { opacity: 1 }]}>
        <Text style={styles.mainTitle}>Food-Nest</Text>
        <Text style={styles.slogan}>Your Street, Your Feast.</Text>
      </Animated.View>

      {/* Forms */}
      <Animated.View style={[styles.formContainer, { opacity: 1 }]}>
        {/* Email (shared across modes) */}
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

        {mode === "login" && (
          <>
            {/* Password */}
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

            {/* Forgot link */}
            <Pressable onPress={() => setMode("forgot")} disabled={busy} style={styles.linkRow}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </Pressable>
          </>
        )}

        {mode === "forgot" && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Enter your email and tap <Text style={{ fontWeight: "800" }}>Get OTP</Text>. We’ll email you a code.
            </Text>
          </View>
        )}

        {mode === "otp" && (
          <>
            <View style={styles.inputContainer}>
              <Feather name="key" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Enter 6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                editable={!busy}
                style={styles.textInput}
              />
            </View>
            <Pressable onPress={() => setMode("forgot")} disabled={busy} style={styles.linkRow}>
              <Text style={styles.linkText}>Didn’t get a code? Get a new OTP</Text>
            </Pressable>
          </>
        )}

        {mode === "reset" && (
          <>
            <View style={styles.inputContainer}>
              <Feather name="shield" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="New password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                editable={!busy}
                style={styles.textInput}
              />
            </View>
            <View style={styles.inputContainer}>
              <Feather name="shield" size={20} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Confirm new password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                editable={!busy}
                style={styles.textInput}
              />
            </View>
          </>
        )}
      </Animated.View>

      {/* Buttons */}
      <Animated.View style={[styles.buttonContainer, { opacity: 1 }]}>
        {mode === "login" && (
          <YellowButton onPress={handleLogin} disabled={busy}>
            Login
          </YellowButton>
        )}

        {mode === "forgot" && (
          <YellowButton onPress={requestOtp} disabled={busy || !email}>
            Get OTP
          </YellowButton>
        )}

        {mode === "otp" && (
          <YellowButton onPress={verifyOtp} disabled={busy || otp.trim().length < 4}>
            Verify OTP
          </YellowButton>
        )}

        {mode === "reset" && (
          <YellowButton
            onPress={resetPassword}
            disabled={busy || !newPassword || !confirmPassword || newPassword !== confirmPassword}
          >
            Set New Password
          </YellowButton>
        )}

        {/* Back to login link for non-login modes */}
        {mode !== "login" && (
          <Pressable
            onPress={() => {
              setMode("login");
              setOtp("");
              setNewPassword("");
              setConfirmPassword("");
            }}
            disabled={busy}
            style={[styles.linkRow, { marginTop: 12 }]}
          >
            <Text style={styles.linkTextAlt}>
              <Feather name="arrow-left" size={14} /> Back to login
            </Text>
          </Pressable>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#fffbe9", // subtle warm base for food vibe
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
    color: "#7A4F01", // rich brown pairs well with yellows
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
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: "#333",
  },
  eyeButton: {
    paddingLeft: 8,
    paddingVertical: 8,
  },
  buttonContainer: {
    alignItems: "center",
  },
  loginButtonContainer: {
    borderRadius: 16,
    shadowColor: "#FFA000",
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
  // small link styles
  linkRow: { alignSelf: "flex-end" },
  linkText: { color: "#8c6e54", fontWeight: "700", paddingVertical: 8 },
  linkTextAlt: { color: "#8c6e54", fontWeight: "700" },
  // info box
  infoBox: {
    backgroundColor: "#FFF3C4",
    borderColor: "#FDE68A",
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
  },
  infoText: { color: "#7A4F01" },
});
