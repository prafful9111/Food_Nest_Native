import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

/** ========= Data (parity with web) ========= */
const salesData = [
  { period: "Today",      sales: "฿1,234", orders: 45,  avg: "฿27.42" },
  { period: "This Week",  sales: "฿8,567", orders: 312, avg: "฿27.46" },
  { period: "This Month", sales: "฿34,890",orders: 1247,avg: "฿27.98" },
];

const topPerformers = [
  { name: "Classic Burger", sales: 145, revenue: "฿1,305" },
  { name: "Chicken Tacos",  sales: 132, revenue: "฿858"  },
  { name: "Fish & Chips",   sales: 98,  revenue: "฿979"  },
  { name: "Caesar Salad",   sales: 76,  revenue: "฿607"  },
];

const riderPerformance = [
  { name: "John Smith",  route: "Downtown A", sales: "฿2,456", efficiency: "95%" },
  { name: "Mike Davis",  route: "Suburban B", sales: "฿2,123", efficiency: "92%" },
  { name: "Sarah Johnson", route: "Beach C",  sales: "฿1,890", efficiency: "88%" },
];

/** ========= Helpers ========= */
const thbToInr = (s: string) => {
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return `INR ${Math.round(n * 2.5)}`;
};

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function CardHeader({ icon, title, subtitle }: { icon?: keyof typeof Feather.glyphMap; title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
        {icon ? <Feather name={icon} size={18} /> : null}
        <Text style={styles.h4}>{title}</Text>
      </View>
      {subtitle ? <Text style={styles.subtleSmall}>{subtitle}</Text> : null}
    </View>
  );
}
function KPI({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <Text style={styles.subtleSmall}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
      {sub ? <Text style={styles.subtleSmall}>{sub}</Text> : null}
    </Card>
  );
}
function Segmented({
  options, value, onChange,
}: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.segmented}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.segmentBtn, active && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** ========= Screen ========= */
export default function AnalyticsScreen() {
  const [tab, setTab] = useState<"Overview" | "Sales" | "Products" | "Performance">("Overview");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Analytics Dashboard</Text>
          <Text style={styles.subtle}>Business insights and performance metrics</Text>
        </View>
      </View>

      {/* Tabs */}
      <Segmented
        options={["Overview", "Sales", "Products", "Performance"]}
        value={tab}
        onChange={(v) => setTab(v as any)}
      />

      {/* Content */}
      {tab === "Overview" && (
        <View style={{ gap: 12 }}>
          {/* KPI grid */}
          <View style={styles.kpiGrid}>
            {salesData.map((d) => (
              <KPI
                key={d.period}
                label={d.period}
                value={`${d.sales}  `}
                sub={`${d.orders} orders • Avg: ${d.avg}  •  ${thbToInr(d.sales)}`}
              />
            ))}
          </View>

          {/* Sales Trend placeholder */}
          <Card>
            <CardHeader icon="bar-chart-2" title="Sales Trend" subtitle="Revenue over time" />
            <View style={styles.chartBox}>
              <Text style={styles.subtleSmall}>Chart placeholder</Text>
            </View>
          </Card>

          {/* Route Performance */}
          <Card>
            <CardHeader icon="trending-up" title="Route Performance" subtitle="Sales by route" />
            <View style={{ gap: 10 }}>
              {riderPerformance.map((r) => (
                <View key={r.name} style={[styles.rowBetween, styles.rowItem]}>
                  <View>
                    <Text style={styles.bold}>{r.name}</Text>
                    <Text style={styles.subtleSmall}>{r.route}</Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.bold}>{r.sales}</Text>
                    <Text style={styles.subtleSmall}>{thbToInr(r.sales)} • <Text style={{ color: "#10b981" }}>{r.efficiency}</Text></Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {tab === "Sales" && (
        <Card>
          <CardHeader title="Sales Analytics" subtitle="Detailed sales breakdown and trends" />
          <View style={[styles.chartBox, { height: 300 }]}>
            <Text style={styles.subtleSmall}>Detailed sales charts would go here</Text>
          </View>
        </Card>
      )}

      {tab === "Products" && (
        <Card>
          <CardHeader title="Top Performing Products" subtitle="Best selling items and revenue breakdown" />
          <View style={{ gap: 10 }}>
            {topPerformers.map((item, i) => (
              <View key={item.name} style={[styles.rowBetween, styles.rowItem]}>
                <View style={[styles.row, { gap: 10, alignItems: "center" }]}>
                  <View style={styles.rankDot}><Text style={styles.rankText}>{i + 1}</Text></View>
                  <View>
                    <Text style={styles.bold}>{item.name}</Text>
                    <Text style={styles.subtleSmall}>{item.sales} units sold</Text>
                  </View>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.bold, { color: "#111827" }]}>{item.revenue}</Text>
                  <Text style={styles.subtleSmall}>{thbToInr(item.revenue)}</Text>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}

      {tab === "Performance" && (
        <Card>
          <CardHeader title="Team Performance" subtitle="Rider and route efficiency metrics" />
          <View style={{ gap: 10 }}>
            {riderPerformance.map((r) => (
              <View key={r.name} style={styles.perfBlock}>
                <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                  <Text style={styles.bold}>{r.name}</Text>
                  <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                    <Feather name="map-pin" size={14} color="#6b7280" />
                    <Text style={styles.subtleSmall}>{r.route}</Text>
                  </View>
                </View>
                <View style={styles.rowBetween}>
                  <View>
                    <Text style={styles.subtleSmall}>Sales</Text>
                    <Text style={styles.bold}>{r.sales}  <Text style={styles.subtleSmall}>({thbToInr(r.sales)})</Text></Text>
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={styles.subtleSmall}>Efficiency</Text>
                    <Text style={[styles.bold, { color: "#10b981" }]}>{r.efficiency}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

/** ========= Styles ========= */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  h4: { fontSize: 16, fontWeight: "800", color: "#111827" },
  bold: { fontWeight: "800", color: "#111827" },

  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  /* cards */
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
  rowItem: { paddingVertical: 6 },

  /* KPIs */
  kpiGrid: { gap: 12 },
  kpiValue: { fontSize: 22, fontWeight: "800", color: "#111827", marginVertical: 4 },

  /* tabs */
  segmented: { flexDirection: "row", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  segmentBtnActive: { backgroundColor: "#111827" },
  segmentText: { fontWeight: "700", color: "#111827" },
  segmentTextActive: { color: "#fff" },

  /* chart placeholder */
  chartBox: { height: 180, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, alignItems: "center", justifyContent: "center", backgroundColor: "#f9fafb" },

  /* products list */
  rankDot: { width: 28, height: 28, borderRadius: 999, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },
  rankText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  /* performance block */
  perfBlock: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, padding: 10, backgroundColor: "#f9fafb" },
});
