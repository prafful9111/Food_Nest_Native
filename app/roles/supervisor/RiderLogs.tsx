// screens/RiderLogs.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (from your web RiderLogs.tsx) ---------- */
const salesLogs = [
  { id: 1, rider: "John Smith", item: "Classic Burger", quantity: 2, amount: "17.98", location: "Central Park", time: "11:30 AM" },
  { id: 2, rider: "Mike Davis", item: "Chicken Tacos", quantity: 3, amount: "19.50", location: "Community Center", time: "11:45 AM" },
  { id: 3, rider: "Sarah Johnson", item: "Fish & Chips", quantity: 1, amount: "9.99", location: "Marina", time: "12:15 PM" },
  { id: 4, rider: "John Smith", item: "Caesar Salad", quantity: 1, amount: "7.99", location: "Business District", time: "12:30 PM" },
  { id: 5, rider: "Mike Davis", item: "Classic Burger", quantity: 4, amount: "35.96", location: "Local School", time: "12:45 PM" },
];

const spoilageReports = [
  { id: 1, rider: "Mike Davis", item: "Fish & Chips", quantity: 2, reason: "Exceeded temperature limit", time: "10:30 AM", action: "Disposed" },
  { id: 2, rider: "Sarah Johnson", item: "Caesar Salad", quantity: 1, reason: "Past expiration time", time: "02:15 PM", action: "Disposed" },
  { id: 3, rider: "John Smith", item: "Chicken Tacos", quantity: 1, reason: "Dropped during handling", time: "03:30 PM", action: "Disposed" },
];

const requests = [
  { id: 1, rider: "John Smith", item: "Classic Burger", quantity: 10, reason: "High demand in business district", status: "Pending", time: "1 hour ago" },
  { id: 2, rider: "Mike Davis", item: "Chicken Tacos", quantity: 15, reason: "Running low, lunch rush expected", status: "Approved", time: "2 hours ago" },
  { id: 3, rider: "Sarah Johnson", item: "Fish & Chips", quantity: 8, reason: "Popular item at beach location", status: "Pending", time: "3 hours ago" },
];

/* ---------- helpers ---------- */
const toINR = (numStr: string) => {
  const n = Number(String(numStr).replace(/[^\d.]/g, ""));
  return isNaN(n) ? "" : `INR ${Math.round(n * 2.5)}`;
};

function tone(name: "success" | "primary" | "warning" | "accent" | "destructive") {
  switch (name) {
    case "success": return "#059669";
    case "primary": return "#2563eb";
    case "warning": return "#d97706";
    case "accent": return "#7c3aed";
    case "destructive": return "#dc2626";
  }
}

/* ---------- small Badge component (same pattern as other screens) ---------- */
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
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>{text}</Text>
    </View>
  );
}

/* ---------- segmented control ---------- */
const segments = [
  { key: "sales", label: "Sales Activity", icon: "dollar-sign" as const },
  { key: "spoilage", label: "Spoilage Reports", icon: "alert-triangle" as const },
  { key: "requests", label: "Food Requests", icon: "user" as const },
];

