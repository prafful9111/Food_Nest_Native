// screens/AvailableVehicles.tsx
import React, { useMemo, useState } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (tweak to your API) ---------- */
type Vehicle = {
  id: string;
  name: string;
  type: "Cart" | "Bike" | "Scooter";
  plate?: string;
  status: "Available" | "In Use" | "Maintenance" | "Charging";
  batteryPct: number;        // 0 - 100
  lastSeen: string;          // e.g., "5 min ago"
  location: string;          // e.g., "Depot A · Bay 2"
  rangeKm?: number;          // optional for EVs
};

const vehiclesSeed: Vehicle[] = [
  { id: "CART-101", name: "Cart 101", type: "Cart", plate: "TH-AV-101", status: "Available",  batteryPct: 92, lastSeen: "2 min ago",  location: "Depot A · Bay 1", rangeKm: 98 },
  { id: "CART-108", name: "Cart 108", type: "Cart", plate: "TH-AV-108", status: "Charging",   batteryPct: 42, lastSeen: "Now",         location: "Depot A · Bay 3", rangeKm: 46 },
  { id: "BIKE-12",  name: "Bike 12",  type: "Bike", plate: "MH 12 AB 3456", status: "In Use", batteryPct: 68, lastSeen: "12 min ago", location: "Downtown A",      rangeKm: 55 },
  { id: "SCTR-7",   name: "Scooter 7",type: "Scooter", status: "Maintenance", batteryPct: 0,  lastSeen: "1 hr ago",   location: "Workshop",           rangeKm: 0 },
  { id: "CART-117", name: "Cart 117", type: "Cart", plate: "TH-AV-117", status: "Available",  batteryPct: 73, lastSeen: "8 min ago",  location: "Depot B · Bay 2", rangeKm: 80 },
];

