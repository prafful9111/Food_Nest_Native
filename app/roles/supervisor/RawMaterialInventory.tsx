// app/features/inventory/RawMaterialInventory.tsx (Expo / React Native)

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------------- Types & Data ---------------- */
type StockStatus = "critical" | "low" | "adequate";

interface RawMaterial {
  id: number;
  name: string;
  category: string;
  currentStock: number;
  minimumStock: number;
  maxStock: number;
  unit: string;
  supplier: string;
  lastRestocked: string;
  costPerUnit: number;
  status: StockStatus;
}

const rawMaterials: RawMaterial[] = [
  {
    id: 1,
    name: "Chicken Breast",
    category: "Meat",
    currentStock: 15,
    minimumStock: 50,
    maxStock: 200,
    unit: "kg",
    supplier: "Fresh Meat Co.",
    lastRestocked: "2024-01-15",
    costPerUnit: 12.5,
    status: "critical",
  },
  {
    id: 2,
    name: "Basmati Rice",
    category: "Grains",
    currentStock: 80,
    minimumStock: 100,
    maxStock: 500,
    unit: "kg",
    supplier: "Grain Masters",
    lastRestocked: "2024-01-20",
    costPerUnit: 3.2,
    status: "low",
  },
  {
    id: 3,
    name: "Tomatoes",
    category: "Vegetables",
    currentStock: 25,
    minimumStock: 30,
    maxStock: 100,
    unit: "kg",
    supplier: "Fresh Farms",
    lastRestocked: "2024-01-22",
    costPerUnit: 2.8,
    status: "low",
  },
  {
    id: 4,
    name: "Cooking Oil",
    category: "Oils",
    currentStock: 120,
    minimumStock: 50,
    maxStock: 200,
    unit: "liters",
    supplier: "Oil Express",
    lastRestocked: "2024-01-18",
    costPerUnit: 4.5,
    status: "adequate",
  },
  {
    id: 5,
    name: "Onions",
    category: "Vegetables",
    currentStock: 8,
    minimumStock: 40,
    maxStock: 150,
    unit: "kg",
    supplier: "Fresh Farms",
    lastRestocked: "2024-01-10",
    costPerUnit: 1.9,
    status: "critical",
  },
  {
    id: 6,
    name: "Salt",
    category: "Spices",
    currentStock: 95,
    minimumStock: 20,
    maxStock: 100,
    unit: "kg",
    supplier: "Spice World",
    lastRestocked: "2024-01-05",
    costPerUnit: 0.8,
    status: "adequate",
  },
];

/* ---------------- Small UI primitives ---------------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({
  label,
  bg = "#f3f4f6",
  fg = "#111827",
  outline = false,
}: {
  label: string;
  bg?: string;
  fg?: string;
  outline?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        outline && { backgroundColor: "transparent", borderWidth: 1, borderColor: "#e5e7eb" },
        { backgroundColor: bg },
      ]}
    >
      <Text style={[styles.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}
function ProgressBar({ value, color = "#111827" }: { value: number; color?: string }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressBg}>
      <View style={[styles.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

/* ---------------- Helpers ---------------- */
const getStatusColors = (status: StockStatus) => {
  switch (status) {
    case "critical":
      return { bg: "#fee2e2", fg: "#991b1b" }; // red
    case "low":
      return { bg: "#fef3c7", fg: "#92400e" }; // amber
    case "adequate":
    default:
      return { bg: "#e5e7eb", fg: "#374151" }; // gray
  }
};
const getStockPercentage = (current: number, max: number) =>
  max > 0 ? (current / max) * 100 : 0;
const reorderQty = (item: RawMaterial) => Math.max(0, item.maxStock - item.currentStock);

const buttonBg = {
  primary: "#111827",
  secondary: "#e5e7eb",
  destructive: "#dc2626",
};
const buttonText = {
  primary: "#ffffff",
  secondary: "#111827",
  destructive: "#ffffff",
};

