import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TextInput,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { api } from "@/lib/api"; // ADDED: API client

// ===== Types (yours) =====
type User = {
  id: string;
  name: string;
  email: string;
  role:
    | "Rider"
    | "Cook"
    | "Supervisor"
    | "Refill Coordinator"
    | "Admin"
    | "Kitchen Helper";
  status: "Active" | "Inactive";
  // optional payroll fields (kept for parity with web)
  currency?: "THB" | "INR" | "USD";
  baseSalary?: number;
  payFrequency?: "Monthly" | "Weekly" | "Daily" | "Hourly";
  employmentType?: "Full-time" | "Part-time" | "Contract" | "Gig / On-demand";
  vat?: number;
  effectiveFrom?: string; // ISO date
  otEligible?: boolean;
  otRate?: number;
  allowances?: number;
  deductions?: number;
  taxId?: string;
  bank?: {
    holder?: string;
    account?: string;
    bankName?: string;
    ifsc?: string;
  };
  notes?: string;
};

// ===== NEW: API role + Requests =====
type ApiRole = "superadmin" | "rider" | "cook" | "supervisor" | "refill";
type RequestItem = {
  _id: string;
  name: string;
  email: string;
  role: ApiRole; // rider | cook | supervisor | refill
  createdAt?: string;
};

const toUiRole = (r: ApiRole): User["role"] =>
  r === "rider"
    ? "Rider"
    : r === "cook"
    ? "Cook"
    : r === "supervisor"
    ? "Supervisor"
    : r === "refill"
    ? "Refill Coordinator"
    : "Admin";

// ===== Seed (kept, but not used anymore) =====
const seed: User[] = [
  { id: "1", name: "John Smith", email: "john@foodcart.com", role: "Rider", status: "Active" },
  { id: "2", name: "Sarah Khan", email: "sarah@foodcart.com", role: "Cook", status: "Active" },
  { id: "3", name: "Mike Davis", email: "mike@foodcart.com", role: "Supervisor", status: "Active" },
  { id: "4", name: "Emily Brown", email: "emily@foodcart.com", role: "Refill Coordinator", status: "Inactive" },
];

