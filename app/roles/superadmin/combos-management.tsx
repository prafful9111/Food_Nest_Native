import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

/* ---------------- API baseline (same pattern as food-items.tsx) ---------------- */
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.29.87:1900";

async function apiGet<T>(path: string): Promise<T> {
  const r = await fetch(`${API_URL}${path}`);
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as T;
}

async function apiSend<T>(
  path: string,
  method: string,
  body: any
): Promise<T> {
  const r = await fetch(`${API_URL}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as T;
}

/* ---------------- Types ---------------- */
type Food = {
  _id: string;
  name: string;
  price: number;
  imageUrl?: string | null;
  category?: string;
};

type Combo = {
  _id: string;
  name: string;
  items: Food[];                 // populated from backend
  price: number;
  status: "Active" | "Inactive";
  createdAt?: string;
};

/* ---------------- Screen ---------------- */
export default function CombosManagement() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [loading, setLoading] = useState(true);

  // modal state
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [comboName, setComboName] = useState("");
  const [comboPrice, setComboPrice] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [f, c] = await Promise.all([
          apiGet<Food[]>("/api/foods"),
          apiGet<Combo[]>("/api/combos"),
        ]);
        setFoods(f);
        setCombos(c);
      } catch (e: any) {
        Alert.alert("Load failed", e?.message || "Please try again");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If user opens modal before foods loaded (edge), refresh foods
  const startCreate = async () => {
    if (!foods.length) {
      try {
        const f = await apiGet<Food[]>("/api/foods");
        setFoods(f);
      } catch (e: any) {
        Alert.alert("Could not load foods", e?.message || "Please try again");
        return;
      }
    }
    setEditingId(null);
    setComboName("");
    setComboPrice("");
    setSelectedIds([]);
    setOpen(true);
  };

  const startEdit = (c: Combo) => {
    setEditingId(c._id);
    setComboName(c.name);
    setComboPrice(String(c.price));
    setSelectedIds(c.items.map((i) => i._id));
    setOpen(true);
  };

  const togglePick = (id: string) =>
    setSelectedIds((list) =>
      list.includes(id) ? list.filter((x) => x !== id) : [...list, id]
    );

  const canSave =
    comboName.trim().length > 0 &&
    selectedIds.length > 0 &&
    !isNaN(Number(comboPrice));

  const selectedTotal = useMemo(() => {
    const m = new Map(foods.map((f) => [f._id, f]));
    return selectedIds.reduce((sum, id) => sum + (m.get(id)?.price ?? 0), 0);
  }, [selectedIds, foods]);

  const saveCombo = async () => {
    if (!canSave) return;
    try {
      const payload = {
        name: comboName.trim(),
        itemIds: selectedIds,
        price: Number(comboPrice),
        status: "Active" as const,
      };

      if (editingId) {
        const updated = await apiSend<Combo>(`/api/combos/${editingId}`, "PATCH", payload);
        setCombos((list) => list.map((c) => (c._id === editingId ? updated : c)));
      } else {
        const created = await apiSend<Combo>("/api/combos", "POST", payload);
        setCombos((list) => [created, ...list]);
      }
      setOpen(false);
    } catch (e: any) {
      Alert.alert("Save failed", e?.message || "Please try again");
    }
  };

  const removeCombo = async (id: string) => {
    try {
      await apiSend(`/api/combos/${id}`, "DELETE", {});
      setCombos((list) => list.filter((c) => c._id !== id));
    } catch (e: any) {
      Alert.alert("Delete failed", e?.message || "Please try again");
    }
  };

  const toggleStatus = async (c: Combo) => {
    try {
      const updated = await apiSend<Combo>(`/api/combos/${c._id}`, "PATCH", {
        status: c.status === "Active" ? "Inactive" : "Active",
      });
      setCombos((list) => list.map((x) => (x._id === c._id ? updated : x)));
    } catch (e: any) {
      Alert.alert("Update failed", e?.message || "Please try again");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Title row */}
      <View style={styles.rowBetween}>
        <Text style={styles.title}>Combos</Text>
      </View>

      {/* NEW ROW: left-aligned Yellow Gradient Create button */}
      <View style={{ width: "100%", marginTop: 4 }}>
        <LinearGradient
          colors={["#FACC15", "#F59E0B"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradientBtnWrap}
        >
          <Pressable style={styles.gradientBtn} onPress={startCreate}>
            <Feather name="plus" size={16} color="#ffffff" />
            <Text style={styles.gradientBtnText}>  Create Combo</Text>
          </Pressable>
        </LinearGradient>
      </View>

      {/* Combo cards */}
      <View style={{ gap: 12 }}>
        {combos.map((c) => {
          const total = c.items.reduce((s, it) => s + (it.price || 0), 0);
          const saveAmt = Math.max(0, total - c.price);
          return (
            <View key={c._id} style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.cardTitle}>{c.name}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable onPress={() => toggleStatus(c)} style={styles.badge}>
                    <Text style={{ fontWeight: "600" }}>{c.status}</Text>
                  </Pressable>
                  <Pressable onPress={() => startEdit(c)} style={styles.iconBtn}>
                    <Feather name="edit-2" size={16} />
                  </Pressable>
                  <Pressable onPress={() => removeCombo(c._id)} style={styles.iconBtn}>
                    <Feather name="trash-2" size={16} />
                  </Pressable>
                </View>
              </View>

              <Text style={styles.subtle}>
                {c.items.map((i) => i.name).join(" • ")}
              </Text>

              <View style={[styles.rowBetween, { marginTop: 8 }]}>
                <Text>Total of items: ₹{total.toFixed(2)}</Text>
                <Text style={{ fontWeight: "700" }}>Combo price: ₹{c.price.toFixed(2)}</Text>
              </View>
              <Text style={{ color: saveAmt > 0 ? "#0a7" : "#555", marginTop: 4 }}>
                {saveAmt > 0 ? `You save ₹${saveAmt.toFixed(2)}` : "No savings"}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Create/Edit Modal */}
      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingId ? "Edit Combo" : "Create Combo"}</Text>

            <TextInput
              placeholder="Combo name"
              value={comboName}
              onChangeText={setComboName}
              style={styles.input}
            />
            <TextInput
              placeholder="Combo price"
              keyboardType="numeric"
              value={comboPrice}
              onChangeText={setComboPrice}
              style={styles.input}
            />

            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Pick items</Text>
            <View style={{ maxHeight: 260 }}>
              <ScrollView>
                {foods.map((f) => {
                  const picked = selectedIds.includes(f._id);
                  return (
                    <Pressable key={f._id} onPress={() => togglePick(f._id)} style={styles.pickRow}>
                      <View style={[styles.checkbox, picked && styles.checkboxOn]} />
                      <Text style={{ flex: 1 }}>{f.name}  •  ₹{f.price}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.rowBetween}>
              <Text style={{ color: "#555" }}>Items total: ₹{selectedTotal.toFixed(2)}</Text>
              <Pressable
                disabled={!canSave}
                onPress={saveCombo}
                style={[styles.btnSolid, !canSave && { opacity: 0.5 }]}
              >
                <Feather name="save" size={16} color="#fff" />
                <Text style={styles.btnSolidText}>  Save</Text>
              </Pressable>
            </View>

            <Pressable onPress={() => setOpen(false)} style={[styles.btnGhost, { marginTop: 12 }]}>
              <Text style={styles.btnGhostText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "800" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { padding: 14, borderRadius: 12, backgroundColor: "#fff", elevation: 1, shadowOpacity: 0.05, shadowRadius: 8 },
  cardTitle: { fontSize: 16, fontWeight: "700" },
  subtle: { color: "#666", marginTop: 4 },

  // yellow gradient button row
  gradientBtnWrap: { borderRadius: 12, alignSelf: "flex-start" },
  gradientBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  gradientBtnText: { color: "#ffffff", fontWeight: "800" },

  // Modal + actions
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", padding: 16, justifyContent: "center" },
  modalCard: { backgroundColor: "#fff", borderRadius: 12, padding: 16, gap: 10 },
  modalTitle: { fontSize: 18, fontWeight: "800", marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 10, marginBottom: 8 },
  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  btnGhost: { alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, paddingVertical: 10 },
  btnGhostText: { fontWeight: "700" },

  // item picker checkbox
  pickRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 8 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, borderColor: "#111827" },
  checkboxOn: { backgroundColor: "#111827" },

  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#e5e7eb" },
});
