// app/features/cook/MyMenu.tsx (Expo / React Native)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Status = "Processing" | "Ready" | "Picked";

interface MenuItem {
  id: number;
  name: string;
  status: Status;
  quantity: number;
  prepTime: string;
  assigned: boolean;
}

const initialItems: MenuItem[] = [
  { id: 1, name: "Poha", status: "Processing", quantity: 20, prepTime: "15 min", assigned: true },
  { id: 2, name: "Vada Pav", status: "Ready", quantity: 15, prepTime: "10 min", assigned: true },
  { id: 3, name: "Chai", status: "Ready", quantity: 30, prepTime: "5 min", assigned: true },
  { id: 4, name: "Water Bottle", status: "Picked", quantity: 25, prepTime: "0 min", assigned: false },
];

/** ---------- Small primitives (Card, Badge) ---------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Badge({ status }: { status: Status }) {
  const { bg, fg } = getStatusColors(status);
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeText, { color: fg }]}>{status}</Text>
    </View>
  );
}

function getStatusColors(s: Status) {
  switch (s) {
    case "Ready":
      return { bg: "#E8FFF4", fg: "#047857" }; // green
    case "Processing":
      return { bg: "#FFF7E6", fg: "#B45309" }; // amber
    case "Picked":
    default:
      return { bg: "#F3F4F6", fg: "#374151" }; // gray
  }
}

/** ---------- Screen ---------- */
export default function MyMenuScreen() {
  const [items, setItems] = useState<MenuItem[]>(initialItems);

  const updateItemStatus = (itemId: number, newStatus: Status) => {
    setItems(prev => prev.map(it => (it.id === itemId ? { ...it, status: newStatus } : it)));
  };

  const updateItemQuantity = (itemId: number, text: string) => {
    const qty = parseInt(text, 10);
    setItems(prev =>
      prev.map(it => (it.id === itemId ? { ...it, quantity: Number.isNaN(qty) ? 0 : qty } : it))
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>My Menu</Text>
        <Text style={styles.subtle}>Manage your assigned food items and preparation status</Text>
      </View>

      <View style={{ gap: 12 }}>
        {items.map(item => (
          <Card key={item.id}>
            {/* Header row */}
            <View style={styles.headerRow}>
              <View style={{ flexShrink: 1 }}>
                <View style={styles.titleRow}>
                  <Feather name="package" size={18} color="#111827" />
                  <Text style={styles.title}>{item.name}</Text>
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaGroup}>
                    <Feather name="clock" size={14} color="#6b7280" />
                    <Text style={styles.metaText}>Prep time: {item.prepTime}</Text>
                  </View>
                  <Text style={styles.metaText}>Quantity: {item.quantity}</Text>
                </View>
              </View>

              <Badge status={item.status} />
            </View>

            {/* Controls grid */}
            <View style={styles.controlsGrid}>
              {/* Status (segmented) */}
              <View style={{ gap: 6 }}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.segment}>
                  {(["Processing", "Ready", "Picked"] as Status[]).map(opt => {
                    const active = item.status === opt;
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => updateItemStatus(item.id, opt)}
                        style={({ pressed }) => [
                          styles.segmentItem,
                          active && styles.segmentItemActive,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text
                          style={[
                            styles.segmentText,
                            active && styles.segmentTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Quantity */}
              <View style={{ gap: 6 }}>
                <Text style={styles.label}>Quantity to Prepare</Text>
                <TextInput
                  value={String(item.quantity)}
                  onChangeText={(t) => updateItemQuantity(item.id, t)}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  style={styles.input}
                  placeholder="0"
                />
              </View>

              {/* Prep Time (read-only) */}
              <View style={{ gap: 6 }}>
                <Text style={styles.label}>Prep Time Estimate</Text>
                <TextInput
                  value={item.prepTime}
                  editable={false}
                  style={[styles.input, styles.inputMuted]}
                  placeholder="e.g., 15 min"
                />
              </View>
            </View>
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}

/** ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 28, backgroundColor: "#f9fafb", gap: 12 },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },

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
    gap: 12,
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 16, marginTop: 6, flexWrap: "wrap" },
  metaGroup: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#6b7280", fontSize: 12 },

  badge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeText: { fontWeight: "700", fontSize: 12 },

  controlsGrid: { flexDirection: "column", gap: 12 },

  label: { fontSize: 12, fontWeight: "700", color: "#1f2937" },

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
  inputMuted: { backgroundColor: "#f3f4f6" },

  segment: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 4,
    gap: 6,
  },
  segmentItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "transparent",
  },
  segmentItemActive: {
    backgroundColor: "#111827",
  },
  segmentText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  segmentTextActive: { color: "#ffffff" },
});
