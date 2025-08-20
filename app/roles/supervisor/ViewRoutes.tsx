// screens/ViewRoutes.tsx
import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (parity with your web ViewRoutes.tsx) ---------- */
type RouteInfo = {
  id: number;
  name: string;
  rider: string;
  status: "Active" | "On Break" | "Completed";
  currentStop: string;
  progress: number; // index of current stop (0-based)
  totalStops: number;
  startTime: string;
  estimatedCompletion: string;
  stops: string[];
};

const routes: RouteInfo[] = [
  {
    id: 1,
    name: "Downtown A",
    rider: "John Smith",
    status: "Active",
    currentStop: "Central Park",
    progress: 2,
    totalStops: 5,
    startTime: "09:00 AM",
    estimatedCompletion: "01:00 PM",
    stops: ["City Hall", "Central Park", "Business District", "Shopping Mall", "University Campus"],
  },
  {
    id: 2,
    name: "Suburban B",
    rider: "Mark Devin",
    status: "Active",
    currentStop: "Community Center",
    progress: 1,
    totalStops: 5,
    startTime: "10:00 AM",
    estimatedCompletion: "02:30 PM",
    stops: ["Residential Area A", "Community Center", "Local School", "Grocery Plaza", "Medical Center"],
  },
  {
    id: 3,
    name: "Beach C",
    rider: "Sarah Johnson",
    status: "On Break",
    currentStop: "Marina",
    progress: 0,
    totalStops: 5,
    startTime: "11:00 AM",
    estimatedCompletion: "04:00 PM",
    stops: ["Marina", "Beach Boardwalk", "Pier Restaurant", "Surf Shop", "Beach Hotel"],
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
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>{text}</Text>
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
  primary: "#2563eb",
  gray: "#6b7280",
} as const;

const statusColor = (s: RouteInfo["status"]) =>
  s === "Active" ? tone.success : s === "On Break" ? tone.warning : tone.primary;

const getProgressPct = (progressIndex: number, total: number) =>
  ((progressIndex + 1) / Math.max(total, 1)) * 100;

/* ---------- screen ---------- */
export default function ViewRoutesScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>View Routes</Text>
        <Text style={styles.subtle}>Monitor active routes and rider progress</Text>
      </View>

      {/* Route Cards */}
      <View style={{ gap: 12 }}>
        {routes.map((route) => (
          <View key={route.id} style={styles.card}>
            {/* Card header */}
            <View style={[styles.rowBetween, { marginBottom: 8 }]}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                  <Feather name="truck" size={18} />
                  <Text style={styles.sectionTitle}>{route.name}</Text>
                </View>
                <View style={[styles.row, { alignItems: "center", gap: 10, marginTop: 6, flexWrap: "wrap" }]}>
                  <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                    <Feather name="user" size={14} color={tone.gray} />
                    <Text style={styles.subtle}>{route.rider}</Text>
                  </View>
                  <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                    <Feather name="clock" size={14} color={tone.gray} />
                    <Text style={styles.subtle}>
                      {route.startTime} - {route.estimatedCompletion}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={{ alignItems: "flex-end", gap: 8 }}>
                <Badge text={route.status} variant="outline" color={statusColor(route.status)} />
                <Pressable
                  style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.9 }]}
                  onPress={() => {
                    // hook GPS/live tracking here
                  }}
                >
                  <Text style={styles.ghostBtnText}>Track</Text>
                </Pressable>
              </View>
            </View>

            {/* Progress */}
            <View style={{ marginBottom: 10 }}>
              <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                <Text style={styles.subtleSmall}>Progress</Text>
                <Text style={styles.subtleSmall}>
                  {route.progress + 1}/{route.totalStops} stops
                </Text>
              </View>
              <ProgressBar value={getProgressPct(route.progress, route.totalStops)} />
            </View>

            {/* Stops */}
            <View>
              <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 6 }]}>
                <Feather name="map-pin" size={16} />
                <Text style={styles.cardTitle}>Route Stops</Text>
              </View>

              <View style={{ gap: 8 }}>
                {route.stops.map((stop, index) => {
                  const done = index < route.progress;
                  const current = index === route.progress;
                  const future = index > route.progress;
                  const chipBg = done
                    ? tone.success
                    : current
                    ? tone.primary
                    : "#94a3b8"; // muted chip

                  return (
                    <View
                      key={stop + index}
                      style={[
                        styles.stopRow,
                        done
                          ? { backgroundColor: "rgba(5,150,105,0.07)", borderColor: "rgba(5,150,105,0.25)" }
                          : current
                          ? { backgroundColor: "rgba(37,99,235,0.07)", borderColor: "rgba(37,99,235,0.25)" }
                          : { backgroundColor: "#f3f4f6", borderColor: "#e5e7eb" },
                      ]}
                    >
                      <View
                        style={[
                          styles.stopIndex,
                          { backgroundColor: chipBg },
                        ]}
                      >
                        <Text style={{ color: "#fff", fontSize: 11, fontWeight: "800" }}>
                          {index + 1}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.stopName,
                            current ? { fontWeight: "700" } : null,
                            future ? { color: "#374151" } : null,
                          ]}
                          numberOfLines={2}
                        >
                          {stop}
                        </Text>
                      </View>

                      {current ? <Badge text="Current" variant="solid" color={tone.primary} /> : null}
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/* ---------- styles (aligned with your overview.tsx) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },

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
  cardTitle: { fontSize: 13, fontWeight: "700", color: "#374151" },

  /* stops list */
  stopRow: {
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stopIndex: {
    width: 26,
    height: 26,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  stopName: { color: "#111827" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* progress */
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#2563eb",
  },

  /* buttons */
  ghostBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  ghostBtnText: { color: "#111827", fontWeight: "800", fontSize: 12 },
});