export default function RiderLogsScreen() {
  const [tab, setTab] = useState<"sales" | "spoilage" | "requests">("sales");

  const headerTitle = useMemo(() => {
    if (tab === "sales") return "Sales Activity Log";
    if (tab === "spoilage") return "Food Spoilage Reports";
    return "Food Requests from Riders";
  }, [tab]);

  const headerSubtitle = useMemo(() => {
    if (tab === "sales") return "Recent sales transactions from all riders";
    if (tab === "spoilage") return "Items reported as spoiled or damaged";
    return "Requests for additional food items";
  }, [tab]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Rider Logs</Text>
        <Text style={styles.subtle}>Monitor rider activities, sales, and requests</Text>
      </View>

      {/* Segmented control */}
      <View style={styles.segmentWrap}>
        {segments.map(s => {
          const active = tab === s.key;
          return (
            <Pressable
              key={s.key}
              onPress={() => setTab(s.key as any)}
              style={({ pressed }) => [
                styles.segment,
                active && styles.segmentActive,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Feather
                name={s.icon}
                size={14}
                color={active ? "#111827" : "#6b7280"}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Card */}
      <View style={styles.card}>
        <View style={{ marginBottom: 8 }}>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            {tab === "sales" && <Feather name="dollar-sign" size={18} />}
            {tab === "spoilage" && <Feather name="alert-triangle" size={18} />}
            {tab === "requests" && <Feather name="user" size={18} />}
            <Text style={styles.sectionTitle}>{headerTitle}</Text>
          </View>
          <Text style={styles.subtle}>{headerSubtitle}</Text>
        </View>

        {/* "Table" header */}
        {tab === "sales" && (
          <View style={styles.listWrap}>
            <HeaderRow columns={["Rider", "Item", "Qty", "Amount", "Location", "Time"]} />
            {salesLogs.map((log, idx) => (
              <View key={log.id}>
                <View style={styles.listRow}>
                  <Text style={[styles.cell, styles.cellBold, { flex: 1.2 }]}>{log.rider}</Text>
                  <Text style={[styles.cell, { flex: 1.1 }]}>{log.item}</Text>
                  <Text style={[styles.cell, { width: 36, textAlign: "center" }]}>{log.quantity}</Text>
                  <View style={[styles.cell, { flex: 1.1 }]}>
                    <Text style={{ fontWeight: "700" }}>฿{log.amount}</Text>
                    <Text style={styles.subtleSmall}>{toINR(log.amount)}</Text>
                  </View>
                  <View style={[styles.cell, { flex: 1.2, flexDirection: "row", alignItems: "center", gap: 4 }]}>
                    <Feather name="map-pin" size={12} />
                    <Text>{log.location}</Text>
                  </View>
                  <Text style={[styles.cell, styles.subtleSmall, { width: 72, textAlign: "right" }]}>{log.time}</Text>
                </View>
                {idx < salesLogs.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        )}

        {tab === "spoilage" && (
          <View style={styles.listWrap}>
            <HeaderRow columns={["Rider", "Item", "Qty", "Reason", "Action", "Time"]} />
            {spoilageReports.map((r, idx) => (
              <View key={r.id}>
                <View style={styles.listRow}>
                  <Text style={[styles.cell, styles.cellBold, { flex: 1.2 }]}>{r.rider}</Text>
                  <Text style={[styles.cell, { flex: 1.1 }]}>{r.item}</Text>
                  <Text style={[styles.cell, { width: 36, textAlign: "center" }]}>{r.quantity}</Text>
                  <Text style={[styles.cell, { flex: 1.5 }]}>{r.reason}</Text>
                  <View style={[styles.cell, { width: 84, alignItems: "flex-start" }]}>
                    <Badge text={r.action} variant="solid" color={tone("destructive")} />
                  </View>
                  <Text style={[styles.cell, styles.subtleSmall, { width: 72, textAlign: "right" }]}>{r.time}</Text>
                </View>
                {idx < spoilageReports.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        )}

        {tab === "requests" && (
          <View style={styles.listWrap}>
            <HeaderRow columns={["Rider", "Item", "Qty", "Reason", "Status", "Time"]} />
            {requests.map((rq, idx) => (
              <View key={rq.id}>
                <View style={styles.listRow}>
                  <Text style={[styles.cell, styles.cellBold, { flex: 1.2 }]}>{rq.rider}</Text>
                  <Text style={[styles.cell, { flex: 1.1 }]}>{rq.item}</Text>
                  <Text style={[styles.cell, { width: 36, textAlign: "center" }]}>{rq.quantity}</Text>
                  <Text style={[styles.cell, { flex: 1.5 }]}>{rq.reason}</Text>
                  <View style={[styles.cell, { width: 92, alignItems: "flex-start" }]}>
                    <Badge
                      text={rq.status}
                      variant="solid"
                      color={rq.status === "Approved" ? tone("success") : tone("warning")}
                    />
                  </View>
                  <Text style={[styles.cell, styles.subtleSmall, { width: 72, textAlign: "right" }]}>{rq.time}</Text>
                </View>
                {idx < requests.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ---------- header row component ---------- */
function HeaderRow({ columns }: { columns: string[] }) {
  return (
    <View style={[styles.listRow, { backgroundColor: "#f8fafc" }]}>
      {columns.map((c, i) => (
        <Text
          key={c + i}
          style={[
            styles.headerCell,
            i === 0 ? { flex: 1.2 } :
            c === "Qty" ? { width: 36, textAlign: "center" } :
            c === "Amount" ? { flex: 1.1 } :
            c === "Location" ? { flex: 1.2 } :
            c === "Reason" ? { flex: 1.5 } :
            (c === "Action" ? { width: 84 } : (c === "Status" ? { width: 92 } : { width: 72, textAlign: "right" })),
          ]}
          numberOfLines={1}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

/* ---------- styles (aligned to your overview.tsx look) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },

  /* card */
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

  /* segmented control */
  segmentWrap: {
    backgroundColor: "#f3f4f6",
    padding: 6,
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  segment: {
    flex: 1,
    backgroundColor: "transparent",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  segmentActive: { backgroundColor: "#fff" },
  segmentText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  segmentTextActive: { color: "#111827" },

  /* list/table */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  cell: { fontSize: 13, color: "#111827", marginRight: 8 },
  cellBold: { fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#eef1f5" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
});
