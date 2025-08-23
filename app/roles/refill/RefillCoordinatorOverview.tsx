// app/features/refill/RefillCoordinatorOverview.tsx (Expo / React Native)

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

 

/* ---------- Types ---------- */
type Priority = "high" | "medium" | "low";
type InvStatus = "critical" | "low" | "good";

/* ---------- Data ---------- */
const stats = {
  pendingRequests: 12,
  completedToday: 8,
  lowStockItems: 3,
  activeCooks: 4,
};

const urgentRequests: Array<{
  rider: string;
  item: string;
  quantity: number;
  location: string;
  time: string;
  priority: Priority;
}> = [
  { rider: "Mike Thompson", item: "Vada Pav", quantity: 15, location: "Route A", time: "10 mins ago", priority: "high" },
  { rider: "Sarah Wilson", item: "Chai", quantity: 20, location: "Route B", time: "15 mins ago", priority: "medium" },
  { rider: "David Chen", item: "Poha", quantity: 8, location: "Route C", time: "20 mins ago", priority: "high" },
];

const inventoryStatus: Array<{
  item: string;
  current: number;
  target: number;
  status: InvStatus;
}> = [
  { item: "Poha", current: 45, target: 100, status: "low" },
  { item: "Vada Pav", current: 25, target: 80, status: "critical" },
  { item: "Chai", current: 120, target: 150, status: "good" },
  { item: "Water Bottle", current: 200, target: 200, status: "good" },
];

/* ---------- Tiny UI primitives ---------- */
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
      <Text style={[styles.badgeText, fg && { color: fg }]}>{label}</Text>
    </View>
  );
}

/* ---------- Helpers ---------- */
const statusColors = (s: InvStatus) => {
  switch (s) {
    case "critical":
      return { bg: "#fee2e2", fg: "#991b1b" }; // red
    case "low":
      return { bg: "#fef3c7", fg: "#92400e" }; // amber
    case "good":
    default:
      return { bg: "#dcfce7", fg: "#166534" }; // green
  }
};
const priorityColors = (p: Priority) => {
  switch (p) {
    case "high":
      return { bg: "#fee2e2", fg: "#991b1b" };
    case "medium":
      return { bg: "#fef3c7", fg: "#92400e" };
    case "low":
    default:
      return { bg: "#dcfce7", fg: "#166534" };
  }
};

