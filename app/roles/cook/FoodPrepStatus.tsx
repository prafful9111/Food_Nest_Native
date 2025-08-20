// app/features/cook/FoodPrepStatus.tsx (Expo / React Native)

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

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
export default function FoodPrepStatusScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>Food Prep Status</Text>
      </View>

      <Card>
        <CardHeader>
          <CardTitle>Current Preparation Queue</CardTitle>
          <CardDescription>Track food preparation progress</CardDescription>
        </CardHeader>

        <CardContent>
          <Text style={styles.bodyText}>Food preparation tracking interface</Text>
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

  bodyText: { color: "#374151", fontSize: 14 },
});
