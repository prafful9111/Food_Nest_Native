import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Row = { id: string; name: string; qty: number; status: "OK" | "Low" | "Out" };

const seed: Row[] = [
  { id: "1", name: "Buns", qty: 120, status: "OK" },
  { id: "2", name: "Chicken", qty: 20, status: "Low" },
  { id: "3", name: "Oil", qty: 0, status: "Out" },
];

export default function Inventory() {
  const [rows, setRows] = useState<Row[]>(seed);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | null>(null);

  // form state
  const [name, setName] = useState("");
  const [qty, setQty] = useState<string>("");

  const reset = () => { setEditing(null); setName(""); setQty(""); };

  const startAdd = () => { reset(); setOpen(true); };
  const startEdit = (r: Row) => {
    setEditing(r);
    setName(r.name);
    setQty(String(r.qty));
    setOpen(true);
  };

  const save = () => {
    const q = Number(qty);
    if (!name.trim() || Number.isNaN(q)) {
      Alert.alert("Enter a valid name and quantity.");
      return;
    }
    const status: Row["status"] = q === 0 ? "Out" : q < 30 ? "Low" : "OK";
    if (editing) {
      setRows((arr) => arr.map((x) => (x.id === editing.id ? { ...editing, name, qty: q, status } : x)));
    } else {
      setRows((arr) => [...arr, { id: String(Date.now()), name, qty: q, status }]);
    }
    setOpen(false);
    reset();
  };

  const remove = (id: string) => setRows((arr) => arr.filter((x) => x.id !== id));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Inventory</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={startAdd}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>  Add Item</Text>
        </Pressable>
      </View>

      {/* Table-like card */}
      <View style={styles.card}>
        <View style={[styles.row, styles.thead]}>
          <Text style={[styles.cell, styles.bold]}>Item</Text>
          <Text style={[styles.cell, styles.bold]}>Qty</Text>
          <Text style={[styles.cell, styles.bold]}>Status</Text>
          <Text style={[styles.cell, styles.bold, { textAlign: "right" }]}>Actions</Text>
        </View>

        <FlatList
          data={rows}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={[styles.row, styles.trow]}>
              <Text style={styles.cell}>{item.name}</Text>
              <Text style={styles.cell}>{item.qty}</Text>
              <View style={[styles.cell, { alignItems: "flex-start" }]}>
                <View
                  style={[
                    styles.badge,
                    item.status === "OK"
                      ? styles.badgeGreen
                      : item.status === "Low"
                      ? styles.badgeAmber
                      : styles.badgeGray,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === "OK"
                        ? styles.badgeTextOn
                        : styles.badgeTextOff,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>
              <View style={[styles.cell, { flexDirection: "row", justifyContent: "flex-end", gap: 8 }]}>
                <Pressable style={styles.iconBtn} onPress={() => startEdit(item)}>
                  <Feather name="edit-2" size={16} />
                </Pressable>
                <Pressable style={styles.iconBtn} onPress={() => remove(item.id)}>
                  <Feather name="trash-2" size={16} />
                </Pressable>
              </View>
            </View>
          )}
        />
      </View>

      {/* Modal */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12 }]}>
            <Text style={styles.modalTitle}>{editing ? "Edit Item" : "Add Item"}</Text>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Name</Text>
                <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="e.g., Buns" />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Qty</Text>
                <TextInput
                  style={styles.input}
                  value={qty}
                  onChangeText={setQty}
                  keyboardType="number-pad"
                  placeholder="e.g., 20"
                />
              </View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable style={styles.btnOutline} onPress={() => setOpen(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={styles.btnSolid} onPress={save}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>{editing ? "Save" : "Add"}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  h1: { fontSize: 24, fontWeight: "700" },

  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  card: { backgroundColor: "#fff", borderRadius: 14, padding: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 3 },

  // table-like
  row: { flexDirection: "row", alignItems: "center" },
  thead: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  trow: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f3f4f6" },
  cell: { flex: 1 },
  bold: { fontWeight: "700" },

  // badges
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  badgeGreen: { backgroundColor: "#10b98122", borderColor: "#10b98155" },
  badgeAmber: { backgroundColor: "#f59e0b22", borderColor: "#f59e0b55" },
  badgeGray: { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextOn: { color: "#065f46" },
  badgeTextOff: { color: "#374151" },

  // modal
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  formRow: { flexDirection: "row", gap: 12 },
  field: { flex: 1, gap: 6 },
  label: { fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 6 },
  btnOutline: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 10, borderColor: "#d1d5db" },
  btnSolid:   { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#111827", borderRadius: 10 },

  // used earlier in User Management; include here so it never errors
  iconBtn: { borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
});
