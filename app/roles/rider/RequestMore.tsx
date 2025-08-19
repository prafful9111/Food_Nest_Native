// screens/RequestMore.tsx
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

/* ---------- sample data (parity with your web file) ---------- */
type Item = { id: number; name: string; current: number; available: number };
const availableItems: Item[] = [
  { id: 1, name: "Vada Pav", current: 3, available: 0 },
  { id: 2, name: "Poha", current: 2, available: 0 },
  { id: 3, name: "Chai", current: 5, available: 0 },
  { id: 4, name: "Water Bottle", current: 8, available: 0 },
];

type Req = {
  id: number;
  item: string;
  quantity: number;
  reason: string;
  status: "forwarded" | "pending" | "delivered" | "rejected";
  requestTime: string;
  responseTime: string | null;
};
const requestHistoryInit: Req[] = [
  {
    id: 1,
    item: "Vada Pav",
    quantity: 15,
    reason: "Completely out of stock, customers waiting",
    status: "forwarded",
    requestTime: "2 hours ago",
    responseTime: "1 hour ago",
  },
  {
    id: 2,
    item: "Chai",
    quantity: 20,
    reason: "Running low during afternoon rush",
    status: "pending",
    requestTime: "30 minutes ago",
    responseTime: null,
  },
  {
    id: 3,
    item: "Poha",
    quantity: 12,
    reason: "Out of stock, morning rush demand",
    status: "delivered",
    requestTime: "3 hours ago",
    responseTime: "2 hours ago",
  },
];

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
        { backgroundColor: solid ? color : "transparent", borderColor: color },
      ]}
    >
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}

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

/* ---------- helpers ---------- */
const tone = {
  primary: "#2563eb",
  success: "#059669",
  warning: "#d97706",
  gray: "#6b7280",
  destructive: "#dc2626",
} as const;

const statusMeta = {
  forwarded: { label: "Forwarded to Cook", color: tone.primary, icon: "clock" as const, solid: true },
  pending: { label: "Pending", color: tone.warning, icon: "clock" as const, solid: true },
  delivered: { label: "Delivered", color: tone.success, icon: "check-circle" as const, solid: true },
  rejected: { label: "Rejected", color: tone.destructive, icon: "x-circle" as const, solid: true },
};

