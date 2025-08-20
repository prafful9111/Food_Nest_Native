// app/features/refill/InventoryStatus.tsx (Expo / React Native)

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* -------- Types -------- */
type Trend = "up" | "down" | "stable";
type StockState = "critical" | "low" | "good" | "medium";

interface RiderDist {
  rider: string;
  allocated: number;
  remaining: number;
}
interface ItemRow {
  item: string;
  currentStock: number;
  targetStock: number;
  minThreshold: number;
  riderDistribution: RiderDist[];
  kitchenReady: number;
  inPreparation: number;
  lastUpdated: string;
  trend: Trend;
}

/* -------- Data (parity with web) -------- */
const inventoryData: ItemRow[] = [
  {
    item: "Poha",
    currentStock: 45,
    targetStock: 100,
    minThreshold: 20,
    riderDistribution: [
      { rider: "Mike Thompson", allocated: 8, remaining: 5 },
      { rider: "Sarah Wilson", allocated: 12, remaining: 8 },
      { rider: "David Chen", allocated: 10, remaining: 3 },
      { rider: "Lisa Rodriguez", allocated: 15, remaining: 12 },
    ],
    kitchenReady: 15,
    inPreparation: 20,
    lastUpdated: "10 mins ago",
    trend: "down",
  },
  {
    item: "Vada Pav",
    currentStock: 25,
    targetStock: 80,
    minThreshold: 15,
    riderDistribution: [
      { rider: "Mike Thompson", allocated: 15, remaining: 5 },
      { rider: "Sarah Wilson", allocated: 10, remaining: 8 },
      { rider: "David Chen", allocated: 8, remaining: 2 },
      { rider: "Lisa Rodriguez", allocated: 12, remaining: 10 },
    ],
    kitchenReady: 8,
    inPreparation: 25,
    lastUpdated: "5 mins ago",
    trend: "down",
  },
  {
    item: "Chai",
    currentStock: 120,
    targetStock: 150,
    minThreshold: 30,
    riderDistribution: [
      { rider: "Mike Thompson", allocated: 25, remaining: 20 },
      { rider: "Sarah Wilson", allocated: 20, remaining: 8 },
      { rider: "David Chen", allocated: 22, remaining: 18 },
      { rider: "Lisa Rodriguez", allocated: 28, remaining: 25 },
    ],
    kitchenReady: 35,
    inPreparation: 15,
    lastUpdated: "2 mins ago",
    trend: "up",
  },
  {
    item: "Water Bottle",
    currentStock: 200,
    targetStock: 200,
    minThreshold: 50,
    riderDistribution: [
      { rider: "Mike Thompson", allocated: 40, remaining: 35 },
      { rider: "Sarah Wilson", allocated: 35, remaining: 15 },
      { rider: "David Chen", allocated: 30, remaining: 25 },
      { rider: "Lisa Rodriguez", allocated: 45, remaining: 40 },
    ],
    kitchenReady: 85,
    inPreparation: 0,
    lastUpdated: "1 min ago",
    trend: "stable",
  },
];

/* -------- Tiny UI primitives -------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({
  label,
  bg,
  fg,
  outline,
}: {
  label: string;
  bg?: string;
  fg?: string;
  outline?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        outline && styles.badgeOutline,
        bg && { backgroundColor: bg },
      ]}
    >
      <Text style={[styles.badgeText, fg && { color: fg }, outline && { color: "#111827" }]}>
        {label}
      </Text>
    </View>
  );
}
function StatChip({
  value,
  label,
  valueColor,
}: {
  value: string | number;
  label: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.statChip}>
      <Text style={[styles.statValue, valueColor && { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

/* -------- Helpers -------- */
const stockState = (current: number, target: number, min: number): { state: StockState; bg: string; fg: string } => {
  if (current <= min) return { state: "critical", bg: "#fee2e2", fg: "#991b1b" };
  if (current <= target * 0.5) return { state: "low", bg: "#fef3c7", fg: "#92400e" };
  if (current >= target * 0.8) return { state: "good", bg: "#dcfce7", fg: "#166534" };
  return { state: "medium", bg: "#e0e7ff", fg: "#3730a3" };
};
const trendIcon = (t: Trend) => {
  switch (t) {
    case "up":
      return <Feather name="trending-up" size={14} color="#16a34a" />;
    case "down":
      return <Feather name="trending-down" size={14} color="#dc2626" />;
    default:
      return <View style={{ width: 14, height: 14 }} />;
  }
};

