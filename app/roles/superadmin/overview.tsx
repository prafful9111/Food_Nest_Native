import React, { useMemo } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

type Analytic = {
  title: string;
  value: string;
  change: string;
  icon: keyof typeof Feather.glyphMap;
  color: "success" | "primary" | "warning" | "accent";
};

const toINR = (thbWithSymbol: string) => {
  const n = Number(thbWithSymbol.replace(/[^\d.]/g, ""));
  return isNaN(n) ? "" : `INR ${Math.round(n * 2.5)}`; // ← fixed backticks
};

export default function SuperAdminOverview() {
  const { t } = useTranslation();

  // Build the analytics array using i18n (so titles are translated)
  const analytics: Analytic[] = useMemo(
    () => [
      { title: t("superadmin.analytics.totalSales"),   value: "฿12,450", change: "+12.5%", icon: "trending-up",  color: "success" },
      { title: t("superadmin.analytics.activeRoutes"), value: "8",       change: "+2",      icon: "navigation-2", color: "primary" },
      { title: t("superadmin.analytics.inventoryLow"), value: "5",       change: t("common.alert"), icon: "alert-triangle", color: "warning" },
      { title: t("superadmin.analytics.foodRequests"), value: "12",      change: "+4",      icon: "package",      color: "accent" },
    ],
    [t]
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <LanguageSwitcher />

      {/* Header */}
      <View>
        <Text style={styles.h1}>{t("superadmin.header.title")}</Text>
        <Text style={styles.subtle}>{t("superadmin.header.subtitle")}</Text>
      </View>

      {/* Analytics grid */}
      <View style={{ gap: 12 }}>
        {chunk(analytics, 2).map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((a) => (
              <View key={a.title} style={styles.card}>
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{a.title}</Text>
                  <Feather name={a.icon} size={18} color={tone(a.color)} />
                </View>

                <Text style={styles.metric}>
                  {a.title === t("superadmin.analytics.totalSales") ? (
                    <>
                      {a.value} <Text style={styles.inr}>{toINR(a.value)}</Text>
                    </>
                  ) : (
                    a.value
                  )}
                </Text>

                <Text style={[styles.delta, { color: tone(a.color) }]}>
                  {t("superadmin.analytics.delta", { change: a.change })}
                </Text>
              </View>
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>

      {/* Two-column: Recent Activities & Quick Stats */}
      <View style={{ gap: 12 }}>
        <ListCard
          titleIcon="users"
          title={t("superadmin.recent.title")}
          subtitle={t("superadmin.recent.subtitle")}
          items={[
            { left: t("superadmin.recent.items.newRider"),   right: "2h ago", sub: "Mike Johnson · Route A" },
            { left: t("superadmin.recent.items.inventory"),  right: "4h ago", sub: t("superadmin.recent.items.inventorySub") },
            { left: t("superadmin.recent.items.foodAdded"),  right: "6h ago", sub: "Chicken Tacos · Menu" },
          ]}
        />

        <ListCard
          titleIcon="bar-chart-2"
          title={t("superadmin.stats.title")}
          subtitle={t("superadmin.stats.subtitle")}
          items={[
            { left: t("superadmin.stats.items.totalUsers"), right: "24" },
            { left: t("superadmin.stats.items.activeCarts"), right: "8" },
            { left: t("superadmin.stats.items.menuItems"), right: "32" },
            { left: t("superadmin.stats.items.routes"), right: "12" },
          ]}
          compact
        />
      </View>
    </ScrollView>
  );
}

/* ---------- Reusable list card ---------- */
function ListCard({
  titleIcon,
  title,
  subtitle,
  items,
  compact = false,
}: {
  titleIcon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle: string;
  items: { left: string; right: string; sub?: string }[];
  compact?: boolean;
}) {
  return (
    <View style={[styles.card, { flex: 1 }]}>
      <View style={{ marginBottom: 8 }}>
        <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
          <Feather name={titleIcon} size={18} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <Text style={styles.subtle}>{subtitle}</Text>
      </View>

      <View style={styles.listWrap}>
        {items.map((it, idx) => (
          <View key={idx}>
            <View style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={compact ? styles.listLeftCompact : styles.listLeft}>
                  {it.left}
                </Text>
                {it.sub ? <Text style={styles.subtleSmall}>{it.sub}</Text> : null}
              </View>
              <Text style={styles.listRight}>{it.right}</Text>
            </View>
            {idx < items.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------- helpers ---------- */
function tone(name: "success" | "primary" | "warning" | "accent") {
  switch (name) {
    case "success": return "#059669";
    case "primary": return "#2563eb";
    case "warning": return "#d97706";
    case "accent":  return "#7c3aed";
  }
}

function chunk<T>(arr: T[], size: number) {
  const rows: T[][] = [];
  for (let i = 0; i < arr.length; i += size) rows.push(arr.slice(i, i + size));
  return rows;
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },
  row: { flexDirection: "row" },
  card: {
    flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: "#eceff3", shadowColor: "#0f172a",
    shadowOpacity: 0.06, shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10, elevation: 2,
  },
  /* analytics */
  cardTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  metric: { fontSize: 20, fontWeight: "800", color: "#111827", marginTop: 6 },
  inr: { fontSize: 11, color: "#6b7280" },
  delta: { fontSize: 12, marginTop: 2 },
  /* list card */
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff",
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  listLeft: { fontWeight: "700", color: "#111827", marginBottom: 2 },
  listLeftCompact: { fontWeight: "600", color: "#111827" },
  listRight: { fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#eef1f5" },
});
