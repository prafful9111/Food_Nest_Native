import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

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
  { name: "John Smith",   route: "Downtown A", sales: "฿2,456", efficiency: "95%" },
  { name: "Mike Davis",   route: "Suburban B", sales: "฿2,123", efficiency: "92%" },
  { name: "Sarah Johnson",route: "Beach C",    sales: "฿1,890", efficiency: "88%" },
];

const salesRecords = {
  byFoodItem: [
    { item: "Classic Burger", quantity: 145, revenue: "฿1,305", date: "2024-01-15", time: "12:30 PM" },
    { item: "Chicken Tacos",  quantity: 132, revenue: "฿858",   date: "2024-01-15", time: "1:45 PM"  },
    { item: "Fish & Chips",   quantity: 98,  revenue: "฿979",   date: "2024-01-15", time: "2:15 PM"  },
    { item: "Caesar Salad",   quantity: 76,  revenue: "฿607",   date: "2024-01-15", time: "11:20 AM" },
  ],
  byRoute: [
    { route: "Downtown A", rider: "John Smith",  sales: "฿2,456", orders: 89, date: "2024-01-15" },
    { route: "Suburban B", rider: "Mike Davis",  sales: "฿2,123", orders: 76, date: "2024-01-15" },
    { route: "Beach C",    rider: "Sarah Johnson", sales: "฿1,890", orders: 68, date: "2024-01-15" },
  ],
  byTeam: [
    { team: "Team Alpha", members: 4, totalSales: "฿8,945", avgPerMember: "฿2,236", efficiency: "94%" },
    { team: "Team Beta",  members: 3, totalSales: "฿6,234", avgPerMember: "฿2,078", efficiency: "89%" },
    { team: "Team Gamma", members: 5, totalSales: "฿9,876", avgPerMember: "฿1,975", efficiency: "87%" },
  ],
  byRider: [
    { rider: "John Smith",  route: "Downtown A", sales: "฿2,456", orders: 89, hours: "8.5", avgPerHour: "฿289" },
    { rider: "Mike Davis",  route: "Suburban B", sales: "฿2,123", orders: 76, hours: "8.0", avgPerHour: "฿265" },
    { rider: "Sarah Johnson", route: "Beach C",  sales: "฿1,890", orders: 68, hours: "7.5", avgPerHour: "฿252" },
  ],
};

const vehiclesData = {
  vehicles: [
    { id: "V001", type: "Electric Cart", status: "Active",      batteryLevel: "85%", location: "Downtown A", lastService: "2024-01-10" },
    { id: "V002", type: "Electric Cart", status: "Maintenance", batteryLevel: "20%", location: "Workshop",   lastService: "2024-01-05" },
    { id: "V003", type: "Electric Bike", status: "Active",      batteryLevel: "92%", location: "Suburban B", lastService: "2024-01-12" },
    { id: "V004", type: "Electric Cart", status: "Idle",        batteryLevel: "67%", location: "Beach C",    lastService: "2024-01-08" },
  ],
  batteries: [
    { imei: "356938035643809", vehicle: "V001", status: "Good",      charge: "85%", health: "98%",  lastCharge: "2 hours ago" },
    { imei: "356938035643810", vehicle: "V002", status: "Low",       charge: "20%", health: "75%",  lastCharge: "8 hours ago" },
    { imei: "356938035643811", vehicle: "V003", status: "Excellent", charge: "92%", health: "100%", lastCharge: "1 hour ago" },
    { imei: "356938035643812", vehicle: "V004", status: "Good",      charge: "67%", health: "89%",  lastCharge: "4 hours ago" },
  ],
};

/** ========= Helpers ========= */
const thbToInr = (s: string) => {
  const n = Number(String(s).replace(/[^\d.]/g, ""));
  return `INR ${Math.round(n * 2.5)}`;
};

