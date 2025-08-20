// app/features/cook/CookOverview.tsx (Expo / React Native)

import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

/* ---- Lightweight Card primitives (same pattern as your analytics.tsx) ---- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function CardHeader({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <View style={styles.cardTopRow}>
      <Text style={styles.cardTitle}>{title}</Text>
      {right ?? null}
    </View>
  );
}

/* ---- Screen ---- */
export default function CookOverviewScreen() {
  const stats: Array<{
    title: string;
    value: string;
    icon: React.ReactNode;
  }> = [
    { title: "Menu Items", value: "12", icon: <MaterialCommunityIcons name="chef-hat" size={16} color="#111827" /> },
    { title: "In Preparation", value: "4", icon: <Feather name="clock" size={16} color="#f59e0b" /> },
    { title: "Ready to Pick", value: "8", icon: <Feather name="package" size={16} color="#10b981" /> },
    { title: "Today's Special", value: "2", icon: <Feather name="star" size={16} color="#8b5cf6" /> },
  ];

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>Cook Dashboard</Text>
        <Text style={styles.subtle}>Manage your kitchen operations</Text>
      </View>

      {/* SOS: clearly visible, inline below header */}
      <Pressable
        onPress={() => Alert.alert("SOS Sent", "Your emergency alert has been sent to the supervisor.")}
        style={({ pressed }) => [styles.sosBtn, pressed && { opacity: 0.9 }]}
      >
        <Feather name="alert-triangle" size={16} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      {/* Stats grid */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <Card key={s.title} style={styles.statCard}>
            <CardHeader title={s.title} right={s.icon} />
            <Text style={styles.metric}>{s.value}</Text>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },

  /* card base */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#eceff3",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1f2937" },

  metric: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 6 },

  /* 2-col stats grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  statCard: { width: "48%", marginBottom: 12 },

  /* SOS button */
  sosBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#dc2626",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
  },
  sosText: { color: "#fff", fontWeight: "800", marginLeft: 8, letterSpacing: 0.3 },
});