/* ---------- screen ---------- */
export default function RequestMoreScreen() {
  const [itemOpen, setItemOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  const [history, setHistory] = useState<Req[]>(requestHistoryInit);

  const qtyNum = Math.max(0, Math.min(Number(quantity || 0), 100));

  const canSubmit = selectedItem && qtyNum > 0 && reason.trim().length > 0;

  const submit = () => {
    if (!canSubmit || !selectedItem) return;
    const newReq: Req = {
      id: Math.max(0, ...history.map(h => h.id)) + 1,
      item: selectedItem.name,
      quantity: qtyNum,
      reason: reason.trim(),
      status: "forwarded",
      requestTime: "Just now",
      responseTime: null,
    };
    setHistory([newReq, ...history]);
    Alert.alert("Request Sent", `Requested ${qtyNum} × ${selectedItem.name}\nReason: ${reason.trim()}`);
    // reset form
    setSelectedItem(null);
    setQuantity("");
    setReason("");
  };

  const lowItems = useMemo(() => availableItems, []);

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View>
        <Text style={styles.h1}>Request Refill</Text>
        <Text style={styles.subtle}>Ask the cook for more items when you run out</Text>
      </View>

      {/* Form + Current Inventory */}
      <View style={{ gap: 12 }}>
        {/* New Request */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="plus" size={18} />
              <Text style={styles.sectionTitle}>New Request</Text>
            </View>
            <Text style={styles.subtle}>Submit a refill request to the cook</Text>
          </View>

          {/* Item */}
          <Text style={styles.label}>Food Item</Text>
          <Pressable style={styles.inputLike} onPress={() => setItemOpen(true)}>
            <Text style={selectedItem ? styles.inputValue : styles.inputPlaceholder}>
              {selectedItem ? selectedItem.name : "Select food item"}
            </Text>
            {selectedItem ? (
              <View style={{ flexDirection: "row", gap: 6 }}>
                <Badge variant="outline" color={tone.gray} text={`Current: ${selectedItem.current}`} />
                <Badge variant="outline" color={tone.destructive} text={`Available: ${selectedItem.available}`} />
              </View>
            ) : (
              <Feather name="chevron-down" size={18} color={tone.gray} />
            )}
          </Pressable>

          {/* Quantity */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Quantity Requested</Text>
          <TextInput
            keyboardType="number-pad"
            placeholder="Enter quantity needed"
            value={quantity}
            onChangeText={(t) => setQuantity(t.replace(/[^\d]/g, ""))}
            style={styles.textInput}
          />
          {selectedItem ? (
            <Text style={[styles.subtleSmall, { color: tone.destructive }]}>
              Current stock: {selectedItem.current} items (Out of stock)
            </Text>
          ) : null}

          {/* Reason */}
          <View style={{ height: 12 }} />
          <Text style={styles.label}>Reason for Request</Text>
          <TextInput
            placeholder="Explain the urgency (e.g., completely out of stock, customers waiting, high demand)"
            value={reason}
            onChangeText={setReason}
            style={[styles.textArea]}
            multiline
            numberOfLines={4}
          />

          {/* Submit */}
          <Pressable
            onPress={submit}
            disabled={!canSubmit}
            style={({ pressed }) => [
              styles.primaryBtn,
              (!canSubmit || pressed) && { opacity: 0.9 },
            ]}
          >
            <Feather name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>Send Request to Cook</Text>
          </Pressable>
        </View>

        {/* Current Inventory */}
        <View style={styles.card}>
          <View style={{ marginBottom: 8 }}>
            <Text style={styles.sectionTitle}>Current Inventory</Text>
            <Text style={styles.subtle}>Your current food item levels</Text>
          </View>

          <View style={styles.listWrap}>
            {lowItems.map((it, idx) => (
              <View key={it.id}>
                <View style={styles.listRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLeft}>{it.name}</Text>
                    <Text style={styles.subtleSmall}>Current stock: {it.current} items</Text>
                  </View>
                  <Badge text="Out of Stock" variant="solid" color={tone.destructive} />
                </View>
                {idx < lowItems.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Request History */}
      <View style={styles.card}>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>Request History</Text>
          <Text style={styles.subtle}>Your previous food requests and their status</Text>
        </View>

        <View style={styles.listWrap}>
          {history.map((r, idx) => {
            const meta = statusMeta[r.status];
            return (
              <View key={r.id}>
                <View style={[styles.listRow, { alignItems: "flex-start", gap: 10 }]}>
                  {/* Left */}
                  <View style={{ flex: 1 }}>
                    <Text style={styles.listLeft}>{r.item}</Text>
                    <Text style={styles.subtleSmall}>Quantity: {r.quantity} items</Text>
                    <Text style={[styles.subtleSmall, { marginTop: 6 }]}>{r.reason}</Text>
                  </View>

                  {/* Right */}
                  <View style={{ alignItems: "flex-end", gap: 8 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Feather name={meta.icon} size={14} color="#fff" />
                      <Badge text={meta.label} variant="solid" color={meta.color} />
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={styles.timeRow}>Requested: {r.requestTime}</Text>
                      {r.responseTime ? (
                        <Text style={styles.timeRow}>Responded: {r.responseTime}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
                {idx < history.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      </View>

      {/* Item Picker */}
      <PickerSheet
        visible={itemOpen}
        title="Select food item"
        options={availableItems}
        onSelect={(o) => setSelectedItem(o)}
        onClose={() => setItemOpen(false)}
        renderRight={(o) => (
          <View style={{ flexDirection: "row", gap: 6 }}>
            <Badge variant="outline" color={tone.gray} text={`Current: ${o.current}`} />
            <Badge variant="outline" color={tone.destructive} text={`Available: ${o.available}`} />
          </View>
        )}
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

  /* input-like */
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
  textArea: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontWeight: "600",
    color: "#111827",
    backgroundColor: "#fff",
    textAlignVertical: "top",
  },

  /* list/table look */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  listLeft: { fontWeight: "700", color: "#111827" },
  divider: { height: 1, backgroundColor: "#eef1f5" },
  timeRow: { fontSize: 11, color: "#6b7280" },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

  /* buttons */
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
});
