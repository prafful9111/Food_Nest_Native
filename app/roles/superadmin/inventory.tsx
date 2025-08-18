import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ===== Seed data ===== */
type Inv = { id: number; name: string; current: number; max: number; unit: string; status: "Critical" | "Low" | "Good"; requests: number };
const inventoryItems: Inv[] = [
  { id: 1, name: "Burger Patties", current: 45, max: 100, unit: "pieces", status: "Low",      requests: 2 },
  { id: 2, name: "Chicken Breast", current: 78, max: 100, unit: "pieces", status: "Good",     requests: 0 },
  { id: 3, name: "Lettuce",        current: 12, max: 50,  unit: "heads",  status: "Critical", requests: 3 },
  { id: 4, name: "Tomatoes",       current: 28, max: 40,  unit: "lbs",    status: "Good",     requests: 1 },
  { id: 5, name: "Burger Buns",    current: 25, max: 80,  unit: "pieces", status: "Low",      requests: 1 },
  { id: 6, name: "Cheese Slices",  current: 35, max: 60,  unit: "pieces", status: "Good",     requests: 0 },
];

type CookRow = { id: number; item: string; status: "Ready" | "Processing"; quantity: number; cook: string };
const cookStatus: CookRow[] = [
  { id: 1, item: "Poha",         status: "Ready",      quantity: 25, cook: "Chef Maria" },
  { id: 2, item: "Vada Pav",     status: "Processing", quantity: 15, cook: "Chef David" },
  { id: 3, item: "Chai",         status: "Ready",      quantity: 40, cook: "Chef Sarah" },
  { id: 4, item: "Water Bottle", status: "Processing", quantity: 20, cook: "Chef Maria" },
];

type RiderLoc = { id: number; rider: string; location: string; route: string; lastUpdate: string; status: "Active" | "Returning" };
const liveRiderLocations: RiderLoc[] = [
  { id: 1, rider: "John Smith",    location: "Near Stop 3 - Central Park", route: "Downtown Route A", lastUpdate: "2 min ago",  status: "Active" },
  { id: 2, rider: "Mike Davis",    location: "Stop 1 - Residential Area A", route: "Suburban Route B", lastUpdate: "5 min ago",  status: "Active" },
  { id: 3, rider: "Sarah Johnson", location: "Returning to base",           route: "Beach Route C",     lastUpdate: "10 min ago", status: "Returning" },
];

type Req = { id: number; item: string; quantity: number; cook: string; reason: string; time: string; status: "Pending" | "Approved" | "Rejected" };
const initRequests: Req[] = [
  { id: 1, item: "Burger Patties", quantity: 20, cook: "Chef Maria", reason: "High demand in downtown area", time: "2 hours ago", status: "Pending" },
  { id: 2, item: "Lettuce",        quantity: 15, cook: "Chef David", reason: "Running low on salads",        time: "3 hours ago", status: "Pending" },
  { id: 3, item: "Tomatoes",       quantity: 10, cook: "Chef Sarah", reason: "Prep for lunch rush",          time: "4 hours ago", status: "Approved" },
];

/* ===== Helpers ===== */
const pct = (cur: number, max: number) => (max ? (cur / max) * 100 : 0);
const statusTone = (s: Inv["status"]) =>
  s === "Critical" ? "#ef4444" : s === "Low" ? "#f59e0b" : "#10b981";
const badgeStyle = (bg: string) => ({ backgroundColor: `${bg}22`, borderColor: `${bg}55` });

