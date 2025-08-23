import React, { useState, useEffect, useRef } from "react";
import { View, TextInput, Pressable, Text, Alert, StyleSheet, Animated } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { api } from "@/lib/api";
import { Feather } from "@expo/vector-icons";

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
        <Text style={styles.slogan}>Where Every Bite Tells a Story</Text>
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
              {ROLES.map((r) => <Picker.Item key={r.value} label={r.label} value={r.value} />)}
            </Picker>
          </View>
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
          onPress={onSubmit} 
          disabled={busy}
          style={[styles.registerButton, busy && styles.registerButtonDisabled]}
        >
          <Text style={styles.registerButtonText}>
            {busy ? "Sending Request..." : "Request Registration"}
          </Text>
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
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e1e5e9',
    borderRadius: 16,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pickerWrapper: {
    flex: 1,
    borderLeftWidth: 1,
    borderLeftColor: '#e1e5e9',
    paddingLeft: 12,
  },
  picker: {
    height: 50,
    color: '#333',
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
  registerButton: {
    backgroundColor: '#204070',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: '#204070',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 16,
    minWidth: 200,
  },
  registerButtonDisabled: {
    backgroundColor: '#8aa0c0',
  },
  registerButtonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.5,
  },
  infoText: {
    color: "#666",
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});