/* -------- Screen -------- */
export default function InventoryStatusScreen() {
  const onEmergencyRestock = (item: string) =>
    Alert.alert("Emergency Restock", `Requested emergency restock for ${item}.`);
  const onViewDetails = (item: string) => Alert.alert("Details", `Viewing details for ${item}.`);
  const onUpdateStock = (item: string) => Alert.alert("Update Stock", `Updating stock for ${item}.`);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View>
        <Text style={styles.h1}>Inventory Status</Text>
        <Text style={styles.subtle}>Real-time inventory levels and distribution</Text>
      </View>

      <View style={{ gap: 12 }}>
        {inventoryData.map((row) => {
          const s = stockState(row.currentStock, row.targetStock, row.minThreshold);
          const pct = (row.currentStock / row.targetStock) * 100;
          const barColor =
            s.state === "critical" ? "#dc2626" : s.state === "low" ? "#b45309" : "#16a34a";

          return (
            <Card key={row.item}>
              {/* Header */}
              <View style={styles.headerRow}>
                <View style={styles.headerLeft}>
                  <Feather name="box" size={18} color="#111827" />
                  <View>
                    <Text style={styles.itemTitle}>{row.item}</Text>
                    <Text style={styles.cardDesc}>Last updated {row.lastUpdated}</Text>
                  </View>
                </View>
                <View style={styles.headerRight}>
                  {trendIcon(row.trend)}
                  <Badge label={s.state} bg={s.bg} fg={s.fg} />
                </View>
              </View>

              {/* Stock overview */}
              <View style={styles.statsWrap}>
                <StatChip value={row.currentStock} label="Current Stock" />
                <StatChip value={row.kitchenReady} label="Kitchen Ready" valueColor="#16a34a" />
                <StatChip value={row.inPreparation} label="In Preparation" valueColor="#111827" />
                <StatChip value={row.targetStock} label="Target Stock" />
              </View>

              {/* Progress */}
              <View style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.small}>Stock Level</Text>
                  <Text style={styles.small}>{pct.toFixed(1)}% of target</Text>
                </View>
                <ProgressBar percent={pct} color={barColor} />
                <View style={styles.rowBetween}>
                  <Text style={styles.mutedXs}>Min: {row.minThreshold}</Text>
                  <Text style={styles.mutedXs}>Target: {row.targetStock}</Text>
                </View>
              </View>

              {/* Rider Distribution */}
              <View style={{ marginTop: 6 }}>
                <View style={styles.rowCenter}>
                  <Feather name="alert-triangle" size={14} color="#111827" />
                  <Text style={[styles.sectionLabel, { marginLeft: 6 }]}>Rider Distribution</Text>
                </View>

                <View style={styles.distGrid}>
                  {row.riderDistribution.map((d) => (
                    <View key={d.rider} style={styles.distCard}>
                      <View>
                        <Text style={styles.distName}>{d.rider}</Text>
                        <Text style={styles.mutedXs}>Allocated: {d.allocated}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={[
                            styles.distRemaining,
                            { color: d.remaining <= 5 ? "#dc2626" : "#16a34a" },
                          ]}
                        >
                          {d.remaining}
                        </Text>
                        <Text style={styles.mutedXs}>remaining</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Actions */}
              <View style={styles.actionsRow}>
                {row.currentStock <= row.minThreshold && (
                  <Pressable
                    onPress={() => onEmergencyRestock(row.item)}
                    style={({ pressed }) => [styles.btnDanger, pressed && { opacity: 0.9 }]}
                  >
                    <Feather name="alert-triangle" size={14} color="#fff" />
                    <Text style={styles.btnDangerText}>Request Emergency Restock</Text>
                  </Pressable>
                )}
                <Pressable
                  onPress={() => onViewDetails(row.item)}
                  style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.btnOutlineText}>View Details</Text>
                </Pressable>
                <Pressable
                  onPress={() => onUpdateStock(row.item)}
                  style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.9 }]}
                >
                  <Text style={styles.btnOutlineText}>Update Stock</Text>
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* -------- Styles -------- */
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
    gap: 10,
  },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },

  itemTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardDesc: { color: "#6b7280", fontSize: 12 },

  statsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statChip: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: "48%",
    flexGrow: 1,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: "#111827" },
  statLabel: { color: "#6b7280", fontSize: 12, marginTop: 2 },

  small: { fontSize: 12, color: "#111827" },
  mutedXs: { fontSize: 11, color: "#6b7280" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowCenter: { flexDirection: "row", alignItems: "center" },

  progressBg: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    overflow: "hidden",
  },
  progressFill: { height: 10, borderRadius: 999 },

  sectionLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },

  distGrid: { gap: 8, marginTop: 8 },
  distCard: {
    backgroundColor: "#f3f4f6",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  distName: { fontSize: 13, fontWeight: "600", color: "#111827" },
  distRemaining: { fontSize: 18, fontWeight: "800" },

  actionsRow: { flexDirection: "row", gap: 8, paddingTop: 4, flexWrap: "wrap" },

  btnDanger: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnDangerText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },

  btnOutline: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnOutlineText: { color: "#111827", fontWeight: "800" },

  /* Badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, color: "#111827" },
  badgeOutline: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#e5e7eb" },
});