function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function CardHeader({
  icon,
  title,
  subtitle,
}: {
  icon?: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
}) {
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
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
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

/** ========= Lightweight “Table” primitives (no libs) ========= */
const Table = ({ children, minWidth = 520 }: { children: React.ReactNode; minWidth?: number }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
    <View style={[styles.table, { minWidth }]}>{children}</View>
  </ScrollView>
);
const THeader = ({ children }: { children: React.ReactNode }) => (
  <View style={[styles.trow, styles.thead]}>{children}</View>
);
const TRow = ({ children }: { children: React.ReactNode }) => <View style={styles.trow}>{children}</View>;
const TCell = ({
  children,
  w = 120,
  right = false,
  bold = false,
}: {
  children: React.ReactNode;
  w?: number;
  right?: boolean;
  bold?: boolean;
}) => (
  <View style={[styles.tcell, { minWidth: w, maxWidth: w }, right && { alignItems: "flex-end" }]}>
    <Text style={[styles.ttext, bold && styles.bold]} numberOfLines={1}>
      {children}
    </Text>
  </View>
);

/** ========= Screen ========= */
export default function AnalyticsScreen() {
  const [tab, setTab] = useState<"Overview" | "Sales" | "Products" | "Performance" | "Vehicles">(
    "Overview"
  );

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
        options={["Overview", "Sales", "Products", "Performance", "Vehicles"]}
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
                    <Text style={styles.subtleSmall}>
                      {thbToInr(r.sales)} • <Text style={{ color: "#10b981" }}>{r.efficiency}</Text>
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}

      {tab === "Sales" && (
        <View style={{ gap: 12 }}>
          {/* Sales by Food Item */}
          <Card>
            <CardHeader title="Sales by Food Item" subtitle="Individual item performance" />
            <Table minWidth={560}>
              <THeader>
                <TCell w={160} bold>Item</TCell>
                <TCell w={90} bold>Qty</TCell>
                <TCell w={120} bold>Revenue</TCell>
                <TCell w={140} bold>Time</TCell>
              </THeader>
              {salesRecords.byFoodItem.map((r) => (
                <TRow key={r.item}>
                  <TCell w={160} bold>{r.item}</TCell>
                  <TCell w={90}>{r.quantity}</TCell>
                  <TCell w={120}>
                    <Text style={{ color: "#16a34a" }}>{r.revenue}</Text>
                  </TCell>
                  <TCell w={140}>{r.time}</TCell>
                </TRow>
              ))}
            </Table>
          </Card>

          {/* Sales by Route */}
          <Card>
            <CardHeader title="Sales by Route" subtitle="Route performance breakdown" />
            <Table minWidth={560}>
              <THeader>
                <TCell w={160} bold>Route</TCell>
                <TCell w={160} bold>Rider</TCell>
                <TCell w={110} bold>Sales</TCell>
                <TCell w={100} bold>Orders</TCell>
              </THeader>
              {salesRecords.byRoute.map((r) => (
                <TRow key={r.route}>
                  <TCell w={160} bold>{r.route}</TCell>
                  <TCell w={160}>{r.rider}</TCell>
                  <TCell w={110}>
                    <Text style={{ color: "#16a34a" }}>{r.sales}</Text>
                  </TCell>
                  <TCell w={100}>{r.orders}</TCell>
                </TRow>
              ))}
            </Table>
          </Card>

          {/* Sales by Team */}
          <Card>
            <CardHeader title="Sales by Team" subtitle="Team performance metrics" />
            <Table minWidth={620}>
              <THeader>
                <TCell w={160} bold>Team</TCell>
                <TCell w={110} bold>Members</TCell>
                <TCell w={140} bold>Sales</TCell>
                <TCell w={140} bold>Efficiency</TCell>
              </THeader>
              {salesRecords.byTeam.map((r) => (
                <TRow key={r.team}>
                  <TCell w={160} bold>{r.team}</TCell>
                  <TCell w={110}>{r.members}</TCell>
                  <TCell w={140}>
                    <Text style={{ color: "#16a34a" }}>{r.totalSales}</Text>
                  </TCell>
                  <TCell w={140}>
                    <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                      <View style={[styles.badgeDot, { backgroundColor: "#16a34a" }]} />
                      <Text>{r.efficiency}</Text>
                    </View>
                  </TCell>
                </TRow>
              ))}
            </Table>
          </Card>

          {/* Sales by Rider & Time */}
          <Card>
            <CardHeader title="Sales by Rider & Time" subtitle="Individual rider performance" />
            <Table minWidth={620}>
              <THeader>
                <TCell w={180} bold>Rider</TCell>
                <TCell w={120} bold>Sales</TCell>
                <TCell w={100} bold>Hours</TCell>
                <TCell w={120} bold>Avg/Hr</TCell>
              </THeader>
              {salesRecords.byRider.map((r) => (
                <TRow key={r.rider}>
                  <TCell w={180} bold>{r.rider}</TCell>
                  <TCell w={120}>
                    <Text style={{ color: "#2563eb" }}>{r.sales}</Text>
                  </TCell>
                  <TCell w={100}>{r.hours}h</TCell>
                  <TCell w={120}>
                    <Text style={{ color: "#2563eb" }}>{r.avgPerHour}</Text>
                  </TCell>
                </TRow>
              ))}
            </Table>
          </Card>
        </View>
      )}

      {tab === "Products" && (
        <Card>
          <CardHeader title="Top Performing Products" subtitle="Best selling items and revenue breakdown" />
          <View style={{ gap: 10 }}>
            {topPerformers.map((item, i) => (
              <View key={item.name} style={[styles.rowBetween, styles.rowItem]}>
                <View style={[styles.row, { gap: 10, alignItems: "center" }]}>
                  <View style={styles.rankDot}>
                    <Text style={styles.rankText}>{i + 1}</Text>
                  </View>
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
                    <Text style={styles.bold}>
                      {r.sales} <Text style={styles.subtleSmall}>({thbToInr(r.sales)})</Text>
                    </Text>
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

      {tab === "Vehicles" && (
        <View style={{ gap: 12 }}>
          {/* Vehicle Status */}
          <Card>
            <CardHeader
              title="Vehicle Status"
              subtitle="Current status of all vehicles"
            />
            <Table minWidth={640}>
              <THeader>
                <TCell w={100} bold>ID</TCell>
                <TCell w={160} bold>Type</TCell>
                <TCell w={150} bold>Status</TCell>
                <TCell w={130} bold>Battery</TCell>
                <TCell w={150} bold>Location</TCell>
              </THeader>
              {vehiclesData.vehicles.map((v) => (
                <TRow key={v.id}>
                  <TCell w={100} bold>{v.id}</TCell>
                  <TCell w={160}>{v.type}</TCell>
                  <TCell w={150}>
                    <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                      <View
                        style={[
                          styles.badgeDot,
                          v.status === "Active"
                            ? { backgroundColor: "#16a34a" }
                            : v.status === "Maintenance"
                            ? { backgroundColor: "#dc2626" }
                            : { backgroundColor: "#6b7280" },
                        ]}
                      />
                      <Text>{v.status}</Text>
                    </View>
                  </TCell>
                  <TCell w={130}>
                    <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                      <MaterialCommunityIcons name="battery-medium" size={14} color="#111827" />
                      <Text>{v.batteryLevel}</Text>
                    </View>
                  </TCell>
                  <TCell w={150}>{v.location}</TCell>
                </TRow>
              ))}
            </Table>
          </Card>

          {/* Battery Analysis */}
          <Card>
            <CardHeader
              title="Battery Analysis"
              subtitle="Battery health and charge status"
            />
            <Table minWidth={700}>
              <THeader>
                <TCell w={200} bold>IMEI</TCell>
                <TCell w={110} bold>Vehicle</TCell>
                <TCell w={160} bold>Status</TCell>
                <TCell w={120} bold>Charge</TCell>
                <TCell w={120} bold>Health</TCell>
              </THeader>
              {vehiclesData.batteries.map((b) => {
                const low = parseInt(b.charge) < 30;
                const statusStyle =
                  b.status === "Excellent"
                    ? { backgroundColor: "#16a34a" }
                    : b.status === "Good"
                    ? { backgroundColor: "#2563eb" }
                    : { backgroundColor: "#dc2626" };

                return (
                  <TRow key={b.imei}>
                    <TCell w={200}>
                      <Text style={styles.mono}>{b.imei}</Text>
                    </TCell>
                    <TCell w={110}>{b.vehicle}</TCell>
                    <TCell w={160}>
                      <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                        <View style={[styles.badgeDot, statusStyle]} />
                        <Text>{b.status}</Text>
                      </View>
                    </TCell>
                    <TCell w={120}>
                      <View style={[styles.row, { alignItems: "center", gap: 6 }]}>
                        {low && <MaterialCommunityIcons name="alert" size={14} color="#dc2626" />}
                        <Text>{b.charge}</Text>
                      </View>
                    </TCell>
                    <TCell w={120}>{b.health}</TCell>
                  </TRow>
                );
              })}
            </Table>
          </Card>

          {/* Battery Performance Summary */}
          <Card>
            <CardHeader title="Battery Performance Summary" subtitle="Overall battery fleet status" />
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryValue, { color: "#16a34a" }]}>3</Text>
                <Text style={styles.summaryLabel}>Healthy Batteries</Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryValue, { color: "#dc2626" }]}>1</Text>
                <Text style={styles.summaryLabel}>Low Batteries</Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryValue, { color: "#2563eb" }]}>81%</Text>
                <Text style={styles.summaryLabel}>Average Charge</Text>
              </View>
              <View style={styles.summaryCell}>
                <Text style={[styles.summaryValue, { color: "#2563eb" }]}>90.5%</Text>
                <Text style={styles.summaryLabel}>Average Health</Text>
              </View>
            </View>
          </Card>
        </View>
      )}
    </ScrollView>
  );
}

