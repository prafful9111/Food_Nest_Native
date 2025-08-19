// screens/ViewInventory.tsx
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (parity with your web ViewInventory.tsx) ---------- */
type Item = { name: string; assigned: number; sold: number; remaining: number };
type RiderInventory = { rider: string; route: string; items: Item[] };

const riderInventories: RiderInventory[] = [
  {
    rider: "John Smith",
    route: "Downtown A",
    items: [
      { name: "Classic Burger", assigned: 20, sold: 12, remaining: 8 },
      { name: "Chicken Tacos", assigned: 15, sold: 8, remaining: 7 },
      { name: "Fish & Chips", assigned: 10, sold: 6, remaining: 4 },
      { name: "Caesar Salad", assigned: 8, sold: 3, remaining: 5 },
    ],
  },
  {
    rider: "Mike Davis",
    route: "Suburban B",
    items: [
      { name: "Classic Burger", assigned: 18, sold: 15, remaining: 3 },
      { name: "Chicken Tacos", assigned: 12, sold: 9, remaining: 3 },
      { name: "Fish & Chips", assigned: 8, sold: 8, remaining: 0 },
      { name: "Caesar Salad", assigned: 6, sold: 2, remaining: 4 },
    ],
  },
  {
    rider: "Sarah Johnson",
    route: "Beach C",
    items: [
      { name: "Classic Burger", assigned: 15, sold: 5, remaining: 10 },
      { name: "Chicken Tacos", assigned: 20, sold: 12, remaining: 8 },
      { name: "Fish & Chips", assigned: 12, sold: 4, remaining: 8 },
      { name: "Caesar Salad", assigned: 10, sold: 6, remaining: 4 },
    ],
  },
];

/* ---------- small Badge component ---------- */
function Badge({
  text,
  variant = "solid",
  color = "#2563eb",
}: {
  text: string;
  variant?: "solid" | "outline";
  color?: string;
}) {
  const solid = variant === "solid";
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: solid ? color : "transparent",
          borderColor: color,
        },
      ]}
    >
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}

/* ---------- tiny progress bar ---------- */
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
  success: "#059669",
  warning: "#d97706",
  destructive: "#dc2626",
  primary: "#2563eb",
} as const;

const statusColor = (remaining: number, assigned: number) => {
  const percentage = (remaining / Math.max(assigned, 1)) * 100;
  if (percentage <= 20) return tone.destructive;
  if (percentage <= 50) return tone.warning;
  return tone.success;
};

const progress = (sold: number, assigned: number) =>
  (sold / Math.max(assigned, 1)) * 100;

/* ---------- screen ---------- */
export default function ViewInventoryScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>View Inventory</Text>
        <Text style={styles.subtle}>Monitor rider inventory levels and sales progress</Text>
      </View>

      {/* Rider cards */}
      <View style={{ gap: 12 }}>
        {riderInventories.map((inv) => (
          <View key={inv.rider} style={styles.card}>
            {/* Card header */}
            <View style={{ marginBottom: 8 }}>
              <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                <Feather name="truck" size={18} />
                <Text style={styles.sectionTitle}>{inv.rider}</Text>
              </View>
              <View style={[styles.row, { alignItems: "center", gap: 6, marginTop: 4 }]}>
                <Feather name="package" size={14} color="#6b7280" />
                <Text style={styles.subtle}>{inv.route}</Text>
              </View>
            </View>

            {/* Items list */}
            <View style={styles.listWrap}>
              {inv.items.map((it, idx) => {
                const low = it.remaining <= it.assigned * 0.2 && it.remaining > 0;
                const oos = it.remaining === 0;
                const bar = progress(it.sold, it.assigned);
                const color = statusColor(it.remaining, it.assigned);

                return (
                  <View key={it.name}>
                    <View style={styles.listRow}>
                      {/* Left: name + badges */}
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                          <Text style={styles.listLeft}>{it.name}</Text>
                          {oos && (
                            <Badge
                              text="Out of Stock"
                              variant="solid"
                              color={tone.destructive}
                            />
                          )}
                          {!oos && low && (
                            <Badge text="Low Stock" variant="solid" color={tone.warning} />
                          )}
                        </View>

                        {/* Progress */}
                        <View style={{ marginTop: 8 }}>
                          <View style={[styles.row, { justifyContent: "space-between" }]}>
                            <Text style={styles.subtleSmall}>Sales Progress</Text>
                            <Text style={styles.subtleSmall}>{Math.round(bar)}%</Text>
                          </View>
                          <ProgressBar value={bar} />
                        </View>
                      </View>

                      {/* Right: numbers */}
                      <View style={{ width: 120, alignItems: "flex-end" }}>
                        <Text style={styles.rightTop}>
                          <Text style={{ color }}>{it.remaining}</Text> / {it.assigned} remaining
                        </Text>
                        <Text style={styles.subtleSmall}>{it.sold} sold</Text>
                      </View>
                    </View>

                    {idx < inv.items.length - 1 ? <View style={styles.divider} /> : null}
                  </View>
                );
              })}
            </View>

            {/* Totals */}
            <View style={{ paddingTop: 12 }}>
              <View style={styles.totalsGrid}>
                <TotalStat
                  label="Total Assigned"
                  value={useMemo(
                    () => inv.items.reduce((s, x) => s + x.assigned, 0),
                    [inv.items]
                  ).toString()}
                />
                <TotalStat
                  label="Total Sold"
                  value={useMemo(
                    () => inv.items.reduce((s, x) => s + x.sold, 0),
                    [inv.items]
                  ).toString()}
                  color={tone.success}
                />
                <TotalStat
                  label="Remaining"
                  value={useMemo(
                    () => inv.items.reduce((s, x) => s + x.remaining, 0),
                    [inv.items]
                  ).toString()}
                  color={tone.primary}
                />
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------- small total stat ---------- */
function TotalStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <View style={{ alignItems: "center", flex: 1 }}>
      <Text style={styles.totalLabel}>{label}</Text>
      <Text style={[styles.totalValue, color ? { color } : null]}>{value}</Text>
    </View>
  );
}

/* ---------- styles (aligned with your overview.tsx) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },

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

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  listLeft: { fontWeight: "700", color: "#111827" },
  rightTop: { fontSize: 12, fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#eef1f5" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  totalsGrid: {
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#eef1f5",
    paddingTop: 12,
  },
  totalLabel: { fontSize: 12, color: "#6b7280" },
  totalValue: { fontSize: 18, fontWeight: "800", color: "#111827", marginTop: 2 },

  /* progress */
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },
});
