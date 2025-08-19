// screens/RiderOverview.tsx
import React, { useMemo } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data (parity with your web RiderOverview) ---------- */
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

const currentInventory = [
  { name: "Classic Burger", remaining: 8, assigned: 20, sold: 12, status: "low" as const },
  { name: "Chicken Tacos", remaining: 7, assigned: 15, sold: 8, status: "good" as const },
  { name: "Fish & Chips", remaining: 4, assigned: 10, sold: 6, status: "critical" as const },
  { name: "Caesar Salad", remaining: 5, assigned: 8, sold: 3, status: "good" as const },
];

const recentSales = [
  { item: "Classic Burger", quantity: 2, amount: "฿17.98", time: "12:30 PM", location: "Central Park" },
  { item: "Chicken Tacos", quantity: 1, amount: "฿6.50", time: "12:15 PM", location: "Business District" },
  { item: "Fish & Chips", quantity: 1, amount: "฿9.99", time: "12:00 PM", location: "City Hall" },
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
  const avgPerOrder = useMemo(() => {
    const thb = Number(todayStats.sales.replace(/[^\d.]/g, "")) || 0;
    return todayStats.orders ? (thb / todayStats.orders).toFixed(2) : "0.00";
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Rider Dashboard</Text>
        <Text style={styles.subtle}>Track your sales and manage your cart</Text>
      </View>

      {/* SOS */}
      <Pressable
        onPress={() => Alert.alert("SOS Sent", "Your emergency alert has been sent to the supervisor.")}
        style={({ pressed }) => [styles.sosBtn, pressed && { opacity: 0.9 }]}
      >
        <Feather name="alert-triangle" size={16} color="#fff" />
        <Text style={styles.sosText}>SOS</Text>
      </Pressable>

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
                  ฿{avgPerOrder} <Text style={styles.inr}>{toINR(`฿${avgPerOrder}`)}</Text>
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

      {/* Two columns: Sales Summary & Current Inventory */}
      <View style={{ gap: 12 }}>
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

        {/* Current Inventory */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="archive" size={18} />
              <Text style={styles.sectionTitle}>Current Inventory</Text>
            </View>
            <Text style={styles.subtle}>Items remaining in your cart</Text>
          </View>

          <View style={styles.listWrap}>
            {currentInventory.map((item, idx) => {
              const pct = (item.sold / Math.max(item.assigned, 1)) * 100;
              return (
                <View key={item.name}>
                  <View style={styles.listRow}>
                    <View style={{ flex: 1 }}>
                      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                        <Text style={styles.listLeft}>{item.name}</Text>
                        <Badge
                          text={item.status}
                          variant="outline"
                          color={statusColor(item.status)}
                        />
                      </View>

                      <View style={{ marginTop: 8 }}>
                        <View style={[styles.row, { justifyContent: "space-between" }]}>
                          <Text style={styles.subtleSmall}>Sales Progress</Text>
                          <Text style={styles.subtleSmall}>{Math.round(pct)}%</Text>
                        </View>
                        <ProgressBar value={pct} />
                      </View>
                    </View>

                    <View style={{ width: 120, alignItems: "flex-end" }}>
                      <Text style={styles.rightTop}>
                        <Text style={{ color: statusColor(item.status) }}>{item.remaining}</Text> / {item.assigned} remaining
                      </Text>
                      <Text style={styles.subtleSmall}>{item.assigned - item.remaining} sold</Text>
                    </View>
                  </View>
                  {idx < currentInventory.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Recent Sales */}
      <View style={styles.card}>
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
    </ScrollView>
  );
}

/* ---------- utils ---------- */
function chunk<T>(arr: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

/* ---------- styles (aligned with your app look) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },

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

  /* SOS */
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