/* ---------- small UI atoms ---------- */
function Badge({
  text,
  variant = "solid",
  color = "#2563eb",
}: { text: string; variant?: "solid" | "outline"; color?: string }) {
  const solid = variant === "solid";
  return (
    <View style={[styles.badge, { backgroundColor: solid ? color : "transparent", borderColor: color }]}>
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
  gray: "#6b7280",
  destructive: "#dc2626",
} as const;

const statusColor = (s: Vehicle["status"]) =>
  s === "Available" ? tone.success :
  s === "In Use"   ? tone.primary :
  s === "Charging" ? tone.warning :
  tone.destructive;

/* ---------- screen ---------- */
const segments = [
  { key: "all", label: "All", icon: "grid" as const },
  { key: "Available", label: "Available", icon: "check-circle" as const },
  { key: "In Use", label: "In Use", icon: "play-circle" as const },
  { key: "Charging", label: "Charging", icon: "battery-charging" as const },
  { key: "Maintenance", label: "Maintenance", icon: "tool" as const },
];

export default function AvailableVehiclesScreen() {
  const [tab, setTab] = useState<"all" | Vehicle["status"]>("all");

  const vehicles = useMemo(() => {
    if (tab === "all") return vehiclesSeed;
    return vehiclesSeed.filter(v => v.status === tab);
  }, [tab]);

  const counts = useMemo(() => {
    return vehiclesSeed.reduce<Record<string, number>>((acc, v) => {
      acc[v.status] = (acc[v.status] || 0) + 1;
      return acc;
    }, {});
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Available Vehicles</Text>
        <Text style={styles.subtle}>Find a vehicle to assign, track, or service</Text>
      </View>

      {/* Segmented filter */}
      <View style={styles.segmentWrap}>
        {segments.map(s => {
          const active = tab === (s.key as any);
          const right = s.key !== "all" ? counts[s.key] || 0 : vehiclesSeed.length;
          return (
            <Pressable
              key={s.key}
              onPress={() => setTab(s.key as any)}
              style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && { opacity: 0.9 }]}
            >
              <Feather name={s.icon} size={14} color={active ? "#111827" : "#6b7280"} style={{ marginRight: 6 }} />
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{s.label}</Text>
              <View style={styles.segmentPill}><Text style={styles.segmentPillText}>{right}</Text></View>
            </Pressable>
          );
        })}
      </View>

      {/* Vehicles list */}
      <View style={styles.card}>
        <View style={{ marginBottom: 8 }}>
          <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
            <Feather name="truck" size={18} />
            <Text style={styles.sectionTitle}>
              {tab === "all" ? "All Vehicles" : `${tab} Vehicles`}
            </Text>
          </View>
          <Text style={styles.subtle}>Tap Assign to allocate, Track for live location</Text>
        </View>

        <View style={styles.listWrap}>
          {vehicles.map((v, idx) => (
            <View key={v.id}>
              <View style={[styles.listRow, { alignItems: "flex-start", gap: 10 }]}>
                {/* Left info */}
                <View style={{ flex: 1 }}>
                  <View style={[styles.row, { alignItems: "center", gap: 8, flexWrap: "wrap" }]}>
                    <Text style={styles.vehicleName}>{v.name}</Text>
                    <Badge text={v.type} variant="outline" color={tone.gray} />
                    <Badge text={v.status} variant="outline" color={statusColor(v.status)} />
                  </View>
                  <View style={[styles.row, { gap: 10, marginTop: 6, flexWrap: "wrap" }]}>
                    {v.plate ? (
                      <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                        <Feather name="hash" size={12} color={tone.gray} />
                        <Text style={styles.subtleSmall}>{v.plate}</Text>
                      </View>
                    ) : null}
                    <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                      <Feather name="map-pin" size={12} color={tone.gray} />
                      <Text style={styles.subtleSmall}>{v.location}</Text>
                    </View>
                    <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                      <Feather name="clock" size={12} color={tone.gray} />
                      <Text style={styles.subtleSmall}>Last seen {v.lastSeen}</Text>
                    </View>
                  </View>

                  {/* Battery */}
                  <View style={{ marginTop: 10 }}>
                    <View style={[styles.row, { justifyContent: "space-between" }]}>
                      <Text style={styles.subtleSmall}>Battery</Text>
                      <Text style={styles.subtleSmall}>{v.batteryPct}%</Text>
                    </View>
                    <ProgressBar value={v.batteryPct} />
                    {!!v.rangeKm && (
                      <Text style={[styles.subtleSmall, { marginTop: 4 }]}>
                        Est. range ~ {v.rangeKm} km
                      </Text>
                    )}
                  </View>
                </View>

                {/* Right actions */}
                <View style={{ width: 124, alignItems: "flex-end", gap: 8 }}>
                  <Pressable
                    onPress={() => Alert.alert("Assign Vehicle", `Assign ${v.name} to a rider/route`)}
                    disabled={v.status !== "Available"}
                    style={({ pressed }) => [
                      styles.primaryBtn,
                      v.status !== "Available" && { opacity: 0.5 },
                      pressed && { opacity: 0.95 },
                    ]}
                  >
                    <Feather name="plus" size={14} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.primaryBtnText}>Assign</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => Alert.alert("Track Vehicle", `Open live tracking for ${v.name}`)}
                    style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.9 }]}
                  >
                    <Text style={styles.ghostBtnText}>Track</Text>
                  </Pressable>
                </View>
              </View>
              {idx < vehicles.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- styles (aligned with your other screens) ---------- */
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
  vehicleName: { fontWeight: "800", color: "#111827", fontSize: 15 },

  /* list/table look */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: { height: 1, backgroundColor: "#eef1f5" },

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
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#2563eb" },

  /* buttons */
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  ghostBtnText: { color: "#111827", fontWeight: "800", fontSize: 12 },

  /* segmented filter */
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
    gap: 6,
  },
  segmentActive: { backgroundColor: "#fff" },
  segmentText: { fontSize: 12, fontWeight: "600", color: "#6b7280" },
  segmentTextActive: { color: "#111827" },
  segmentPill: {
    minWidth: 20,
    height: 18,
    paddingHorizontal: 6,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  segmentPillText: { fontSize: 11, fontWeight: "800", color: "#111827" },
});
