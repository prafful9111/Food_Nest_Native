import React, { useMemo, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

type Status = "paid" | "pending" | "overdue";
interface Expense {
  id: string;
  name: string;
  category: string;
  amount: number;      // THB
  dueDate: string;     // YYYY-MM-DD
  status: Status;
  paymentDate?: string;
  description?: string;
}

const categories = ["Rent", "Utilities", "Insurance", "Maintenance", "Marketing", "Legal", "Other"];

/* --- currency helpers (match overview style) --- */
const THB_TO_INR = 2.5;
const formatTHB = (n: number) => `฿${Math.round(n).toLocaleString()}`;
const toINR = (n: number) => `INR ${Math.round(n * THB_TO_INR).toLocaleString("en-IN")}`;
const formatDate = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString();
const todayIso = () => new Date().toISOString().split("T")[0];

const StatusBadge = ({ status }: { status: Status }) => {
  const map: Record<Status, { bg: string; color: string; label: string }> = {
    paid: { bg: "#E8F5E9", color: "#1B5E20", label: "Paid" },
    pending: { bg: "#FFF8E1", color: "#8D6E00", label: "Pending" },
    overdue: { bg: "#FDECEA", color: "#B71C1C", label: "Overdue" },
  };
  const s = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={{ color: s.color, fontWeight: "600" }}>{s.label}</Text>
    </View>
  );
};

