// screens/SupervisorOverview.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";   

type Stat = {
  title: string;
  value: string;
  icon: keyof typeof Feather.glyphMap;
  color: "primary" | "success" | "warning" | "accent";
};

type Rider = {
  name: string;
  route: string;
  status: "Active" | "On Break";
  location: string;
  sales: string; // e.g., "฿245"
};

type AlertItem = {
  type: "Low Stock" | "Request" | "Route";
  message: string;
  time: string;
  severity: "high" | "medium" | "low";
};

const stats: Stat[] = [
  { title: "Active Riders", value: "6",  icon: "users",        color: "primary" },
  { title: "Routes Today",  value: "8",  icon: "truck",        color: "success" },
  { title: "Inventory Alerts", value: "3", icon: "alert-circle", color: "warning" },
  { title: "Total Orders",  value: "124", icon: "package",     color: "accent" },
];

const activeRiders: Rider[] = [
  { name: "John Smith",  route: "Downtown A", status: "Active",   location: "Central Park", sales: "฿245" },
  { name: "Mike Davis",  route: "Suburban B", status: "Active",   location: "Shopping Mall", sales: "฿189" },
  { name: "Sarah Johnson", route: "Beach C", status: "On Break", location: "Marina", sales: "฿156" },
];

const recentAlerts: AlertItem[] = [
  { type: "Low Stock", message: "Burger patties running low in Downtown A", time: "10 min ago", severity: "high" },
  { type: "Request",   message: "Mike requested additional chicken breast",   time: "25 min ago", severity: "medium" },
  { type: "Route",     message: "Beach C route completed early",              time: "1 hour ago", severity: "low" },
];

export default function SupervisorOverview() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Supervisor Dashboard</Text>
        <Text style={styles.subtle}>Monitor operations and manage your team</Text>
      </View>


      {/* SOS Button */}
      <Pressable
        onPress={() => Alert.alert("SOS Triggered", "Your emergency alert has been sent.")}
        style={({ pressed }) => [styles.sosBtn, pressed && { opacity: 0.9 }]}
      >
        <Feather name="alert-triangle" size={16} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

      {/* Stats grid (2 columns) */}
      <View style={{ gap: 12 }}>
        {chunk(stats, 2).map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((s) => (
              <View key={s.title} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{s.title}</Text>
                  <Feather name={s.icon} size={18} color={tone(s.color)} />
                </View>
                <Text style={styles.metric}>{s.value}</Text>
              </View>
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>

      {/* Two-column sections stacked (mobile) */}
      <View style={{ gap: 12 }}>
        {/* Active Riders */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="users" size={18} />
              <Text style={styles.sectionTitle}>Active Riders</Text>
            </View>
            <Text style={styles.subtle}>Current rider status and performance</Text>
          </View>

          <View style={styles.listWrap}>
            {activeRiders.map((r, idx) => (
              <View key={r.name}>
                <View style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLeft}>{r.name}</Text>
                    <Text style={styles.subtleSmall}>
                      {r.route} • {r.location}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Badge
                      variant={r.status === "Active" ? "solid" : "outline"}
                      color={r.status === "Active" ? "#059669" : "#6b7280"}
                      text={r.status}
                    />
                    <Text style={[styles.sales, { marginTop: 6 }]}>{r.sales}</Text>
                  </View>
                </View>
                {idx < activeRiders.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Alerts */}
        <View style={[styles.card, { flex: 1 }]}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="bell" size={18} />
              <Text style={styles.sectionTitle}>Recent Alerts</Text>
            </View>
            <Text style={styles.subtle}>Important notifications and updates</Text>
          </View>

          <View style={styles.listWrap}>
            {recentAlerts.map((a, idx) => (
              <View key={idx}>
                <View style={[styles.listRow, { alignItems: "flex-start" }]}>
                  <View style={{ flex: 1 }}>
                    <Badge
                      variant="outline"
                      color={severityColor(a.severity)}
                      text={a.type}
                    />
                    <Text style={[styles.alertMsg]}>{a.message}</Text>
                  </View>
                  <Text style={styles.listRight}>{a.time}</Text>
                </View>
                {idx < recentAlerts.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- Small Badge component ---------- */
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

/* ---------- helpers ---------- */
function chunk<T>(arr: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}
function tone(name: "success" | "primary" | "warning" | "accent") {
  switch (name) {
    case "success": return "#059669";
    case "primary": return "#2563eb";
    case "warning": return "#d97706";
    case "accent": return "#7c3aed";
  }
}
function severityColor(s: "high" | "medium" | "low") {
  if (s === "high") return "#dc2626";   // destructive
  if (s === "medium") return "#d97706"; // warning
  return "#059669";                     // success
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row", gap: 12 },

  card: {
    flex: 1,
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

  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  metric: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 6 },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listLeft: { fontWeight: "700", color: "#111827", marginBottom: 2 },
  listRight: { fontWeight: "600", color: "#374151", fontSize: 12 },

  divider: { height: 1, backgroundColor: "#eef1f5" },

  alertMsg: { marginTop: 6, color: "#111827" },
  sales: { fontWeight: "700", color: "#111827" },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  sosBtn: {
    alignSelf: "flex-start",
    flexDirection: "row",
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
  },
  sosText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },


});
