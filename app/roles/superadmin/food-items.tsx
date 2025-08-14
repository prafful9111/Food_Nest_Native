import React, { useMemo, useState } from "react";
import {
  View, Text, ScrollView, Pressable, Modal,
  TextInput, Image, Switch as RNSwitch, Alert, StyleSheet
} from "react-native";
import { Feather } from "@expo/vector-icons";

// ---- Images (use yours) ----
const Chai     = require("../../../assets/chai.png");
const VadaPav  = require("../../../assets/vadapav.png");
const Poha     = require("../../../assets/poha.png");
const Water    = require("../../../assets/water.png");

// ---- Types & seed (mirrors your web) ----
type Item = {
  id: string; name: string; price: number; category: string;
  available: boolean; image: any; tax?: number;
};
const initial: Item[] = [
  { id: "1", name: "Poha",        price: 20,   category: "Snacks",    available: true,  image: Poha },
  { id: "2", name: "Vada Pav",    price: 30,   category: "Snacks",    available: true,  image: VadaPav },
  { id: "3", name: "Tea",         price: 7.99, category: "Beverages", available: false, image: Chai },
  { id: "4", name: "Water Bottle",price: 6.99, category: "Beverages", available: true,  image: Water },
];

const toINR = (thb: number) => Math.round(thb * 2.5);

