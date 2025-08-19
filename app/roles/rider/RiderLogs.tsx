// screens/LogSales.tsx
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

/* ---------- sample data (from your web page) ---------- */
type Item = { id: number; name: string; price: number; remaining: number };
const availableItems: Item[] = [
  { id: 1, name: "Vada Pavr", price: 8.99, remaining: 8 },
  { id: 2, name: "Poha", price: 6.5, remaining: 7 },
  { id: 3, name: "Tea", price: 9.99, remaining: 4 },
  { id: 4, name: "Water Bottle", price: 7.99, remaining: 5 },
];

type Sale = { id: number; item: string; quantity: number; amount: number; location: string; time: string };
const todaysSales: Sale[] = [
  { id: 1, item: "Vada Pav", quantity: 2, amount: 17.98, location: "Central Park", time: "12:30 PM" },
  { id: 2, item: "Poha", quantity: 1, amount: 6.5, location: "Business District", time: "12:15 PM" },
  { id: 3, item: "Tea", quantity: 1, amount: 9.99, location: "City Hall", time: "12:00 PM" },
  { id: 4, item: "Poha", quantity: 1, amount: 7.99, location: "Central Park", time: "11:45 AM" },
  { id: 5, item: "Water Bottle", quantity: 3, amount: 26.97, location: "Business District", time: "11:30 AM" },
];

/* ---------- helpers ---------- */
const toINR = (thb: number) => `INR ${Math.round(thb * 2.5)}`; // same hint as web
const tone = {
  success: "#059669",
  primary: "#2563eb",
  gray: "#6b7280",
  warning: "#d97706",
} as const;

