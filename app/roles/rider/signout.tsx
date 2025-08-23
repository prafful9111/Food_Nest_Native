import { useEffect } from "react";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

export default function SignOutScreen() {
  const router = useRouter();

  useEffect(() => {
    const performSignOut = async () => {
      await signOut();
      router.replace("/(auth)/login");
    };
    
    performSignOut();
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#ef4444" />
      <Text style={styles.text}>Signing out...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
});