export default function MiscellaneousExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "1", name: "Office Rent", category: "Rent", amount: 2500, dueDate: "2024-01-31", status: "paid", paymentDate: "2024-01-30", description: "Monthly office rent payment" },
    { id: "2", name: "Electricity Bill", category: "Utilities", amount: 450, dueDate: "2024-02-15", status: "pending", description: "Monthly electricity bill" },
    { id: "3", name: "Internet Service", category: "Utilities", amount: 89, dueDate: "2024-02-10", status: "overdue", description: "Monthly internet service" },
    { id: "4", name: "Insurance Premium", category: "Insurance", amount: 800, dueDate: "2024-02-28", status: "pending", description: "Business insurance premium" },
    { id: "5", name: "Equipment Maintenance", category: "Maintenance", amount: 350, dueDate: "2024-02-20", status: "paid", paymentDate: "2024-02-18", description: "Kitchen equipment servicing" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Expense | null>(null);

  // form state (shared for Add & Edit)
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [dueDate, setDueDate] = useState<string>(todayIso());
  const [description, setDescription] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setName("");
    setCategory("");
    setAmount("");
    setDueDate(todayIso());
    setDescription("");
    setModalVisible(true);
  };

  const openEdit = (e: Expense) => {
    setEditing(e);
    setName(e.name);
    setCategory(e.category);
    setAmount(String(e.amount));
    setDueDate(e.dueDate);
    setDescription(e.description ?? "");
    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const validate = () => {
    if (!name || !category || !amount || !dueDate) {
      Alert.alert("Error", "Please fill in all required fields.");
      return false;
    }
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      Alert.alert("Error", "Amount must be a positive number.");
      return false;
    }
    return true;
  };

  const saveExpense = () => {
    if (!validate()) return;
    const payload: Omit<Expense, "id" | "status"> = {
      name,
      category,
      amount: parseFloat(amount), // THB
      dueDate,
      description: description.trim() || undefined,
    };

    if (editing) {
      setExpenses((prev) => prev.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
      Alert.alert("Success", "Expense updated.");
    } else {
      const newExpense: Expense = { id: Date.now().toString(), ...payload, status: "pending" };
      setExpenses((prev) => [...prev, newExpense]);
      Alert.alert("Success", "Expense added.");
    }
    closeModal();
  };

  const markPaid = (id: string) => {
    setExpenses((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: "paid", paymentDate: todayIso() } : x))
    );
    Alert.alert("Success", "Marked as paid.");
  };

  const removeExpense = (id: string) => {
    Alert.alert("Delete", "Are you sure you want to delete this expense?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {
          setExpenses((prev) => prev.filter((x) => x.id !== id));
          Alert.alert("Deleted", "Expense removed.");
        },
      },
    ]);
  };

  const totals = useMemo(() => {
    const t = { paid: 0, pending: 0, overdue: 0, total: 0 };
    for (const e of expenses) {
      t[e.status as "paid" | "pending" | "overdue"] += e.amount;
      t.total += e.amount;
    }
    return t;
  }, [expenses]);

  const onChangeDate = (_: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") setShowDatePicker(false);
    if (date) setDueDate(date.toISOString().split("T")[0]);
  };

  const renderCard = (
    title: string,
    valueTHB: number,
    icon: keyof typeof Feather.glyphMap,
    tint?: string
  ) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Feather name={icon} size={18} color={tint ?? "#6b7280"} />
      </View>
      <Text style={styles.cardValue}>
        {formatTHB(valueTHB)} <Text style={styles.inr}>{toINR(valueTHB)}</Text>
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <Text style={styles.h1}>Miscellaneous Expenses</Text>
          <Pressable onPress={openAdd} style={styles.primaryBtn}>
            <Feather name="plus" size={16} color="#fff" />
            <Text style={styles.primaryBtnText}>Add Expense</Text>
          </Pressable>
        </View>

        {/* Summary cards with THB + INR */}
        <View style={styles.cardsGrid}>
          {renderCard("Total Expenses", totals.total, "dollar-sign")}
          {renderCard("Paid", totals.paid, "dollar-sign", "#15803d")}
          {renderCard("Pending", totals.pending, "calendar", "#a16207")}
          {renderCard("Overdue", totals.overdue, "alert-circle", "#b91c1c")}
        </View>

        {/* List */}
        <View style={styles.listCard}>
          <Text style={styles.sectionTitle}>All Expenses</Text>
          <FlatList
            data={expenses}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.name}</Text>
                  {item.description ? (
                    <Text style={styles.rowSub}>{item.description}</Text>
                  ) : null}

                  <View style={styles.rowMetaWrap}>
                    <View style={styles.metaPill}>
                      <Feather name="tag" size={12} color="#374151" />
                      <Text style={styles.metaText}>{item.category}</Text>
                    </View>

                    <View style={styles.metaPill}>
                      <Feather name="calendar" size={12} color="#374151" />
                      <Text style={styles.metaText}>Due: {formatDate(item.dueDate)}</Text>
                    </View>

                    <View style={styles.metaPill}>
                      <Feather name="dollar-sign" size={12} color="#374151" />
                      <Text style={styles.metaText}>
                        {formatTHB(item.amount)} <Text style={styles.inrInline}>{toINR(item.amount)}</Text>
                      </Text>
                    </View>

                    <StatusBadge status={item.status} />

                    <View style={styles.metaPill}>
                      <Feather name="credit-card" size={12} color="#374151" />
                      <Text style={styles.metaText}>
                        Paid: {item.paymentDate ? formatDate(item.paymentDate) : "-"}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.actionsCol}>
                  {item.status !== "paid" && (
                    <Pressable style={styles.outlineBtn} onPress={() => markPaid(item.id)}>
                      <Text style={styles.outlineBtnText}>Mark Paid</Text>
                    </Pressable>
                  )}
                  <View style={styles.iconRow}>
                    <Pressable onPress={() => openEdit(item)} style={styles.iconBtn}>
                      <Feather name="edit" size={18} color="#374151" />
                    </Pressable>
                    <Pressable onPress={() => removeExpense(item.id)} style={styles.iconBtnDestructive}>
                      <Feather name="trash-2" size={18} color="#b91c1c" />
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />
        </View>

        {/* Add/Edit Modal */}
        <Modal visible={modalVisible} animationType="slide" transparent>
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{editing ? "Edit Expense" : "Add New Expense"}</Text>
                <Pressable onPress={closeModal}>
                  <Feather name="x" size={22} color="#111827" />
                </Pressable>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Expense Name</Text>
                <TextInput
                  placeholder="Enter expense name"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerWrap}>
                  <Picker selectedValue={category} onValueChange={(v) => setCategory(String(v))}>
                    <Picker.Item label="Select category" value="" />
                    {categories.map((c) => (
                      <Picker.Item key={c} label={c} value={c} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Amount (THB)</Text>
                <TextInput
                  placeholder="0"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                  style={styles.input}
                />
                {amount ? (
                  <Text style={styles.convertHint}>
                    {formatTHB(Number(amount) || 0)} • <Text style={styles.inr}>{toINR(Number(amount) || 0)}</Text>
                  </Text>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Due Date</Text>
                <Pressable onPress={() => setShowDatePicker(true)} style={styles.inputPressable}>
                  <Feather name="calendar" size={16} color="#374151" />
                  <Text style={styles.inputPressableText}>{formatDate(dueDate)}</Text>
                </Pressable>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(dueDate + "T00:00:00")}
                    onChange={onChangeDate}
                    mode="date"
                  />
                )}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  placeholder="Optional description"
                  value={description}
                  onChangeText={setDescription}
                  style={[styles.input, { height: 90, textAlignVertical: "top" }]}
                  multiline
                />
              </View>

              <Pressable onPress={saveExpense} style={[styles.primaryBtn, { alignSelf: "stretch", justifyContent: "center" }]}>
                <Text style={styles.primaryBtnText}>{editing ? "Save Changes" : "Add Expense"}</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 8, gap: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  h1: { fontSize: 22, fontWeight: "800", color: "#0f172a" },

  primaryBtn: {
    backgroundColor: "#1f2937",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: { color: "#fff", fontWeight: "700" },

  cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { flexGrow: 1, flexBasis: "48%", backgroundColor: "#fff", borderRadius: 14, padding: 14, elevation: 1, borderWidth: 1, borderColor: "#eceff3" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontSize: 12, color: "#1f2937", fontWeight: "700" },
  cardValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  inr: { fontSize: 11, color: "#6b7280" },

  listCard: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, elevation: 1, borderWidth: 1, borderColor: "#eceff3" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 8 },

  row: { flexDirection: "row", gap: 12, paddingVertical: 10 },
  rowTitle: { fontSize: 16, fontWeight: "700", color: "#111827" },
  rowSub: { fontSize: 13, color: "#6b7280", marginTop: 2 },

  rowMetaWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8, alignItems: "center" },
  metaPill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: "#f3f4f6", borderRadius: 999 },
  metaText: { fontSize: 12, color: "#374151", fontWeight: "600" },
  inrInline: { fontSize: 11, color: "#6b7280", fontWeight: "600" },

  actionsCol: { alignItems: "flex-end", justifyContent: "space-between" },
  outlineBtn: { borderWidth: 1, borderColor: "#e5e7eb", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 8 },
  outlineBtnText: { color: "#111827", fontWeight: "700" },
  iconRow: { flexDirection: "row", gap: 8 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#f3f4f6" },
  iconBtnDestructive: { padding: 8, borderRadius: 8, backgroundColor: "#fdecea" },

  separator: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 8 },

  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },

  // Modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    gap: 12,
    maxHeight: "90%",
  },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  field: { gap: 6 },
  label: { fontSize: 13, color: "#374151", fontWeight: "700" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: "#111827",
  },
  convertHint: { marginTop: 6, color: "#6b7280", fontSize: 12 },

  pickerWrap: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  inputPressable: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputPressableText: { fontSize: 15, color: "#111827", fontWeight: "600" },
});