export default function Inventory() {
  const [requests, setRequests] = useState(initRequests);

  const approve = (id: number) =>
    setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  const reject = (id: number) =>
    setRequests((arr) => arr.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));

  const gridCook = useMemo(() => {
    const rows: CookRow[][] = [];
    for (let i = 0; i < cookStatus.length; i += 2) rows.push(cookStatus.slice(i, i + 2));
    return rows;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Inventory Management</Text>
          <Text style={styles.subtle}>Monitor stock levels and material requests</Text>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Btn variant="outline" onPress={() => { /* refetch */ }}>
            <Feather name="refresh-ccw" size={16} /> <Text> Refresh</Text>
          </Btn>
          <Btn onPress={() => { /* open add item modal */ }}>
            <Feather name="plus" size={16} color="#fff" /> <Text style={{ color: "#fff" }}> Add Item</Text>
          </Btn>
        </View>
      </View>

      {/* ---- Stock Levels (full width row) ---- */}
      <Card>
        <CardHeader icon="package" title="Stock Levels" desc="Current inventory status" />
        <View style={{ gap: 12 }}>
          {inventoryItems.map((it) => {
            const color = statusTone(it.status);
            const p = pct(it.current, it.max);
            return (
              <View key={it.id} style={{ gap: 6 }}>
                <View style={styles.rowBetween}>
                  <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                    <Text style={{ fontWeight: "700" }}>{it.name}</Text>
                    <View style={[styles.badge, badgeStyle(color)]}>
                      <Text style={[styles.badgeText, { color }]}>{it.status}</Text>
                    </View>
                    {it.requests > 0 && (
                      <View style={[styles.badge, badgeStyle("#7c3aed")]}>
                        <Text style={[styles.badgeText, { color: "#7c3aed" }]}>{it.requests} requests</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.subtleSmall}>
                    {it.current}/{it.max} {it.unit}
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${p}%`, backgroundColor: color },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      {/* ---- Cook Status (full width row) ---- */}
      <Card>
        <CardHeader icon="briefcase" title="Cook Status" desc="Current food preparation status" />
        <View style={{ gap: 10 }}>
          {gridCook.map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((c) => (
                <View key={c.id} style={styles.softTile}>
                  <View style={styles.rowBetween}>
                    <Text style={{ fontWeight: "700" }}>{c.item}</Text>
                    <View
                      style={[
                        styles.badge,
                        badgeStyle(c.status === "Ready" ? "#10b981" : "#f59e0b"),
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: c.status === "Ready" ? "#065f46" : "#92400e" },
                        ]}
                      >
                        {c.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.subtleSmall}>{c.cook}</Text>
                    <Text style={styles.subtleSmall}>{c.quantity} units</Text>
                  </View>
                </View>
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>
      </Card>

      {/* ---- Live Rider Locations (full width) ---- */}
      <Card>
        <CardHeader icon="map-pin" title="Live Rider Locations" desc="Current rider positions and status" />
        <View style={{ gap: 10 }}>
          {liveRiderLocations.map((r) => (
            <View key={r.id} style={styles.softTile}>
              <View style={styles.rowBetween}>
                <Text style={{ fontWeight: "700" }}>{r.rider}</Text>
                <View
                  style={[
                    styles.badge,
                    badgeStyle(r.status === "Active" ? "#10b981" : "#7c3aed"),
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      { color: r.status === "Active" ? "#065f46" : "#5b21b6" },
                    ]}
                  >
                    {r.status}
                  </Text>
                </View>
              </View>
              <Text style={styles.subtleSmall}>{r.location}</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.subtleSmall}>{r.route}</Text>
                <Text style={styles.subtleSmall}>Updated {r.lastUpdate}</Text>
              </View>
            </View>
          ))}
        </View>
      </Card>

      {/* ---- Raw Material Requests (full width) ---- */}
      <Card>
        <CardHeader icon="alert-triangle" title="Raw Material Requests" desc="Pending requests from cooks" />
        <View style={{ gap: 10 }}>
          {requests.map((req) => (
            <View key={req.id} style={[styles.softTile, { gap: 6 }]}>
              <View style={styles.rowBetween}>
                <Text style={{ fontWeight: "700" }}>{req.item}</Text>
                <View
                  style={[
                    styles.badge,
                    badgeStyle(
                      req.status === "Approved"
                        ? "#10b981"
                        : req.status === "Rejected"
                        ? "#ef4444"
                        : "#f59e0b"
                    ),
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      {
                        color:
                          req.status === "Approved"
                            ? "#065f46"
                            : req.status === "Rejected"
                            ? "#991b1b"
                            : "#92400e",
                      },
                    ]}
                  >
                    {req.status}
                  </Text>
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={[styles.subtleSmall, { fontWeight: "600" }]}>
                  {req.quantity} units
                </Text>
                <Text style={styles.subtleSmall}>{req.time}</Text>
              </View>

              <Text style={styles.subtleSmall}>{req.reason}</Text>
              <Text style={[styles.subtleSmall, { fontWeight: "600" }]}>{req.cook}</Text>

              {req.status === "Pending" && (
                <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                  <Btn onPress={() => approve(req.id)}>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>Approve</Text>
                  </Btn>
                  <Btn variant="outline" onPress={() => reject(req.id)}>
                    <Text>Decline</Text>
                  </Btn>
                </View>
              )}
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

/* ===== Small primitives ===== */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function CardHeader({ icon, title, desc }: { icon: keyof typeof Feather.glyphMap; title: string; desc?: string }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
        <Feather name={icon} size={18} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {desc ? <Text style={styles.subtle}>{desc}</Text> : null}
    </View>
  );
}
function Btn({
  children,
  variant = "solid",
  onPress,
}: {
  children: React.ReactNode;
  variant?: "solid" | "outline";
  onPress?: () => void;
}) {
  if (variant === "outline") {
    return (
      <Pressable onPress={onPress} style={styles.btnOutline}>
        {children}
      </Pressable>
    );
  }
  return (
    <Pressable onPress={onPress} style={styles.btnSolid}>
      {children}
    </Pressable>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },

  row: { flexDirection: "row", gap: 12 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

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

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },

  progressTrack: { height: 8, backgroundColor: "#eef1f5", borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },

  softTile: { backgroundColor: "#f3f4f6", borderRadius: 12, padding: 10, flex: 1 },

  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnOutline: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
});