/* ---------------- Screen ---------------- */
export default function RawMaterialInventoryScreen() {
  const criticalItems = rawMaterials.filter((i) => i.status === "critical");
  const lowStockItems = rawMaterials.filter((i) => i.status === "low");

  const handleReorder = (itemName: string, qty: number) => {
    Alert.alert("Reorder Initiated", `Reorder request for ${qty} units of ${itemName} has been sent to procurement.`);
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Raw Material Inventory</Text>
        <Text style={styles.subtle}>Monitor stock levels and manage raw material reorders</Text>
      </View>

      {/* Critical Alerts */}
      {criticalItems.length > 0 && (
        <Card style={{ borderColor: "#fecaca" }}>
          <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
            <View style={styles.rowCenter}>
              <Feather name="alert-triangle" size={18} color="#b91c1c" />
              <Text style={[styles.cardTitle, { color: "#b91c1c", marginLeft: 8 }]}>
                Critical Stock Alerts
              </Text>
            </View>
            <Text style={styles.cardDesc}>
              {criticalItems.length} item{criticalItems.length > 1 ? "s" : ""} require immediate attention
            </Text>
          </View>

          <View style={{ padding: 12, gap: 8 }}>
            {criticalItems.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#fee2e2",
                  padding: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexShrink: 1 }}>
                  <Text style={{ fontWeight: "700", color: "#111827" }}>{item.name}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    Only {item.currentStock} {item.unit} remaining (Min: {item.minimumStock} {item.unit})
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleReorder(item.name, reorderQty(item))}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: buttonBg.destructive },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Feather name="shopping-cart" size={14} color={buttonText.destructive} />
                  <Text style={[styles.btnText, { color: buttonText.destructive }]}>Reorder Now</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Low Stock */}
      {lowStockItems.length > 0 && (
        <Card>
          <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
            <View style={styles.rowCenter}>
              <Feather name="trending-down" size={18} color="#b45309" />
              <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Low Stock Items</Text>
            </View>
            <Text style={styles.cardDesc}>
              {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} approaching minimum stock levels
            </Text>
          </View>

          <View style={{ padding: 12, gap: 8 }}>
            {lowStockItems.map((item) => (
              <View
                key={item.id}
                style={{
                  backgroundColor: "#fef3c7",
                  padding: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flexShrink: 1 }}>
                  <Text style={{ fontWeight: "700", color: "#111827" }}>{item.name}</Text>
                  <Text style={{ color: "#6b7280", fontSize: 12 }}>
                    {item.currentStock} {item.unit} remaining (Min: {item.minimumStock} {item.unit})
                  </Text>
                </View>

                <Pressable
                  onPress={() => handleReorder(item.name, reorderQty(item))}
                  style={({ pressed }) => [
                    styles.btn,
                    { backgroundColor: buttonBg.secondary },
                    pressed && { opacity: 0.9 },
                  ]}
                >
                  <Feather name="shopping-cart" size={14} color={buttonText.secondary} />
                  <Text style={[styles.btnText, { color: buttonText.secondary }]}>Reorder</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Complete Inventory */}
      <Card>
        <View style={{ paddingHorizontal: 12, paddingTop: 12, paddingBottom: 4 }}>
          <View style={styles.rowCenter}>
            <Feather name="box" size={18} color="#111827" />
            <Text style={[styles.cardTitle, { marginLeft: 8 }]}>Complete Raw Material Inventory</Text>
          </View>
        </View>

        <View style={{ padding: 12, gap: 12 }}>
          {rawMaterials.map((item) => {
            const sc = getStatusColors(item.status);
            const pct = getStockPercentage(item.currentStock, item.maxStock);
            const barColor =
              item.status === "critical"
                ? "#dc2626"
                : item.status === "low"
                ? "#b45309"
                : "#16a34a";

            return (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemTopRow}>
                  <View>
                    <Text style={styles.itemTitle}>{item.name}</Text>
                    <Text style={styles.itemCat}>{item.category}</Text>
                  </View>
                  <Badge label={item.status} bg={sc.bg} fg={sc.fg} />
                </View>

                {/* Stock line + progress */}
                <View style={{ gap: 6 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.small}>Stock Level</Text>
                    <Text style={styles.small}>
                      {item.currentStock}/{item.maxStock} {item.unit}
                    </Text>
                  </View>
                  <ProgressBar value={pct} color={barColor} />
                </View>

                {/* Meta grid */}
                <View style={styles.metaGrid}>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Supplier</Text>
                    <Text style={styles.metaValue}>{item.supplier}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Cost per {item.unit}</Text>
                    <Text style={styles.metaValue}>${item.costPerUnit.toFixed(2)}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Last Restocked</Text>
                    <Text style={styles.metaValue}>{item.lastRestocked}</Text>
                  </View>
                  <View style={styles.metaCol}>
                    <Text style={styles.metaLabel}>Reorder Qty</Text>
                    <Text style={styles.metaValue}>
                      {reorderQty(item)} {item.unit}
                    </Text>
                  </View>
                </View>

                {(item.status === "critical" || item.status === "low") && (
                  <View style={{ paddingTop: 10, borderTopWidth: 1, borderTopColor: "#e5e7eb" }}>
                    <Pressable
                      onPress={() => handleReorder(item.name, reorderQty(item))}
                      style={({ pressed }) => [
                        styles.btn,
                        {
                          alignSelf: "flex-start",
                          backgroundColor:
                            item.status === "critical" ? buttonBg.destructive : buttonBg.secondary,
                        },
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Feather
                        name="shopping-cart"
                        size={14}
                        color={
                          item.status === "critical"
                            ? buttonText.destructive
                            : buttonText.secondary
                        }
                      />
                      <Text
                        style={[
                          styles.btnText,
                          {
                            color:
                              item.status === "critical"
                                ? buttonText.destructive
                                : buttonText.secondary,
                          },
                        ]}
                      >
                        Reorder {reorderQty(item)} {item.unit}
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </Card>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 28, backgroundColor: "#f9fafb", gap: 12 },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280", marginTop: 2 },

  /* Cards */
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#eceff3",
    shadowColor: "#0f172a",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  cardDesc: { color: "#6b7280", fontSize: 12, marginTop: 4 },

  /* Badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  /* Buttons */
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnText: { fontWeight: "800", letterSpacing: 0.3 },

  /* Progress */
  progressBg: { height: 8, borderRadius: 999, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 999 },

  /* Item card */
  itemCard: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 12,
    gap: 10,
    backgroundColor: "#fff",
  },
  itemTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  itemCat: { color: "#6b7280", fontSize: 12 },

  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  small: { fontSize: 12, color: "#111827" },

  /* Meta grid (2 columns on phones) */
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  metaCol: {
    width: "48%",
    gap: 2,
  },
  metaLabel: { color: "#6b7280", fontSize: 12 },
  metaValue: { color: "#111827", fontWeight: "600" },
});

