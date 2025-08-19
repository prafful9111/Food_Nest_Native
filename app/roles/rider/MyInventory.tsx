// screens/MyInventory.tsx
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, Image, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (parity with your web MyInventory.tsx) ---------- */
type InvItem = {
  id: number;
  name: string;
  assigned: number;
  sold: number;
  remaining: number;
  price: number; // THB
  status: "good" | "low" | "critical";
  image?: string;
};

const inventoryItems: InvItem[] = [
  { id: 1, name: "Classic Burger", assigned: 20, sold: 12, remaining: 8, price: 8.99, status: "low", image: undefined },
  { id: 2, name: "Poha",           assigned: 15, sold: 8,  remaining: 7, price: 6.5,  status: "good", image: undefined },
  { id: 3, name: "Fish & Chips",   assigned: 10, sold: 6,  remaining: 4, price: 9.99, status: "critical", image: undefined },
  { id: 4, name: "Caesar Salad",   assigned: 8,  sold: 3,  remaining: 5, price: 7.99, status: "good", image: undefined },
];

/* ---------- tiny UI atoms ---------- */
function Badge({
  text,
  variant = "outline",
  color = "#2563eb",
}: { text: string; variant?: "solid" | "outline"; color?: string }) {
  const solid = variant === "solid";
  return (
    <View style={[
      styles.badge,
      { backgroundColor: solid ? color : "transparent", borderColor: color }
    ]}>
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/* ---------- helpers ---------- */
const tone = {
  primary: "#2563eb",
  success: "#059669",
  warning: "#d97706",
  destructive: "#dc2626",
  gray: "#6b7280",
} as const;

const statusColor = (s: InvItem["status"]) =>
  s === "critical" ? tone.destructive : s === "low" ? tone.warning : tone.success;

const progressPct = (sold: number, assigned: number) => (sold / Math.max(assigned, 1)) * 100;
const toINR = (thb: number) => `INR ${Math.round(thb * 2.5)}`;

/* ---------- screen ---------- */
export default function MyInventoryScreen() {
  const totalRemainingValue = useMemo(
    () => inventoryItems.reduce((sum, it) => sum + it.remaining * it.price, 0),
    []
  );
  const totalSalesValue = useMemo(
    () => inventoryItems.reduce((sum, it) => sum + it.sold * it.price, 0),
    []
  );
  const totalItemsLeft = useMemo(
    () => inventoryItems.reduce((s, it) => s + it.remaining, 0),
    []
  );

  const critical = inventoryItems.filter(i => i.status === "critical");
  const low = inventoryItems.filter(i => i.status === "low");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>My Inventory</Text>
        <Text style={styles.subtle}>Manage your cart's food inventory</Text>
      </View>

      {/* Top stats (3 cards) */}
      <View style={styles.statsRow}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Remaining Value</Text>
            <Feather name="package" size={16} color={tone.primary} />
          </View>
          <Text style={[styles.statBig, { color: tone.primary }]}>
            ฿{totalRemainingValue.toFixed(2)} <Text style={styles.inr}>{toINR(totalRemainingValue)}</Text>
          </Text>
          <Text style={styles.subtleSmall}>Current inventory value</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sales Value</Text>
            <Feather name="trending-up" size={16} color={tone.success} />
          </View>
          <Text style={[styles.statBig, { color: tone.success }]}>
            ฿{totalSalesValue.toFixed(2)} <Text style={styles.inr}>{toINR(totalSalesValue)}</Text>
          </Text>
          <Text style={styles.subtleSmall}>Value of items sold</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Items Remaining</Text>
            <Feather name="archive" size={16} color={tone.primary} />
          </View>
          <Text style={styles.statBig}>{totalItemsLeft}</Text>
          <Text style={styles.subtleSmall}>Total items left</Text>
        </View>
      </View>

      {/* Item cards (two-column feel on wide screens, stacks on phone) */}
      <View style={{ gap: 12 }}>
        {inventoryItems.map((item) => (
          <View key={item.id} style={styles.card}>
            {/* Header row */}
            <View style={[styles.row, { alignItems: "center", gap: 12 }]}>
              <View style={styles.thumb}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={{ width: "100%", height: "100%" }} />
                ) : (
                  <Feather name="image" size={20} color={tone.gray} />
                )}
              </View>

              <View style={{ flex: 1 }}>
                <View style={[styles.rowBetween, { alignItems: "center" }]}>
                  <View>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.subtleSmall}>฿{item.price.toFixed(2)} each <Text style={styles.inr}>{toINR(item.price)}</Text></Text>
                  </View>
                  <Badge
                    text={item.status}
                    variant="outline"
                    color={statusColor(item.status)}
                  />
                </View>
              </View>
            </View>

            {/* Stats grid */}
            <View style={styles.itemStatsGrid}>
              <StatCell label="Assigned" value={`${item.assigned}`} />
              <StatCell label="Sold" value={`${item.sold}`} valueColor={tone.success} />
              <StatCell label="Remaining" value={`${item.remaining}`} valueColor={tone.primary} />
            </View>

            {/* Progress */}
            <View style={{ marginTop: 8 }}>
              <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                <Text style={styles.subtleSmall}>Sales Progress</Text>
                <Text style={styles.subtleSmall}>{Math.round(progressPct(item.sold, item.assigned))}%</Text>
              </View>
              <ProgressBar value={progressPct(item.sold, item.assigned)} />
            </View>

            {/* Values */}
            <View style={[styles.rowBetween, { marginTop: 10 }]}>
              <Text style={styles.subtleSmall}>Remaining Value</Text>
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                ฿{(item.remaining * item.price).toFixed(2)} <Text style={styles.inr}>{toINR(item.remaining * item.price)}</Text>
              </Text>
            </View>
            <View style={[styles.rowBetween, { marginTop: 6 }]}>
              <Text style={styles.subtleSmall}>Price per Item</Text>
              <Text style={{ fontWeight: "700", color: "#111827" }}>
                ฿{item.price.toFixed(2)} <Text style={styles.inr}>{toINR(item.price)}</Text>
              </Text>
            </View>

            {/* Request More */}
            {item.remaining <= 3 && (
              <Pressable
                onPress={() => Alert.alert("Request More", `Ask cook for more ${item.name}`)}
                style={({ pressed }) => [styles.ghostBtn, { marginTop: 10 }, pressed && { opacity: 0.9 }]}
              >
                <Feather name="plus" size={14} style={{ marginRight: 6 }} />
                <Text style={styles.ghostBtnText}>Request More</Text>
              </Pressable>
            )}
          </View>
        ))}
      </View>

      {/* Summary card */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Inventory Summary</Text>
        <Text style={styles.subtle}>Overall inventory status & recommendations</Text>

        <View style={styles.summaryGrid}>
          {/* Critical */}
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Critical Items</Text>
            {critical.length === 0 ? (
              <Text style={styles.subtleSmall}>None</Text>
            ) : (
              critical.map((it) => (
                <View key={it.id} style={[styles.summaryRow, { backgroundColor: "rgba(220,38,38,0.08)", borderColor: "rgba(220,38,38,0.25)" }]}>
                  <Text style={styles.summaryItem}>{it.name}</Text>
                  <Badge text={`${it.remaining} left`} variant="solid" color={tone.destructive} />
                </View>
              ))
            )}
          </View>

          {/* Low */}
          <View style={{ flex: 1 }}>
            <Text style={styles.summaryTitle}>Low Stock Items</Text>
            {low.length === 0 ? (
              <Text style={styles.subtleSmall}>None</Text>
            ) : (
              low.map((it) => (
                <View key={it.id} style={[styles.summaryRow, { backgroundColor: "rgba(217,119,6,0.08)", borderColor: "rgba(217,119,6,0.25)" }]}>
                  <Text style={styles.summaryItem}>{it.name}</Text>
                  <Badge text={`${it.remaining} left`} variant="solid" color={tone.warning} />
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- small subcomponent ---------- */
function StatCell({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={styles.subtleSmall}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

/* ---------- styles (aligned with your other screens) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },
  inr: { fontSize: 11, color: "#6b7280" },

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between" },

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
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#374151" },

  /* top stats */
  statsRow: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  statBig: { fontSize: 18, fontWeight: "800", color: "#111827" },

  /* item block */
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f3f4f6",
  },
  itemTitle: { fontWeight: "800", color: "#111827", fontSize: 15 },
  itemStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },

  /* list / table look */
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "#f1f5f9", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#2563eb" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* stat value (reused) */
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },

  /* summary */
  summaryGrid: { flexDirection: "row", gap: 12, marginTop: 10, flexWrap: "wrap" },
  summaryTitle: { fontSize: 13, fontWeight: "700", color: "#111827", marginBottom: 6 },
  summaryRow: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  summaryItem: { fontSize: 13, color: "#111827", fontWeight: "600" },

  /* ghost button */
  ghostBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  ghostBtnText: { color: "#111827", fontWeight: "800", fontSize: 12 },
});
