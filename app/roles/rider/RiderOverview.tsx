// app/roles/rider/RiderOverview.tsx
import React, { useMemo, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
  TextInput,
  Image,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// ---- map image from root assets ----
const Map = require("../../../assets/map.png");

// Collapsible header constants
const MAP_HEIGHT = 600;                 // height of the map
const STICKY_PART = MAP_HEIGHT * 0.5;   // how much remains visible ("sticks")

/* ---------- sample data ---------- */
const todayStats = {
  sales: "฿245.50",
  orders: 18,
  items: 42,
  route: "Downtown A",
};

const salesData = [
  { period: "Today", amount: "฿245.50", orders: 18 },
  { period: "This Week", amount: "฿1,234.75", orders: 89 },
  { period: "This Month", amount: "฿4,567.25", orders: 312 },
];

// state copies so logging can update UI
const INITIAL_INVENTORY = [
  { name: "Poha", remaining: 8, assigned: 20, sold: 12, status: "low" as const },
  { name: "Chai", remaining: 7, assigned: 15, sold: 8, status: "good" as const },
  { name: "Vada Pav", remaining: 4, assigned: 10, sold: 6, status: "critical" as const },
  { name: "Water Bottle", remaining: 5, assigned: 8, sold: 3, status: "good" as const },
];

const INITIAL_RECENT_SALES = [
  { item: "Poha", quantity: 2, amount: "฿17.98", time: "12:30 PM", location: "Central Park" },
  { item: "Vada Pav", quantity: 1, amount: "฿6.50", time: "12:15 PM", location: "Business District" },
  { item: "Chai", quantity: 1, amount: "฿9.99", time: "12:00 PM", location: "City Hall" },
];

/* ---------- helpers ---------- */
const tone = {
  success: "#059669",
  warning: "#d97706",
  destructive: "#dc2626",
  primary: "#2563eb",
  accent: "#7c3aed",
  gray: "#6b7280",
} as const;

function toINR(thbWithSymbol: string) {
  const n = Number(thbWithSymbol.replace(/[^\d.]/g, ""));
  return isNaN(n) ? "" : `INR ${Math.round(n * 2.5)}`;
}
function statusColor(s: "low" | "good" | "critical") {
  if (s === "critical") return tone.destructive;
  if (s === "low") return tone.warning;
  return tone.success;
}

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
        { backgroundColor: solid ? color : "transparent", borderColor: color },
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

/* ---------- screen ---------- */
export default function RiderOverviewScreen() {
  const [currentInventory, setCurrentInventory] = useState(INITIAL_INVENTORY);
  const [recentSales, setRecentSales] = useState(INITIAL_RECENT_SALES);

  // Log Sale modal state
  const [showLogModal, setShowLogModal] = useState(false);
  const [logItem, setLogItem] = useState("");
  const [logQty, setLogQty] = useState("");
  const [logAmount, setLogAmount] = useState("");
  const [logLocation, setLogLocation] = useState("");

  // Collapsible header scroll state
  const scrollY = useRef(new Animated.Value(0)).current;
  const clamped = Animated.diffClamp(scrollY, 0, STICKY_PART);

  // Move the header up as we scroll, but clamp so 50% remains
  const headerTranslateY = clamped.interpolate({
    inputRange: [0, STICKY_PART],
    outputRange: [0, -STICKY_PART],
    extrapolate: "clamp",
  });

  // Fade in a white gradient when scrolled down, fade out at top
  const gradientOpacity = clamped.interpolate({
    inputRange: [0, STICKY_PART * 0.6, STICKY_PART],
    outputRange: [0, 0.4, 0.6],
    extrapolate: "clamp",
  });

  const avgPerOrder = useMemo(() => {
    const thb = Number(todayStats.sales.replace(/[^\d.]/g, "")) || 0;
    return todayStats.orders ? (thb / todayStats.orders).toFixed(2) : "0.00";
  }, []);

  // ---- Log Sale: update recent sales + update inventory counts locally ----
  const handleSaveLog = () => {
    const qty = Number(logQty);
    const amt = Number(logAmount);
    if (!logItem.trim() || isNaN(qty) || qty <= 0 || isNaN(amt) || amt <= 0) {
      Alert.alert("Invalid entry", "Please enter item, quantity (>0), and amount (>0).");
      return;
    }

    // append to recent sales
    const newEntry = {
      item: logItem.trim(),
      quantity: qty,
      amount: `฿${amt.toFixed(2)}`,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      location: logLocation.trim() || "N/A",
    };
    setRecentSales((list) => [newEntry, ...list].slice(0, 20));

    // adjust inventory snapshot if item exists
    setCurrentInventory((inv) => {
      const idx = inv.findIndex((x) => x.name.toLowerCase() === logItem.trim().toLowerCase());
      if (idx === -1) return inv;
      const item = { ...inv[idx] };
      const soldNow = Math.min(qty, item.remaining);
      item.remaining = Math.max(0, item.remaining - soldNow);
      item.sold = Math.min(item.assigned, item.sold + soldNow);
      const pctRem = item.remaining / Math.max(item.assigned, 1);
      item.status = pctRem <= 0.3 ? (pctRem <= 0.15 ? "critical" : "low") : "good";
      const next = inv.slice();
      next[idx] = item;
      return next;
    });

    // reset + close
    setLogItem("");
    setLogQty("");
    setLogAmount("");
    setLogLocation("");
    setShowLogModal(false);
  };

  const handleRefillRequest = () => {
    Alert.alert("Refill Request", "Your refill request has been sent to the supervisor.");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* ===== Collapsible Map Header (absolute at top) ===== */}
      <Animated.View
        style={[
          styles.mapHeader,
          { transform: [{ translateY: headerTranslateY }] },
        ]}
      >
        <Image source={Map} style={styles.mapImage} resizeMode="cover" />

        {/* Buttons overlay (top-left, same row) */}
        <View style={styles.mapButtonsOverlay}>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* SOS (red gradient) */}
            <LinearGradient
              colors={["#ef4444", "#b91c1c"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.gradientBtn, styles.overlayBtn]}
            >
              <Pressable
                onPress={() => Alert.alert("SOS Sent", "Your emergency alert has been sent to the supervisor.")}
                style={styles.gradientBtnInner}
              >
                <Feather name="alert-triangle" size={16} color="#ffffff" />
                <Text style={styles.gradientBtnText}>  SOS</Text>
              </Pressable>
            </LinearGradient>

            {/* Log Sale (yellow gradient) */}
            <LinearGradient
              colors={["#FACC15", "#F59E0B"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.gradientBtn, styles.overlayBtn]}
            >
              <Pressable onPress={() => setShowLogModal(true)} style={styles.gradientBtnInner}>
                <Feather name="file-plus" size={16} color="#ffffff" />
                <Text style={styles.gradientBtnText}>  Log Sale</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>

        {/* Fading white gradient when scrolling down */}
        <Animated.View pointerEvents="none" style={[styles.fadeOverlay, { opacity: gradientOpacity }]}>
          <LinearGradient
            colors={["rgba(255,255,255,0)", "rgba(255,255,255,0.85)"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </Animated.View>
      </Animated.View>

      {/* ===== Scrollable Content (starts below map height) ===== */}
      <Animated.ScrollView
        contentContainerStyle={[styles.page, { paddingTop: MAP_HEIGHT + 16 }]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Header text (kept) */}
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.h1}>Rider Dashboard</Text>
          <Text style={styles.subtle}>Track your sales and manage your cart</Text>
        </View>

        {/* My Current Inventory (Snapshot) */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="archive" size={18} />
              <Text style={styles.sectionTitle}>My Current Inventory (Snapshot)</Text>
            </View>
            <Text style={styles.subtle}>Quick view of items left in your cart</Text>
          </View>

          <View style={styles.listWrap}>
            {currentInventory.map((item, idx) => {
              const pct = (item.sold / Math.max(item.assigned, 1)) * 100;
              return (
                <View key={`snap-${item.name}`}>
                  <View style={styles.listRow}>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                        <Text style={styles.listLeft}>{item.name}</Text>
                        <Badge text={item.status} variant="outline" color={statusColor(item.status)} />
                      </View>
                      <Text style={styles.subtleSmall}>
                        Remaining: <Text style={{ fontWeight: "700" }}>{item.remaining}</Text>  •  Sold: {item.sold} / {item.assigned}
                      </Text>
                      <View style={{ marginTop: 8 }}>
                        <View style={[styles.row, { justifyContent: "space-between" }]}>
                          <Text style={styles.subtleSmall}>Sales Progress</Text>
                          <Text style={styles.subtleSmall}>{Math.round(pct)}%</Text>
                        </View>
                        <ProgressBar value={pct} />
                      </View>
                    </View>
                  </View>
                  {idx < currentInventory.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>

          {/* Refill request button */}
          <View style={{ marginTop: 12, alignSelf: "flex-start" }}>
            <LinearGradient
              colors={["#FACC15", "#F59E0B"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.gradientBtn}
            >
              <Pressable onPress={handleRefillRequest} style={styles.gradientBtnInner}>
                <Feather name="refresh-ccw" size={16} color="#ffffff" />
                <Text style={styles.gradientBtnText}>  Request Refill</Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>

        {/* Stats grid (2 columns) */}
        <View style={{ gap: 12 }}>
          {chunk(
            [
              {
                title: "Today's Sales",
                valueNode: (
                  <Text style={[styles.metric, { color: tone.success }]}>
                    {todayStats.sales} <Text style={styles.inr}>{toINR(todayStats.sales)}</Text>
                  </Text>
                ),
                icon: "dollar-sign" as const,
                color: tone.success,
                note: `${todayStats.orders} orders completed`,
              },
              {
                title: "Items Sold",
                valueNode: <Text style={styles.metric}>{todayStats.items}</Text>,
                icon: "package" as const,
                color: tone.primary,
                note: "Items sold today",
              },
              {
                title: "Current Route",
                valueNode: <Text style={styles.metric}>{todayStats.route}</Text>,
                icon: "map-pin" as const,
                color: tone.accent,
                note: "Active route assignment",
              },
              {
                title: "Avg per Order",
                valueNode: (
                  <Text style={styles.metric}>
                    ฿{(Number(todayStats.sales.replace(/[^\d.]/g, "")) / Math.max(1, todayStats.orders)).toFixed(2)}{" "}
                    <Text style={styles.inr}>{toINR(`฿${(Number(todayStats.sales.replace(/[^\d.]/g, "")) / Math.max(1, todayStats.orders)).toFixed(2)}`)}</Text>
                  </Text>
                ),
                icon: "trending-up" as const,
                color: tone.warning,
                note: "Average order value",
              },
            ],
            2
          ).map((row, i) => (
            <View key={i} style={styles.row}>
              {row.map((card) => (
                <View key={card.title} style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardTitle}>{card.title}</Text>
                    <Feather name={card.icon} size={18} color={card.color} />
                  </View>
                  {card.valueNode}
                  <Text style={[styles.subtleSmall, { marginTop: 2 }]}>{card.note}</Text>
                </View>
              ))}
              {row.length === 1 && <View style={{ flex: 1 }} />}
            </View>
          ))}
        </View>

        {/* Sales Summary */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="bar-chart-2" size={18} />
              <Text style={styles.sectionTitle}>Sales Summary</Text>
            </View>
            <Text style={styles.subtle}>Your performance over time</Text>
          </View>

          <View style={styles.listWrap}>
            {salesData.map((data, idx) => (
              <View key={data.period}>
                <View style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLeft}>{data.period}</Text>
                    <Text style={styles.subtleSmall}>{data.orders} orders</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "800", color: tone.success }}>
                      {data.amount} <Text style={styles.inr}>{toINR(data.amount)}</Text>
                    </Text>
                  </View>
                </View>
                {idx < salesData.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>

        {/* Recent Sales */}
        <View className="card" style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="clock" size={18} />
              <Text style={styles.sectionTitle}>Recent Sales</Text>
            </View>
            <Text style={styles.subtle}>Your latest transactions</Text>
          </View>

          <View style={styles.listWrap}>
            {recentSales.map((sale, idx) => (
              <View key={idx}>
                <View style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLeft}>{sale.item}</Text>
                    <Text style={styles.subtleSmall}>
                      Qty: {sale.quantity} • {sale.location}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ fontWeight: "800", color: tone.success }}>
                      {sale.amount} <Text style={styles.inr}>{toINR(sale.amount)}</Text>
                    </Text>
                    <Text style={[styles.subtleSmall, { textAlign: "right" }]}>{sale.time}</Text>
                  </View>
                </View>
                {idx < recentSales.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Log Sale Modal */}
      <Modal
        visible={showLogModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Log Sale</Text>

            <TextInput
              placeholder="Item name"
              value={logItem}
              onChangeText={setLogItem}
              style={styles.input}
            />
            <TextInput
              placeholder="Quantity"
              value={logQty}
              onChangeText={setLogQty}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Amount (THB)"
              value={logAmount}
              onChangeText={setLogAmount}
              keyboardType="numeric"
              style={styles.input}
            />
            <TextInput
              placeholder="Location"
              value={logLocation}
              onChangeText={setLogLocation}
              style={styles.input}
            />

            <View style={[styles.row, { justifyContent: "space-between", marginTop: 8 }]}>
              <LinearGradient
                colors={["#FACC15", "#F59E0B"]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={[styles.gradientBtn, { flex: 1, marginRight: 8 }]}
              >
                <Pressable onPress={handleSaveLog} style={styles.gradientBtnInner}>
                  <Feather name="save" size={16} color="#ffffff" />
                  <Text style={styles.gradientBtnText}>  Save</Text>
                </Pressable>
              </LinearGradient>

              <Pressable onPress={() => setShowLogModal(false)} style={[styles.btnGhost, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- utils ---------- */
function chunk<T>(arr: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  // Collapsible map header
  mapHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: MAP_HEIGHT,
    zIndex: 1,
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  fadeOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  mapButtonsOverlay: {
    position: "absolute",
    top: 12,
    left: 12,
  },
  overlayBtn: {
    alignSelf: "flex-start",
  },

  /* Typography */
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },

  // gradient button wrappers
  gradientBtn: {
    borderRadius: 12,
  },
  gradientBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  gradientBtnText: {
    color: "#ffffff",
    fontWeight: "800",
    letterSpacing: 0.3,
  },

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

  /* card header bits */
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  metric: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 6 },
  inr: { fontSize: 11, color: "#6b7280" },

  /* list look */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  listLeft: { fontWeight: "700", color: "#111827", marginBottom: 2 },
  divider: { height: 1, backgroundColor: "#eef1f5" },
  rightTop: { fontSize: 12, fontWeight: "700", color: "#111827" },

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
    marginTop: 6,
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#2563eb" },

  /* ghost button */
  btnGhost: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
  },
  btnGhostText: { fontWeight: "700" },

  /* --- modal styles --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    fontSize: 14,
    color: "#111827",
  },
});
