// screens/AssignRider.tsx
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- sample data ---------- */
type Rider = { id: number; name: string; status: "Available" | "Active" | "Off Duty"; route: string };
type Route = { id: number; name: string; status: "Available" | "Assigned" };
type FoodItem = { name: string; available: number };

const riders: Rider[] = [
  { id: 1, name: "John Smith", status: "Available", route: "None" },
  { id: 2, name: "Mike Davis", status: "Active", route: "Downtown A" },
  { id: 3, name: "Sarah Johnson", status: "Available", route: "None" },
  { id: 4, name: "Tom Wilson", status: "Off Duty", route: "None" },
];

const routes: Route[] = [
  { id: 1, name: "Downtown A", status: "Available" },
  { id: 2, name: "Suburban B", status: "Assigned" },
  { id: 3, name: "Beach C", status: "Available" },
  { id: 4, name: "University D", status: "Available" },
];

const foodItems: FoodItem[] = [
  { name: "Classic Burger", available: 50 },
  { name: "Chicken Tacos", available: 30 },
  { name: "Fish & Chips", available: 25 },
  { name: "Caesar Salad", available: 20 },
];

/* ---------- small Badge (same pattern as other app screens) ---------- */
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

/* ---------- simple modal picker ---------- */
function PickerSheet<T extends { id: number; name: string }>({
  visible,
  onClose,
  title,
  options,
  renderRight,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  options: T[];
  renderRight?: (o: T) => React.ReactNode;
  onSelect: (o: T) => void;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose}>
            <Feather name="x" size={20} />
          </Pressable>
        </View>
        <ScrollView>
          {options.map((o) => (
            <Pressable key={o.id} style={styles.optionRow} onPress={() => { onSelect(o); onClose(); }}>
              <Text style={styles.optionText}>{o.name}</Text>
              <View>{renderRight ? renderRight(o) : null}</View>
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- screen ---------- */
export default function AssignRiderScreen() {
  const [selectedRider, setSelectedRider] = useState<Rider | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [foodQuantities, setFoodQuantities] = useState<Record<string, number>>({});
  const [riderOpen, setRiderOpen] = useState(false);
  const [routeOpen, setRouteOpen] = useState(false);

  const totalItems = useMemo(
    () => Object.values(foodQuantities).reduce((sum, n) => sum + (Number.isFinite(n) ? n : 0), 0),
    [foodQuantities]
  );

  const canAssign = !!selectedRider && !!selectedRoute;

  const reset = () => {
    setSelectedRider(null);
    setSelectedRoute(null);
    setFoodQuantities({});
  };

  const assign = () => {
    if (!canAssign) return;
    const qtyLines = Object.entries(foodQuantities)
      .filter(([_, q]) => q > 0)
      .map(([k, q]) => `• ${k}: ${q}`)
      .join("\n");
    Alert.alert(
      "Assignment Created",
      [
        `Rider: ${selectedRider?.name}`,
        `Route: ${selectedRoute?.name}`,
        qtyLines ? `\nFood Allocation:\n${qtyLines}` : "\nNo food items allocated",
      ].join("\n")
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View>
        <Text style={styles.h1}>Assign Rider</Text>
        <Text style={styles.subtle}>Assign riders to routes and allocate food inventory</Text>
      </View>

      {/* Grid: Rider/Route + Food Allocation */}
      <View style={{ gap: 12 }}>
        {/* Rider & Route */}
        <View style={styles.card}>
          <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 8 }]}>
            <Feather name="user" size={18} />
            <Text style={styles.sectionTitle}>Rider Assignment</Text>
          </View>
          <Text style={styles.subtle}>Select rider and route</Text>

          <View style={{ height: 12 }} />

          {/* Rider picker */}
          <Text style={styles.label}>Select Rider</Text>
          <Pressable style={styles.inputLike} onPress={() => setRiderOpen(true)}>
            <Text style={selectedRider ? styles.inputValue : styles.inputPlaceholder}>
              {selectedRider ? selectedRider.name : "Choose a rider"}
            </Text>
            {selectedRider ? (
              <Badge
                text={selectedRider.status}
                variant={selectedRider.status === "Available" ? "solid" : "outline"}
                color={selectedRider.status === "Available" ? "#059669" : "#6b7280"}
              />
            ) : (
              <Feather name="chevron-down" size={18} color="#6b7280" />
            )}
          </Pressable>

          {/* Route picker */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Select Route</Text>
          <Pressable style={styles.inputLike} onPress={() => setRouteOpen(true)}>
            <Text style={selectedRoute ? styles.inputValue : styles.inputPlaceholder}>
              {selectedRoute ? selectedRoute.name : "Choose a route"}
            </Text>
            {selectedRoute ? (
              <Badge
                text={selectedRoute.status}
                variant={selectedRoute.status === "Available" ? "solid" : "outline"}
                color={selectedRoute.status === "Available" ? "#059669" : "#6b7280"}
              />
            ) : (
              <Feather name="chevron-down" size={18} color="#6b7280" />
            )}
          </Pressable>
        </View>

        {/* Food Allocation */}
        <View style={styles.card}>
          <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 8 }]}>
            <Feather name="package" size={18} />
            <Text style={styles.sectionTitle}>Food Allocation</Text>
          </View>
          <Text style={styles.subtle}>Set quantities for each food item</Text>

          <View style={{ height: 8 }} />
          <View style={styles.listWrap}>
            {foodItems.map((item, idx) => {
              const val = foodQuantities[item.name] ?? 0;
              return (
                <View key={item.name}>
                  <View style={[styles.listRow, { alignItems: "center" }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.listLeft}>{item.name}</Text>
                      <Text style={styles.subtleSmall}>Available: {item.available}</Text>
                    </View>
                    <TextInput
                      keyboardType="number-pad"
                      placeholder="0"
                      value={val ? String(val) : ""}
                      onChangeText={(t) => {
                        const n = Math.max(0, Math.min(Number(t.replace(/[^\d]/g, "")) || 0, item.available));
                        setFoodQuantities((prev) => ({ ...prev, [item.name]: n }));
                      }}
                      style={styles.qtyInput}
                    />
                  </View>
                  {idx < foodItems.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Assignment Summary</Text>
        <Text style={styles.subtle}>Review assignment details before confirming</Text>

        <View style={{ height: 10 }} />

        <View style={styles.summaryGrid}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Rider</Text>
            <Text style={styles.summaryValue}>{selectedRider?.name ?? "Not selected"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Route</Text>
            <Text style={styles.summaryValue}>{selectedRoute?.name ?? "Not selected"}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Total Items</Text>
            <Text style={styles.summaryValue}>{totalItems} items</Text>
          </View>
        </View>

        <View style={{ height: 12 }} />

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Pressable
            disabled={!canAssign}
            onPress={assign}
            style={({ pressed }) => [
              styles.primaryBtn,
              (!canAssign || pressed) && { opacity: 0.9 },
            ]}
          >
            <Feather name="truck" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Assign Rider</Text>
          </Pressable>

          <Pressable onPress={reset} style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.ghostBtnText}>Reset</Text>
          </Pressable>
        </View>
      </View>

      {/* Pickers */}
      <PickerSheet
        visible={riderOpen}
        onClose={() => setRiderOpen(false)}
        title="Choose a rider"
        options={riders}
        renderRight={(r: Rider) => (
          <Badge
            text={r.status}
            variant={r.status === "Available" ? "solid" : "outline"}
            color={r.status === "Available" ? "#059669" : "#6b7280"}
          />
        )}
        onSelect={(r) => setSelectedRider(r)}
      />

      <PickerSheet
        visible={routeOpen}
        onClose={() => setRouteOpen(false)}
        title="Choose a route"
        options={routes}
        renderRight={(rt: Route) => (
          <Badge
            text={rt.status}
            variant={rt.status === "Available" ? "solid" : "outline"}
            color={rt.status === "Available" ? "#059669" : "#6b7280"}
          />
        )}
        onSelect={(rt) => setSelectedRoute(rt)}
      />
    </ScrollView>
  );
}

/* ---------- styles (aligned with overview.tsx look) ---------- */
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

  /* input-like pressables */
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 6 },
  inputLike: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputPlaceholder: { color: "#6b7280" },
  inputValue: { color: "#111827", fontWeight: "700" },

  /* list/table look */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listLeft: { fontWeight: "700", color: "#111827", marginBottom: 2 },
  qtyInput: {
    width: 70,
    height: 40,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 10,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: "#eef1f5" },

  /* summary */
  summaryGrid: { flexDirection: "row", gap: 12 },
  summaryValue: { fontWeight: "700", color: "#111827", marginTop: 2 },

  /* buttons */
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  ghostBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  ghostBtnText: { color: "#111827", fontWeight: "800" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* picker sheet */
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 16,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eef1f5",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  optionRow: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionText: { fontSize: 14, color: "#111827", fontWeight: "600" },
});