export default function UserManagement() {
  // ===== Users list (now real data) =====
  const [users, setUsers] = useState<User[]>([]); // changed from seed to []
  const [usersLoading, setUsersLoading] = useState(false);

  // ===== Requests (new) =====
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [reqLoading, setReqLoading] = useState(false);

  // ===== Your existing form/modal state =====
  const [open, setOpen] = useState(false);
  const [editing, setEdit] = useState<User | null>(null);

  // base fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<User["role"]>("Rider");
  const [status, setStatus] = useState<User["status"]>("Active");

  // salary / payroll fields (parity with web)
  const [currency, setCurrency] = useState<User["currency"] | "">("");
  const [baseSalary, setBaseSalary] = useState<string>("");
  const [payFrequency, setPayFrequency] = useState<User["payFrequency"] | "">("");
  const [employmentType, setEmploymentType] = useState<User["employmentType"] | "">("");
  const [vat, setVat] = useState<string>("");
  const [effectiveFrom, setEffectiveFrom] = useState("");
  const [otEligible, setOtEligible] = useState(false);
  const [otRate, setOtRate] = useState<string>("");
  const [allowances, setAllowances] = useState<string>("");
  const [deductions, setDeductions] = useState<string>("");
  const [taxId, setTaxId] = useState("");
  const [bankHolder, setBankHolder] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankName, setBankName] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setEdit(null);
    setName("");
    setEmail("");
    setRole("Rider");
    setStatus("Active");
    setCurrency("");
    setBaseSalary("");
    setPayFrequency("");
    setEmploymentType("");
    setVat("");
    setEffectiveFrom("");
    setOtEligible(false);
    setOtRate("");
    setAllowances("");
    setDeductions("");
    setTaxId("");
    setBankHolder("");
    setBankAccount("");
    setBankName("");
    setIfsc("");
    setNotes("");
  };

  const startAdd = () => {
    reset();
    setOpen(true);
  };
  const startEdit = (u: User) => {
    setEdit(u);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setStatus(u.status);
    setCurrency(u.currency ?? "");
    setBaseSalary(u.baseSalary != null ? String(u.baseSalary) : "");
    setPayFrequency(u.payFrequency ?? "");
    setEmploymentType(u.employmentType ?? "");
    setVat(u.vat != null ? String(u.vat) : "");
    setEffectiveFrom(u.effectiveFrom ?? "");
    setOtEligible(!!u.otEligible);
    setOtRate(u.otRate != null ? String(u.otRate) : "");
    setAllowances(u.allowances != null ? String(u.allowances) : "");
    setDeductions(u.deductions != null ? String(u.deductions) : "");
    setTaxId(u.taxId ?? "");
    setBankHolder(u.bank?.holder ?? "");
    setBankAccount(u.bank?.account ?? "");
    setBankName(u.bank?.bankName ?? "");
    setIfsc(u.bank?.ifsc ?? "");
    setNotes(u.notes ?? "");
    setOpen(true);
  };

  const save = () => {
    if (!name.trim() || !email.includes("@")) {
      Alert.alert("Please enter a valid name and email.");
      return;
    }
    const next: User = {
      id: editing ? editing.id : String(Date.now()),
      name,
      email,
      role,
      status,
      currency: currency || undefined,
      baseSalary: baseSalary ? Number(baseSalary) : undefined,
      payFrequency: (payFrequency || undefined) as User["payFrequency"] | undefined,
      employmentType: (employmentType || undefined) as User["employmentType"] | undefined,
      vat: vat ? Number(vat) : undefined,
      effectiveFrom: effectiveFrom || undefined,
      otEligible,
      otRate: otRate ? Number(otRate) : undefined,
      allowances: allowances ? Number(allowances) : undefined,
      deductions: deductions ? Number(deductions) : undefined,
      taxId: taxId || undefined,
      bank: {
        holder: bankHolder || undefined,
        account: bankAccount || undefined,
        bankName: bankName || undefined,
        ifsc: ifsc || undefined,
      },
      notes: notes || undefined,
    };

    if (editing) {
      setUsers((arr) => arr.map((x) => (x.id === editing.id ? next : x)));
    } else {
      setUsers((arr) => [...arr, next]);
    }
    setOpen(false);
    reset();
  };

  const remove = (id: string) => setUsers((arr) => arr.filter((x) => x.id !== id));

  // ===== NEW: Load users from backend =====
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await api.get<{
        items: Array<{
          id: string;
          name: string;
          email: string;
          role: ApiRole;
          status: "Active" | "Inactive";
        }>;
      }>("/api/admin/users");

      const mapped: User[] = (res.items || []).map((it) => ({
        id: it.id,
        name: it.name,
        email: it.email,
        role: toUiRole(it.role),
        status: it.status,
      }));
      setUsers(mapped);
    } catch (e: any) {
      Alert.alert("Could not load users", e.message || "Unknown error");
      // Optional fallback to seed if you want:
      // setUsers(seed);
    } finally {
      setUsersLoading(false);
    }
  };

  // ===== NEW: Load/approve/decline requests =====
  const loadRequests = async () => {
    setReqLoading(true);
    try {
      const res = await api.get<{ items: RequestItem[] }>("/api/admin/requests");
      setRequests(res.items || []);
    } catch (e: any) {
      Alert.alert("Could not load registration requests", e.message || "Unknown error");
    } finally {
      setReqLoading(false);
    }
  };

  const approve = async (id: string) => {
    try {
      const res = await api.post<{
        ok: true;
        user: { id: string; email: string; name: string; role: ApiRole };
      }>(`/api/admin/requests/${id}/approve`);

      setRequests((arr) => arr.filter((r) => r._id !== id));
      // Option 1: re-fetch canonical list (recommended)
      await loadUsers();
      // Option 2 (optional): also append locally for instant UI
      // setUsers(arr => [{ id: res.user.id, name: res.user.name, email: res.user.email, role: toUiRole(res.user.role), status: "Active" }, ...arr]);

      Alert.alert(
        "Approved",
        `${res.user.name} added as ${toUiRole(res.user.role)}.`
      );
    } catch (e: any) {
      Alert.alert("Approve failed", e.message || "Unknown error");
    }
  };

  const decline = async (id: string) => {
    try {
      await api.post(`/api/admin/requests/${id}/decline`);
      setRequests((arr) => arr.filter((r) => r._id !== id));
    } catch (e: any) {
      Alert.alert("Decline failed", e.message || "Unknown error");
    }
  };

  // ===== Initial load =====
  useEffect(() => {
    loadUsers();
    loadRequests();
  }, []);

  // ===== UI =====
  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>User Management</Text>
          <Text style={styles.subtle}>Manage system users and their roles</Text>
        </View>

        {/* Add User button (mirrors web DialogTrigger → Dialog) */}
        <Pressable style={styles.addBtn} onPress={startAdd}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>  Add User</Text>
        </Pressable>
      </View>

      {/* ===== NEW: Pending Registration Requests ===== */}
      <View style={styles.card}>
        <View
          style={[
            styles.row,
            { justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
          ]}
        >
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              Pending Registration Requests
            </Text>
            <Text style={styles.subtle}>
              Approve or decline incoming user registrations
            </Text>
          </View>
          <Pressable
            onPress={loadRequests}
            style={[styles.iconBtn, { paddingHorizontal: 12, paddingVertical: 8 }]}
          >
            {reqLoading ? <ActivityIndicator /> : <Feather name="refresh-ccw" size={16} />}
          </Pressable>
        </View>

        {requests.length === 0 ? (
          <Text style={styles.subtle}>No pending requests.</Text>
        ) : (
          <View style={{ gap: 10 }}>
            {requests.map((r) => (
              <View key={r._id} style={[styles.row, styles.reqRow]}>
                <View style={{ flex: 1.6 }}>
                  <Text style={{ fontWeight: "700" }}>{r.name}</Text>
                  <Text style={styles.subtle}>{r.email}</Text>
                </View>
                <Text style={{ flex: 1, fontWeight: "600" }}>{toUiRole(r.role)}</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  <Pressable
                    onPress={() => approve(r._id)}
                    style={[styles.pillBtn, { backgroundColor: "#2e7d32" }]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Approve</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => decline(r._id)}
                    style={[styles.pillBtn, { backgroundColor: "#c62828" }]}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>Decline</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Table-like list (yours) */}
      <View style={styles.card}>
        <View style={[styles.row, styles.thead]}>
          <Text style={[styles.cellName, styles.bold]}>Name</Text>
          <Text style={[styles.cellEmail, styles.bold]}>Email</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Role</Text>
          <Text style={[styles.cellSmall, styles.bold]}>Status</Text>
          <Text style={[styles.cellActions, styles.bold]}>Actions</Text>
        </View>

        {usersLoading ? (
          <ActivityIndicator style={{ marginTop: 10 }} />
        ) : null}

        <FlatList
          data={users}
          keyExtractor={(i) => i.id}
          scrollEnabled={false} // keep your ScrollView as the scroller
          ListEmptyComponent={
            !usersLoading ? (
              <Text style={{ padding: 12, color: "#6b7280" }}>No users yet.</Text>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={[styles.row, styles.trow]}>
              <Text style={styles.cellName}>{item.name}</Text>
              <Text style={styles.cellEmail}>{item.email}</Text>
              <Text style={styles.cellSmall}>{item.role}</Text>
              <View style={[styles.cellSmall, { alignItems: "flex-start" }]}>
                <View
                  style={[
                    styles.badge,
                    item.status === "Active" ? styles.badgeGreen : styles.badgeGray,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === "Active" ? styles.badgeTextOn : styles.badgeTextOff,
                    ]}
                  >
                    {item.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.cellActions, { flexDirection: "row", gap: 8 }]}>
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

      {/* Add/Edit Modal — fields mirror web dialog */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, maxHeight: "90%" }]}>
            <Text style={styles.modalTitle}>{editing ? "Edit User" : "Add New User"}</Text>
            <Text style={styles.subtle}>Create a new user account for the system.</Text>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {/* Basic Info */}
              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full name"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="user@email.com"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Role</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Rider / Cook / Supervisor / Admin / Kitchen Helper"
                    value={role}
                    onChangeText={(t) => setRole(t as User["role"])}
                  />
                </View>
              </View>

              {/* Salary Details */}
              <View style={styles.sectionSplit} />
              <Text style={styles.sectionTitle}>Salary Details</Text>

              <View style={styles.formRow}>
                <View className="field" style={styles.field}>
                  <Text style={styles.label}>Currency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="THB / INR / USD"
                    value={currency}
                    onChangeText={(t) => setCurrency(t as any)}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Base Salary</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 25000"
                    keyboardType="numeric"
                    value={baseSalary}
                    onChangeText={setBaseSalary}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Pay Frequency</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Monthly / Weekly / Daily / Hourly"
                    value={payFrequency}
                    onChangeText={(t) => setPayFrequency(t as any)}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Employment Type</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Full-time / Part-time / Contract / Gig"
                    value={employmentType}
                    onChangeText={(t) => setEmploymentType(t as any)}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Tax / VAT (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 5"
                    keyboardType="numeric"
                    value={vat}
                    onChangeText={setVat}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Effective From</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={effectiveFrom}
                    onChangeText={setEffectiveFrom}
                  />
                </View>
              </View>

              <View style={[styles.formRow, { alignItems: "center" }]}>
                <View
                  style={[
                    styles.field,
                    { flexDirection: "row", alignItems: "center", gap: 10 },
                  ]}
                >
                  <Switch value={otEligible} onValueChange={setOtEligible} />
                  <Text style={styles.label}>Overtime Eligible</Text>
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>OT Rate (%)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., 150"
                    keyboardType="numeric"
                    value={otRate}
                    onChangeText={setOtRate}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Allowances</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Monthly total allowances"
                    keyboardType="numeric"
                    value={allowances}
                    onChangeText={setAllowances}
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>Deductions</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Monthly total deductions"
                    keyboardType="numeric"
                    value={deductions}
                    onChangeText={setDeductions}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Tax ID (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="PAN / TIN / National Tax ID"
                    value={taxId}
                    onChangeText={setTaxId}
                  />
                </View>
              </View>

              {/* Bank Details */}
              <View style={styles.bankBox}>
                <Text style={[styles.label, { marginBottom: 8 }]}>Bank Details</Text>
                <View style={styles.formRow}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Account Holder</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Name as per bank"
                      value={bankHolder}
                      onChangeText={setBankHolder}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>Account No / IBAN</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="XXXX-XXXX-XXXX"
                      value={bankAccount}
                      onChangeText={setBankAccount}
                    />
                  </View>
                </View>
                <View style={styles.formRow}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Bank Name</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="e.g., HDFC, SCB"
                      value={bankName}
                      onChangeText={setBankName}
                    />
                  </View>
                  <View style={styles.field}>
                    <Text style={styles.label}>IFSC / SWIFT</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="IFSC (India) / SWIFT (Intl.)"
                      value={ifsc}
                      onChangeText={setIfsc}
                    />
                  </View>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.formRow}>
                <View style={styles.field}>
                  <Text style={styles.label}>Notes</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Any special pay terms / remarks"
                    value={notes}
                    onChangeText={setNotes}
                  />
                </View>
              </View>

              <View style={styles.actionsRow}>
                <Pressable style={styles.btnOutline} onPress={() => setOpen(false)}>
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable style={styles.btnSolid} onPress={save}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {editing ? "Save User" : "Create User"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ===== Styles (yours + small additions) =====
const styles = StyleSheet.create({
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  h1: { fontSize: 24, fontWeight: "700" },
  subtle: { color: "#6b7280" },

  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },

  row: { flexDirection: "row", alignItems: "center" },
  thead: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#e5e7eb" },
  trow: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f3f4f6" },

  cellName: { flex: 1.5 },
  cellEmail: { flex: 1.8 },
  cellSmall: { flex: 1 },
  cellActions: { flex: 1.2, alignItems: "flex-end" },
  bold: { fontWeight: "700" },

  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  badgeGreen: { backgroundColor: "#10b98122", borderColor: "#10b98155" },
  badgeGray: { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextOn: { color: "#065f46" },
  badgeTextOff: { color: "#374151" },

  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "700" },

  formRow: { flexDirection: "row", gap: 12 },
  field: { flex: 1, gap: 6 },
  label: { fontWeight: "600", color: "#374151" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 6 },
  btnOutline: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 10, borderColor: "#d1d5db" },
  btnSolid: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#111827", borderRadius: 10 },

  bankBox: { backgroundColor: "#f3f4f6", padding: 12, borderRadius: 10 },
  iconBtn: { padding: 8, backgroundColor: "#f0f0f0", borderRadius: 6, alignItems: "center", justifyContent: "center" },

  sectionSplit: {
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  // ADDED: request row/button styles
  reqRow: { paddingVertical: 10, borderTopWidth: 1, borderColor: "#eef1f5", justifyContent: "space-between" },
  pillBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 999 },
});