/* ---------- Screen ---------- */
export default function RefillCoordinatorOverviewScreen() {
  const handleFulfill = (rider: string, item: string) => {
    Alert.alert("Fulfillment started", `Assigning refill for ${rider} • ${item}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>Refill Coordinator Dashboard</Text>
        <Text style={styles.subtle}>
          Manage refill requests and coordinate with kitchen
        </Text>
      </View>



      {/* Inline SOS button */}
      <Pressable
        onPress={() => Alert.alert("SOS Sent", "Your emergency alert has been sent.")}
        style={({ pressed }) => [styles.sosBtn, pressed && { opacity: 0.9 }]}
      >
        <Feather name="alert-triangle" size={16} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      {/* KPI Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Pending Requests</Text>
            <Feather name="clock" size={14} color="#b45309" />
          </View>
          <Text style={[styles.kpiValue, { color: "#b45309" }]}>
            {stats.pendingRequests}
          </Text>
          <Text style={styles.kpiSubtle}>Awaiting fulfillment</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Completed Today</Text>
            <Feather name="check-circle" size={14} color="#10b981" />
          </View>
          <Text style={[styles.kpiValue, { color: "#10b981" }]}>
            {stats.completedToday}
          </Text>
          <Text style={styles.kpiSubtle}>Requests fulfilled</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Low Stock Items</Text>
            <Feather name="alert-triangle" size={14} color="#dc2626" />
          </View>
          <Text style={[styles.kpiValue, { color: "#dc2626" }]}>
            {stats.lowStockItems}
          </Text>
          <Text style={styles.kpiSubtle}>Need attention</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Active Cooks</Text>
            <Feather name="users" size={14} color="#111827" />
          </View>
          <Text style={styles.kpiValue}>{stats.activeCooks}</Text>
          <Text style={styles.kpiSubtle}>On duty now</Text>
        </Card>
      </View>

      {/* ===== Stacked sections (each full width, in order) ===== */}

      {/* Urgent Refill Requests (row 1) */}
      <Card>
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.sectionTitle}>Urgent Refill Requests</Text>
          <Text style={styles.sectionDesc}>
            High priority requests requiring immediate attention
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          {urgentRequests.map((req, idx) => {
            const pc = priorityColors(req.priority);
            return (
              <View key={`${req.rider}-${idx}`} style={styles.requestRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.requestTitleRow}>
                    <Text style={styles.requestRider}>{req.rider}</Text>
                    <Badge label={req.priority} bg={pc.bg} fg={pc.fg} />
                  </View>
                  <Text style={styles.requestMeta}>
                    {req.quantity}x {req.item} • {req.location}
                  </Text>
                  <Text style={styles.requestTime}>{req.time}</Text>
                </View>

                <Pressable
                  onPress={() => handleFulfill(req.rider, req.item)}
                  style={({ pressed }) => [
                    styles.btnPrimary,
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Text style={styles.btnPrimaryText}>Fulfill</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Inventory Status (row 2) */}
      <Card>
        <View style={{ marginBottom: 4 }}>
          <Text style={styles.sectionTitle}>Inventory Status</Text>
          <Text style={styles.sectionDesc}>
            Current stock levels vs targets
          </Text>
        </View>

        <View style={{ gap: 12 }}>
          {inventoryStatus.map((it) => {
            const sc = statusColors(it.status);
            const pct =
              it.target > 0
                ? Math.max(0, Math.min(100, Math.round((it.current / it.target) * 100)))
                : 0;
            const barColor =
              it.status === "critical"
                ? "#dc2626"
                : it.status === "low"
                ? "#b45309"
                : "#16a34a";

            return (
              <View key={it.item} style={{ gap: 6 }}>
                <View style={styles.invTopRow}>
                  <View>
                    <Text style={styles.invItemName}>{it.item}</Text>
                    <Text style={styles.invMeta}>
                      {it.current}/{it.target} units
                    </Text>
                  </View>
                  <Badge label={it.status} bg={sc.bg} fg={sc.fg} />
                </View>

                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 28, backgroundColor: "#f9fafb", gap: 12 },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },

  /* SOS */
  sosBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#dc2626",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#dc2626",
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  sosText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },

  /* Cards */
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
    gap: 8,
  },

  /* KPI grid */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: { width: "48%" },
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitleSm: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  kpiValue: { fontSize: 22, fontWeight: "800", color: "#111827" },
  kpiSubtle: { color: "#6b7280", fontSize: 12 },

  /* Sections */
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
  sectionDesc: { color: "#6b7280", fontSize: 12 },

  /* Badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
  },
  badgeText: { fontSize: 12, color: "#111827" },
  badgeOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },

  /* Requests */
  requestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#f3f4f6",
    padding: 10,
    borderRadius: 10,
  },
  requestTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  requestRider: { fontSize: 14, fontWeight: "600", color: "#111827" },
  requestMeta: { color: "#6b7280", fontSize: 12, marginTop: 2 },
  requestTime: { color: "#9ca3af", fontSize: 11, marginTop: 2 },

  btnPrimary: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },

  /* Inventory */
  invTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  invItemName: { fontSize: 14, fontWeight: "600", color: "#111827" },
  invMeta: { color: "#6b7280", fontSize: 12 },
  barBg: { backgroundColor: "#e5e7eb", height: 8, borderRadius: 999, overflow: "hidden" },
  barFill: { height: 8, borderRadius: 999 },

});
