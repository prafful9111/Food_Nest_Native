
import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Modal } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- Types & seed ---------- */
type FoodItem = { id: number; name: string; price: number };
type Combo = { id: number; name: string; itemIds: number[]; price: number; status: "Active" | "Inactive" };

const foodItems: FoodItem[] = [
  { id: 1, name: "Poha",         price: 3.99 },
  { id: 2, name: "Vada Pav",     price: 2.5  },
  { id: 3, name: "Chai",         price: 1.5  },
  { id: 4, name: "Water Bottle", price: 1.0  },
];

const initialCombos: Combo[] = [
  { id: 1, name: "Morning Special",   itemIds: [1, 3],       price: 4.99, status: "Active"   },
  { id: 2, name: "Street Food Combo", itemIds: [2, 3],       price: 3.5,  status: "Active"   },
  { id: 3, name: "Full Meal",         itemIds: [1, 2, 3, 4], price: 7.99, status: "Inactive" },
];

/* ---------- helpers ---------- */
const sumItems = (ids: number[]) => ids.reduce((acc, id) => acc + (foodItems.find(f => f.id === id)?.price ?? 0), 0);
const namesOf = (ids: number[]) => ids.map(id => foodItems.find(f => f.id === id)?.name ?? "").filter(Boolean);
const toINR = (thb: number) => `INR ${Math.round(thb * 2.5)}`;