/** ========= Styles ========= */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32, backgroundColor: "#fff" },
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
  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  segmentBtnActive: { backgroundColor: "#111827" },
  segmentText: { fontWeight: "700", color: "#111827" },
  segmentTextActive: { color: "#fff" },

  /* chart placeholder */
  chartBox: {
    height: 180,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },

  /* products list */
  rankDot: {
    width: 28,
    height: 28,
    borderRadius: 999,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: { color: "#fff", fontWeight: "800", fontSize: 12 },

  /* performance block */
  perfBlock: {
    borderWidth: 1,
    borderColor: "#eef1f5",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#f9fafb",
  },

  /* tiny badge-dot */
  badgeDot: { width: 10, height: 10, borderRadius: 5 },

  /* simple table */
  table: {
    borderWidth: 1,
    borderColor: "#eef1f5",
    borderRadius: 12,
    overflow: "hidden",
  },
  thead: {
    backgroundColor: "#f3f4f6",
    borderBottomWidth: 1,
    borderBottomColor: "#eef1f5",
  },
  trow: { flexDirection: "row", paddingVertical: 10, paddingHorizontal: 12, gap: 12 },
  tcell: { justifyContent: "center" },
  ttext: { color: "#111827" },
  mono: { fontFamily: "monospace" },

  /* summary */
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  summaryCell: {
    width: "47%",
    backgroundColor: "#f9fafb",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eef1f5",
  },
  summaryValue: { fontSize: 20, fontWeight: "800" },
  summaryLabel: { color: "#6b7280", fontSize: 12, marginTop: 2 },
});
