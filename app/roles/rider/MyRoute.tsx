// screens/MyRoute.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (from your web file) ---------- */
const routeInfo = {
  name: "Downtown A",
  startTime: "09:00 AM",
  endTime: "01:00 PM",
  currentStop: 3,
  totalStops: 5,
  status: "Active",
};

const stops = [
  { id: 1, name: "City Hall", address: "123 Main St", status: "completed", arrivalTime: "09:15 AM", salesMade: 8, revenue: "฿67.50" },
  { id: 2, name: "Central Park", address: "456 Park Ave", status: "completed", arrivalTime: "10:30 AM", salesMade: 12, revenue: "฿98.25" },
  { id: 3, name: "Business District", address: "789 Commerce Blvd", status: "current", arrivalTime: "11:45 AM", salesMade: 6, revenue: "฿45.75" },
  { id: 4, name: "Shopping Mall", address: "321 Retail Way", status: "upcoming", estimatedTime: "12:30 PM", salesMade: 0, revenue: "฿0.00" },
  { id: 5, name: "University Campus", address: "654 Education Dr", status: "upcoming", estimatedTime: "01:15 PM", salesMade: 0, revenue: "฿0.00" },
];

/* ---------- helpers ---------- */
const tone = {
  success: "#059669",
  primary: "#2563eb",
  warning: "#d97706",
  gray: "#6b7280",
};

function statusBadge(status: string) {
  if (status === "completed") return { text: "Completed", color: tone.success, solid: true };
  if (status === "current") return { text: "Current", color: tone.primary, solid: true };
  return { text: "Upcoming", color: tone.gray, solid: false };
}

/* ---------- small Badge ---------- */
function Badge({ text, color, solid }: { text: string; color: string; solid: boolean }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: solid ? color : "transparent", borderColor: color },
      ]}
    >
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}

/* ---------- progress bar ---------- */
function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${value}%` }]} />
    </View>
  );
}

/* ---------- screen ---------- */
export default function MyRouteScreen() {
  const progressPct = (routeInfo.currentStop / routeInfo.totalStops) * 100;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>My Route</Text>
        <Text style={styles.subtle}>Your assigned route and current progress</Text>
      </View>

      {/* Route Card */}
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: 8 }]}>
          <View>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="map-pin" size={18} />
              <Text style={styles.sectionTitle}>{routeInfo.name}</Text>
            </View>
            <Text style={styles.subtleSmall}>
              {routeInfo.startTime} - {routeInfo.endTime} • Stop {routeInfo.currentStop} of {routeInfo.totalStops}
            </Text>
          </View>
          <Badge text={routeInfo.status} color={tone.success} solid />
        </View>

        <View>
          <View style={[styles.rowBetween, { marginBottom: 6 }]}>
            <Text style={styles.subtleSmall}>Route Progress</Text>
            <Text style={styles.subtleSmall}>
              {routeInfo.currentStop}/{routeInfo.totalStops} stops
            </Text>
          </View>
          <ProgressBar value={progressPct} />
        </View>
      </View>

      {/* Route Stops */}
      <View style={{ gap: 12 }}>
        <Text style={styles.sectionTitle}>Route Stops</Text>
        {stops.map((stop) => {
          const badge = statusBadge(stop.status);
          return (
            <View
              key={stop.id}
              style={[
                styles.card,
                stop.status === "current" && { borderColor: tone.primary, borderWidth: 2 },
              ]}
            >
              <View style={[styles.rowBetween, { marginBottom: 8 }]}>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.stopName}>{stop.name}</Text>
                  <Text style={styles.subtleSmall}>{stop.address}</Text>
                </View>
                <Badge text={badge.text} color={badge.color} solid={badge.solid} />
              </View>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.subtleSmall}>Time</Text>
                  <Text style={styles.statValue}>{stop.arrivalTime || stop.estimatedTime}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.subtleSmall}>Sales</Text>
                  <Text style={styles.statValue}>{stop.salesMade} items</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={[styles.statValue, { color: tone.success }]}>{stop.revenue}</Text>
                  <Text style={styles.subtleSmall}>Revenue</Text>
                </View>
                <View style={[styles.statBox, { flex: 1 }]}>
                  {stop.status === "current" && (
                    <Pressable style={styles.primaryBtn}>
                      <Text style={styles.primaryBtnText}>Mark Complete</Text>
                    </Pressable>
                  )}
                  {stop.status === "upcoming" && (
                    <Pressable style={styles.ghostBtn} disabled>
                      <Text style={styles.ghostBtnText}>Not Started</Text>
                    </Pressable>
                  )}
                  {stop.status === "completed" && (
                    <Pressable style={styles.ghostBtn} disabled>
                      <Text style={styles.ghostBtnText}>View Details</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Route Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Route Summary</Text>
        <Text style={styles.subtle}>Today's performance overview</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.subtleSmall}>Stops Completed</Text>
            <Text style={styles.statBig}>{stops.filter((s) => s.status === "completed").length}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.subtleSmall}>Total Sales</Text>
            <Text style={styles.statBig}>{stops.reduce((s, x) => s + x.salesMade, 0)}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statBig, { color: tone.success }]}>
              ฿{stops.reduce((s, x) => s + parseFloat(x.revenue.replace("฿", "")), 0).toFixed(2)}
            </Text>
            <Text style={styles.subtleSmall}>Total Revenue</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBig}>
              ฿
              {(
                stops.reduce((s, x) => s + parseFloat(x.revenue.replace("฿", "")), 0) /
                Math.max(1, stops.filter((s) => s.status === "completed").length)
              ).toFixed(2)}
            </Text>
            <Text style={styles.subtleSmall}>Avg per Stop</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, backgroundColor: "#f9fafb" },
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

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

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* progress */
  progressTrack: { height: 8, borderRadius: 999, backgroundColor: "#f1f5f9", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: tone.primary },

  /* stop cards */
  stopName: { fontWeight: "700", fontSize: 15, color: "#111827" },
  statsRow: { flexDirection: "row", gap: 10, flexWrap: "wrap", marginTop: 10 },
  statBox: { flexBasis: "24%", flexGrow: 1 },
  statValue: { fontWeight: "700", color: "#111827" },
  statBig: { fontWeight: "800", fontSize: 18, color: "#111827" },

  /* buttons */
  primaryBtn: {
    backgroundColor: tone.primary,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  ghostBtn: {
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    alignItems: "center",
  },
  ghostBtnText: { color: "#111827", fontWeight: "700" },

  /* summary */
  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 10 },
});