export default function FoodItems() {
  const [items, setItems] = useState<Item[]>(initial);
  const [isAdding, setIsAdding] = useState(false);
  const [editing, setEditing] = useState<Item | null>(null);

  // form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState("");
  const [tax, setTax] = useState<string>("");
  const [available, setAvailable] = useState(true);

  const resetForm = () => { setEditing(null); setName(""); setPrice(""); setCategory(""); setTax(""); setAvailable(true); };

  const openAdd = () => { resetForm(); setIsAdding(true); };
  const openEdit = (it: Item) => {
    setEditing(it);
    setName(it.name); setPrice(String(it.price)); setCategory(it.category);
    setTax(it.tax ? String(it.tax) : ""); setAvailable(it.available);
    setIsAdding(true);
  };

  const save = () => {
    const p = Number(price);
    const t = tax ? Number(tax) : undefined;
    if (!name.trim() || !category.trim() || Number.isNaN(p)) {
      Alert.alert("Please fill valid Name, Category and Price.");
      return;
    }
    if (editing) {
      setItems(arr => arr.map(x => x.id === editing.id ? { ...editing, name, price: p, category, tax: t, available } : x));
    } else {
      const img =
        /tea|chai/i.test(name) ? Chai :
        /water/i.test(name) ? Water :
        /vada/i.test(name) ? VadaPav : Poha;
      setItems(arr => [...arr, { id: String(Date.now()), name, price: p, category, tax: t, available, image: img }]);
    }
    setIsAdding(false);
    resetForm();
  };

  const remove = (id: string) => setItems(arr => arr.filter(x => x.id !== id));

  // 2-column card layout
  const rows = useMemo(() => {
    const r: Item[][] = [];
    for (let i = 0; i < items.length; i += 2) r.push(items.slice(i, i + 2));
    return r;
  }, [items]);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Food Items</Text>
          <Text style={styles.muted}>Manage menu items and pricing</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={openAdd}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>  Add Food Item</Text>
        </Pressable>
      </View>

      {/* Grid */}
      <View style={{ gap: 16 }}>
        {rows.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map(item => (
              <View key={item.id} style={styles.card}>
                {/* Image */}
                <View style={styles.imageBox}>
                  <Image source={item.image} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                </View>

                {/* Title + badge */}
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardDesc}>{item.category}</Text>
                  </View>
                  <View style={[styles.badge, item.available ? styles.badgeOn : styles.badgeOff]}>
                    <Text style={[styles.badgeText, item.available ? styles.badgeTextOn : styles.badgeTextOff]}>
                      {item.available ? "Available" : "Unavailable"}
                    </Text>
                  </View>
                </View>

                {/* Price + actions */}
                <View style={styles.cardFooter}>
                  <Text style={styles.price}>
                    ฿{item.price}
                    <Text style={styles.inr}>  INR {toINR(item.price)}</Text>
                  </Text>

                  <View style={styles.actions}>
                    <Pressable style={styles.iconBtn} onPress={() => openEdit(item)}>
                      <Feather name="edit-2" size={18} />
                    </Pressable>
                    <Pressable style={styles.iconBtn} onPress={() => remove(item.id)}>
                      <Feather name="trash-2" size={18} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
            {row.length === 1 && <View style={{ flex: 1 }} />}
          </View>
        ))}
      </View>

      {/* Add/Edit modal */}
      <Modal transparent visible={isAdding} animationType="slide" onRequestClose={() => setIsAdding(false)}>
        <View style={styles.backdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? "Edit Food Item" : "Add New Food Item"}</Text>
            <Text style={styles.modalDesc}>Create a new menu item</Text>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Food Name</Text>
                <TextInput style={styles.input} placeholder="Enter food name" value={name} onChangeText={setName} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Price (฿)</Text>
                <TextInput style={styles.input} placeholder="0.00" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <TextInput style={styles.input} placeholder="e.g., Snacks, Beverages" value={category} onChangeText={setCategory} />
              </View>
              <View style={styles.field}>
                <Text style={styles.label}>Tax / VAT (%)</Text>
                <TextInput style={styles.input} placeholder="e.g., 5" keyboardType="number-pad" value={tax} onChangeText={setTax} />
              </View>
            </View>

            <View style={[styles.formRow, { alignItems: "center" }]}>
              <View style={[styles.field, { flexDirection: "row", alignItems: "center", gap: 10 }]}>
                <RNSwitch value={available} onValueChange={setAvailable} />
                <Text style={styles.label}>Available</Text>
              </View>
            </View>

            {/* Upload area (visual only for now) */}
            <View style={{ gap: 6 }}>
              <Text style={styles.label}>Food Image</Text>
              <View style={styles.uploadBox}>
                <Feather name="upload" size={28} color="#6b7280" />
                <Text style={{ color: "#6b7280", marginTop: 6 }}>Tap to upload or drag and drop</Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>PNG, JPG up to 10MB</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <Pressable onPress={() => { setIsAdding(false); resetForm(); }} style={styles.btnOutline}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable onPress={save} style={styles.btnSolid}>
                <Text style={{ color: "white", fontWeight: "600" }}>Save Item</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  h1: { fontSize: 24, fontWeight: "700" },
  muted: { color: "#6b7280" },

  addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  row: { flexDirection: "row", gap: 16 },
  card: { flex: 1, backgroundColor: "white", borderRadius: 14, padding: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 3 },

  imageBox: { backgroundColor: "#f3f4f6", borderRadius: 12, overflow: "hidden", aspectRatio: 1, marginBottom: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  cardDesc: { color: "#6b7280" },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1 },
  badgeOn: { backgroundColor: "#10b98122", borderColor: "#10b98155" },
  badgeOff:{ backgroundColor: "#e5e7eb",   borderColor: "#d1d5db" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextOn: { color: "#065f46" },
  badgeTextOff:{ color: "#374151" },

  cardFooter: { marginTop: 6, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  price: { fontSize: 20, fontWeight: "700", color: "#111827" },
  inr: { marginLeft: 4, color: "#6b7280", fontSize: 12 },
  actions: { flexDirection: "row", gap: 8 },
  iconBtn: { paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderRadius: 8, borderColor: "#d1d5db" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 },
  modalCard: { backgroundColor: "white", borderRadius: 16, padding: 16, gap: 12 },
  modalTitle: { fontSize: 18, fontWeight: "700" },
  modalDesc: { color: "#6b7280" },

  formRow: { flexDirection: "row", gap: 12 },
  field: { flex: 1, gap: 6 },
  label: { fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  uploadBox: { borderWidth: 2, borderStyle: "dashed", borderColor: "#d1d5db", borderRadius: 12, padding: 20, alignItems: "center" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 6 },
  btnOutline: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 10, borderColor: "#d1d5db" },
  btnSolid: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#111827", borderRadius: 10 },
});