/* ======================= Screen ======================= */
export default function CombosManagement() {
  const [combos, setCombos] = useState<Combo[]>(initialCombos);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Combo | null>(null);

  // form state
  const [comboName, setComboName] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  const canSave = comboName.trim().length > 0 && selected.length >= 2 && !!Number(comboPrice);

  const savings = useMemo(() => {
    const total = sumItems(selected);
    const price = Number(comboPrice) || 0;
    return Math.max(0, total - price);
  }, [selected, comboPrice]);

  const resetForm = () => { setEditing(null); setComboName(""); setComboPrice(""); setSelected([]); };
  const startCreate = () => { resetForm(); setOpen(true); };
  const startEdit = (c: Combo) => { setEditing(c); setComboName(c.name); setComboPrice(String(c.price)); setSelected(c.itemIds); setOpen(true); };

  const toggleItem = (id: number) => setSelected(list => list.includes(id) ? list.filter(x => x !== id) : [...list, id]);

  const save = () => {
    if (!canSave) return;
    const payload: Combo = { id: editing ? editing.id : Date.now(), name: comboName.trim(), itemIds: selected.slice(), price: Number(comboPrice), status: editing?.status ?? "Active" };
    setCombos(list => editing ? list.map(c => c.id === editing.id ? payload : c) : [payload, ...list]);
    setOpen(false); resetForm();
  };

  const remove = (id: number) => setCombos(list => list.filter(c => c.id !== id));
  const toggleStatus = (id: number) => setCombos(list => list.map(c => c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Combos Management</Text>
          <Text style={styles.subtle}>Create and manage food combos with special pricing</Text>
        </View>
        <Pressable style={styles.btnSolid} onPress={startCreate}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.btnSolidText}>  Create Combo</Text>
        </Pressable>
      </View>

      {/* Combo cards (mobile-first) */}
      <View style={{ gap: 12 }}>
        {combos.map((c) => {
          const total = sumItems(c.itemIds);
          const saveAmt = Math.max(0, total - c.price);
          return (
            <View key={c.id} style={styles.card}>
              {/* Title row */}
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle} numberOfLines={1}>{c.name}</Text>
                <Pressable onPress={() => toggleStatus(c.id)}>
                  <Badge text={c.status} tone={c.status === "Active" ? "green" : "gray"} />
                </Pressable>
              </View>

              {/* Items */}
              <View style={{ marginTop: 8, gap: 6 }}>
                <Text style={styles.label}>Items</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {namesOf(c.itemIds).map((n) => <Chip key={n} text={n} />)}
                </View>
              </View>

              {/* Price & savings */}
              <View style={[styles.rowBetween, { marginTop: 12 }]}>
                <View>
                  <Text style={styles.subtleSmall}>Price</Text>
                  <Text style={styles.price}>฿{c.price.toFixed(2)} <Text style={styles.subtleSmall}>({toINR(c.price)})</Text></Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.subtleSmall}>Savings</Text>
                  <Text style={styles.saving}>฿{saveAmt.toFixed(2)} <Text style={styles.subtleSmall}>({toINR(saveAmt)})</Text></Text>
                </View>
              </View>

              {/* Actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8, marginTop: 12 }]}>
                <Pressable style={styles.btnOutlineSm} onPress={() => startEdit(c)}>
                  <Feather name="edit-2" size={14} /><Text>  Edit</Text>
                </Pressable>
                <Pressable style={styles.btnOutlineSm} onPress={() => remove(c.id)}>
                  <Feather name="trash-2" size={14} /><Text>  Delete</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* Create/Edit Modal */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, maxHeight: "90%", width: "100%" }]}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "800" }}>{editing ? "Edit Combo" : "Create New Combo"}</Text>
              <Text style={styles.subtle}>Select items (2+) and set final combo price</Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {/* Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Combo Name</Text>
                <TextInput style={styles.input} placeholder="Enter combo name" value={comboName} onChangeText={setComboName} />
              </View>

              {/* Items picker */}
              <View>
                <Text style={styles.label}>Select Food Items</Text>
                <View style={styles.selectorBox}>
                  {foodItems.map((it) => {
                    const checked = selected.includes(it.id);
                    return (
                      <Pressable key={it.id} onPress={() => toggleItem(it.id)} style={styles.selectRow}>
                        <Feather name={checked ? "check-square" : "square"} size={18} />
                        <Text style={{ marginLeft: 8, flex: 1 }} numberOfLines={1}>
                          {it.name} — ฿{it.price.toFixed(2)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                {selected.length > 0 && (
                  <View style={styles.infoBox}>
                    <Text style={styles.subtleSmall}>Items total: ฿{sumItems(selected).toFixed(2)}</Text>
                  </View>
                )}
              </View>

              {/* Price + savings */}
              <View style={styles.field}>
                <Text style={styles.label}>Combo Price (฿)</Text>
                <TextInput style={styles.input} keyboardType="decimal-pad" placeholder="0.00" value={comboPrice} onChangeText={setComboPrice} />
                {Number(comboPrice) > 0 && selected.length > 0 && (
                  <View style={[styles.infoBox, { backgroundColor: "#10b98122", borderColor: "#10b98155" }]}>
                    <Text style={{ color: "#065f46", fontWeight: "700" }}>Customer saves: ฿{savings.toFixed(2)} ({toINR(savings)})</Text>
                  </View>
                )}
              </View>

              {/* Actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
                <Pressable style={styles.btnOutline} onPress={() => { setOpen(false); resetForm(); }}>
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.btnSolid, !canSave && { opacity: 0.5 }]} disabled={!canSave} onPress={save}>
                  <Text style={styles.btnSolidText}>{editing ? "Save Combo" : "Create Combo"}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- tiny components ---------- */
function Chip({ text }: { text: string }) {
  return (
    <View style={{ paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f3f4f6", borderRadius: 999 }}>
      <Text>{text}</Text>
    </View>
  );
}

function Badge({ text, tone }: { text: string; tone: "green" | "gray" }) {
  const c = tone === "green" ? "#10b981" : "#9ca3af";
  const t = tone === "green" ? "#065f46" : "#374151";
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: `${c}22`, borderWidth: 1, borderColor: `${c}55` }}>
      <Text style={{ color: t, fontWeight: "700", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },
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
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827", maxWidth: "70%" },

  // labels & numbers
  label: { fontWeight: "700", color: "#111827" },
  price: { fontSize: 18, fontWeight: "800", color: "#111827" },
  saving: { fontSize: 18, fontWeight: "800", color: "#059669" },

  // inputs
  field: { gap: 6 },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  selectorBox: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 8, gap: 6, maxHeight: 220 },
  selectRow: { flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 8 },

  infoBox: { marginTop: 6, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#f9fafb", padding: 8, borderRadius: 10 },

  // buttons
  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  btnOutline: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnOutlineSm: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  backdrop:{
    justifyContent: "center",
    padding: 16
  }
});