/* ---------- tiny UI atoms ---------- */
function Badge({
  text,
  color = "#2563eb",
  variant = "outline",
}: {
  text: string;
  color?: string;
  variant?: "solid" | "outline";
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

function HeaderRow({ columns }: { columns: string[] }) {
  return (
    <View style={[styles.listRow, { backgroundColor: "#f8fafc" }]}>
      {columns.map((c, i) => (
        <Text
          key={c + i}
          style={[
            styles.headerCell,
            i === 0 ? { flex: 1.2 } :
            c === "Qty" ? { width: 48, textAlign: "center" } :
            c === "Amount" ? { width: 120, textAlign: "right" } :
            c === "Location" ? { flex: 1.2 } :
            { width: 90, textAlign: "right" },
          ]}
          numberOfLines={1}
        >
          {c}
        </Text>
      ))}
    </View>
  );
}

/* ---------- simple modal picker ---------- */
function PickerSheet<T extends { id?: number; name: string }>({
  visible,
  title,
  options,
  onSelect,
  onClose,
  renderRight,
}: {
  visible: boolean;
  title: string;
  options: T[];
  onSelect: (o: T) => void;
  onClose: () => void;
  renderRight?: (o: T) => React.ReactNode;
}) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Pressable onPress={onClose}><Feather name="x" size={20} /></Pressable>
        </View>
        <ScrollView>
          {options.map((o, idx) => (
            <Pressable
              key={(o.id ?? idx).toString()}
              style={styles.optionRow}
              onPress={() => { onSelect(o); onClose(); }}
            >
              <Text style={styles.optionText}>{o.name}</Text>
              {renderRight ? <View>{renderRight(o)}</View> : null}
            </Pressable>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

/* ---------- screen ---------- */
export default function LogSalesScreen() {
  const [itemOpen, setItemOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [payment, setPayment] = useState<{ name: string } | null>(null);

  const qtyNum = Math.max(0, Math.min(Number(quantity || 0), selectedItem?.remaining ?? 999));
  const lineTotal = useMemo(
    () => (selectedItem && qtyNum ? selectedItem.price * qtyNum : 0),
    [selectedItem, qtyNum]
  );

  const todayTotal = useMemo(
    () => todaysSales.reduce((s, x) => s + x.amount, 0),
    []
  );
  const transactions = todaysSales.length;
  const avgSale = transactions ? todayTotal / transactions : 0;

  const submit = () => {
    if (!selectedItem || !qtyNum || !location || !payment) return;
    Alert.alert(
      "Sale Logged",
      [
        `Item: ${selectedItem.name}`,
        `Qty: ${qtyNum}`,
        `Payment: ${payment.name}`,
        `Location: ${location}`,
        `Total: ฿${lineTotal.toFixed(2)} (${toINR(lineTotal)})`,
      ].join("\n")
    );
    // reset
    setSelectedItem(null);
    setQuantity("");
    setLocation("");
    setPayment(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View>
        <Text style={styles.h1}>Log Purchases</Text>
        <Text style={styles.subtle}>Record your food sales and track daily performance</Text>
      </View>

      {/* Form + Performance */}
      <View style={{ gap: 12 }}>
        {/* Add New Sale */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="plus" size={18} />
              <Text style={styles.sectionTitle}>Add New Sale</Text>
            </View>
            <Text style={styles.subtle}>Record a new food sale</Text>
          </View>

          {/* Food Item */}
          <Text style={styles.label}>Food Item</Text>
          <Pressable style={styles.inputLike} onPress={() => setItemOpen(true)}>
            <Text style={selectedItem ? styles.inputValue : styles.inputPlaceholder}>
              {selectedItem ? selectedItem.name : "Select food item"}
            </Text>
            {selectedItem ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Badge variant="outline" color={tone.primary} text={`฿${selectedItem.price.toFixed(2)}`} />
                <Badge variant="outline" color={tone.gray} text={`${selectedItem.remaining} left`} />
              </View>
            ) : (
              <Feather name="chevron-down" size={18} color={tone.gray} />
            )}
          </Pressable>

          {/* Quantity */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Quantity</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="Enter quantity"
            value={quantity}
            onChangeText={(t) => setQuantity(t.replace(/[^\d]/g, ""))}
            style={styles.textInput}
          />
          {selectedItem ? (
            <Text style={styles.hint}>Max {selectedItem.remaining}</Text>
          ) : null}

          {/* Location */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Location</Text>
          <View style={styles.textInputWrap}>
            <Feather name="map-pin" size={16} color={tone.gray} />
            <TextInput
              placeholder="e.g., Central Park, Business District"
              value={location}
              onChangeText={setLocation}
              style={[styles.textInput, { flex: 1, borderWidth: 0, paddingHorizontal: 0 }]}
            />
          </View>

          {/* Payment */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Payment Option</Text>
          <Pressable style={styles.inputLike} onPress={() => setPaymentOpen(true)}>
            <Text style={payment ? styles.inputValue : styles.inputPlaceholder}>
              {payment ? payment.name : "Select payment option"}
            </Text>
            <Feather name="chevron-down" size={18} color={tone.gray} />
          </Pressable>

          {/* Total preview */}
          {selectedItem && qtyNum > 0 ? (
            <View style={styles.totalStrip}>
              <Text style={{ fontWeight: "700" }}>Total Amount:</Text>
              <Text style={[styles.totalAmount]}>
                ฿{lineTotal.toFixed(2)} <Text style={styles.inr}>{toINR(lineTotal)}</Text>
              </Text>
            </View>
          ) : null}

          {/* Submit */}
          <Pressable
            onPress={submit}
            disabled={!selectedItem || !qtyNum || !location || !payment}
            style={({ pressed }) => [
              styles.primaryBtn,
              (!selectedItem || !qtyNum || !location || !payment) && { opacity: 0.6 },
              pressed && { opacity: 0.95 },
            ]}
          >
            <Feather name="dollar-sign" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Add Purchase</Text>
          </Pressable>
        </View>

        {/* Today's Performance */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Today's Performance</Text>
            <Text style={styles.subtle}>Your sales summary for today</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={styles.subtleSmall}>Total Sales</Text>
              <Text style={[styles.statValue, { color: tone.success }]}>
                ฿{todayTotal.toFixed(2)} <Text style={styles.inr}>{toINR(todayTotal)}</Text>
              </Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={styles.subtleSmall}>Transactions</Text>
              <Text style={styles.statValue}>{transactions}</Text>
            </View>
            <View style={{ alignItems: "center", flex: 1 }}>
              <Text style={styles.subtleSmall}>Avg Sale</Text>
              <Text style={styles.statValue}>
                ฿{avgSale.toFixed(2)} <Text style={styles.inr}>{toINR(avgSale)}</Text>
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Sales History */}
      <View style={styles.card}>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>Sales History</Text>
          <Text style={styles.subtle}>All your sales transactions for today</Text>
        </View>

        <View style={styles.listWrap}>
          <HeaderRow columns={["Item", "Qty", "Amount", "Location", "Time"]} />
          {todaysSales.map((s, idx) => (
            <View key={s.id}>
              <View style={styles.listRow}>
                <Text style={[styles.cell, styles.cellBold, { flex: 1.2 }]} numberOfLines={1}>{s.item}</Text>
                <Text style={[styles.cell, { width: 48, textAlign: "center" }]}>{s.quantity}</Text>
                <Text style={[styles.cell, { width: 120, textAlign: "right", fontWeight: "800", color: tone.success }]}>
                  ฿{s.amount.toFixed(2)} <Text style={styles.inr}>{toINR(s.amount)}</Text>
                </Text>
                <View style={[styles.cell, { flex: 1.2, flexDirection: "row", alignItems: "center", gap: 4 }]}>
                  <Feather name="map-pin" size={12} />
                  <Text numberOfLines={1}>{s.location}</Text>
                </View>
                <Text style={[styles.cell, styles.subtleSmall, { width: 90, textAlign: "right" }]}>{s.time}</Text>
              </View>
              {idx < todaysSales.length - 1 ? <View style={styles.divider} /> : null}
            </View>
          ))}
        </View>
      </View>

      {/* Item picker */}
      <PickerSheet
        visible={itemOpen}
        title="Select food item"
        options={availableItems}
        onSelect={(o) => setSelectedItem(o)}
        onClose={() => setItemOpen(false)}
        renderRight={(o) => (
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Badge variant="outline" color={tone.primary} text={`฿${o.price.toFixed(2)}`} />
            <Badge variant="outline" color={tone.gray} text={`${o.remaining} left`} />
          </View>
        )}
      />

      {/* Payment picker */}
      <PickerSheet
        visible={paymentOpen}
        title="Select payment option"
        options={[{ name: "Cash" }, { name: "Card" }, { name: "UPI" }]}
        onSelect={(o) => setPayment(o)}
        onClose={() => setPaymentOpen(false)}
      />
    </ScrollView>
  );
}

/* ---------- styles (aligned with your other screens) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151", marginBottom: 6 },
  hint: { fontSize: 11, color: "#9ca3af", marginTop: 6 },

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

  textInput: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#fff",
  },
  textInputWrap: {
    height: 44,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  primaryBtn: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  totalStrip: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalAmount: { fontWeight: "800", fontSize: 16, color: tone.success },
  inr: { fontSize: 11, color: "#6b7280" },

  /* history list */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  headerCell: { fontSize: 12, fontWeight: "700", color: "#374151" },
  cell: { fontSize: 13, color: "#111827", marginRight: 8 },
  cellBold: { fontWeight: "700" },
  divider: { height: 1, backgroundColor: "#eef1f5" },

  /* picker sheet */
  sheetBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  sheet: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    maxHeight: "70%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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

    badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* today's performance grid */
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },

  /* performance stat value */
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    marginTop: 4,
  },
});
