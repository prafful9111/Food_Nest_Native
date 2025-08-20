// app/features/cook/RawMaterialRequests.tsx (Expo / React Native)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from "react-native";

/** ---- Lightweight Card primitives ---- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function CardHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardHeader}>{children}</View>;
}
function CardTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardTitle}>{children}</Text>;
}
function CardDescription({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cardDescription}>{children}</Text>;
}
function CardContent({ children }: { children: React.ReactNode }) {
  return <View style={styles.cardContent}>{children}</View>;
}

/** ---- Screen ---- */
export default function RawMaterialRequestsScreen() {
  const [material, setMaterial] = useState("");
  const [quantity, setQuantity] = useState("");
  const qtyNum = parseInt(quantity || "0", 10);
  const canSubmit = material.trim().length > 0 && qtyNum > 0;

  const onSubmit = () => {
    if (!canSubmit) return;
    // TODO: Hook to API here with fetch(...)
    Alert.alert("Request submitted", `${material} × ${qtyNum}`);
    setMaterial("");
    setQuantity("");
  };

  const onChangeQty = (t: string) => {
    // keep numeric only
    const cleaned = t.replace(/[^\d]/g, "");
    setQuantity(cleaned);
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.h1}>Raw Material Requests</Text>

      <Card>
        <CardHeader>
          <CardTitle>Request Materials</CardTitle>
          <CardDescription>Request raw materials for cooking</CardDescription>
        </CardHeader>

        <CardContent>
          <View style={{ gap: 10 }}>
            <TextInput
              placeholder="Material name"
              placeholderTextColor="#9ca3af"
              value={material}
              onChangeText={setMaterial}
              style={styles.input}
              autoCapitalize="words"
            />
            <TextInput
              placeholder="Quantity"
              placeholderTextColor="#9ca3af"
              value={quantity}
              onChangeText={onChangeQty}
              keyboardType="number-pad"
              inputMode="numeric"
              style={styles.input}
            />

            <Pressable
              disabled={!canSubmit}
              onPress={onSubmit}
              style={({ pressed }) => [
                styles.button,
                (!canSubmit || pressed) && { opacity: 0.8 },
                !canSubmit && styles.buttonDisabled,
              ]}
            >
              <Text style={styles.buttonText}>Submit Request</Text>
            </Pressable>
          </View>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

/** ---- Styles ---- */
const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "#f9fafb",
    gap: 12,
  },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eceff3",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardDescription: {
    marginTop: 4,
    color: "#6b7280",
    fontSize: 12,
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
  },

  button: {
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonDisabled: { backgroundColor: "#9ca3af" },
  buttonText: { color: "#ffffff", fontWeight: "800", letterSpacing: 0.3 },
});
