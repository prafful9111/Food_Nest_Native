import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ===== Seed data (parity with web) ===== */
type Vehicle = {
  id: number;
  registrationNo: string;
  serviceDate: string; // ISO-like date
  status: "Available" | "In Use" | "Issue";
  assignedRider: string | null;
  notes: string;
};

type Rider = { id: number; name: string; available: boolean };

const seedVehicles: Vehicle[] = [
  { id: 1, registrationNo: "MH12AB1234", serviceDate: "2024-01-15", status: "Available", assignedRider: null,        notes: "Recent maintenance completed" },
  { id: 2, registrationNo: "MH12CD5678", serviceDate: "2024-01-10", status: "In Use",    assignedRider: "John Smith", notes: "Good condition" },
  { id: 3, registrationNo: "MH12EF9012", serviceDate: "2023-12-20", status: "Issue",     assignedRider: null,        notes: "Puncture repair needed" },
];

const riders: Rider[] = [
  { id: 1, name: "John Smith",  available: false },
  { id: 2, name: "Mike Davis",  available: true  },
  { id: 3, name: "Sarah Johnson", available: true },
];

/* ===== Helpers ===== */
function tone(status: Vehicle["status"]) {
  switch (status) {
    case "Available": return { bg: "#10b98122", border: "#10b98155", text: "#065f46" };
    case "In Use":    return { bg: "#2563eb22", border: "#2563eb55", text: "#1e40af" };
    case "Issue":     return { bg: "#ef444422", border: "#ef444455", text: "#991b1b" };
  }
}
const field = (label: string, children: React.ReactNode) => (
  <View style={{ gap: 6 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

/* ===== Screen ===== */
export default function VehiclesManagement() {
  const [list, setList] = useState<Vehicle[]>(seedVehicles);

  // Add Vehicle modal
  const [openAdd, setOpenAdd] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [initialStatus, setInitialStatus] = useState<Vehicle["status"]>("Available");
  const [notes, setNotes] = useState("");

  // Issue modal
  const [openIssue, setOpenIssue] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [issueType, setIssueType] = useState("");
  const [issueDesc, setIssueDesc] = useState("");

  // Assign rider mini-picker
  const availableRiders = useMemo(() => riders.filter(r => r.available), []);

  const addVehicle = () => {
    if (!regNo.trim()) return;
    const v: Vehicle = {
      id: Date.now(),
      registrationNo: regNo.trim(),
      serviceDate: serviceDate || new Date().toISOString().slice(0, 10),
      status: initialStatus,
      assignedRider: null,
      notes: notes.trim(),
    };
    setList(prev => [v, ...prev]);
    setOpenAdd(false);
    setRegNo(""); setServiceDate(""); setInitialStatus("Available"); setNotes("");
  };

  const markIssue = (v: Vehicle) => {
    setActiveVehicle(v);
    setOpenIssue(true);
  };
  const submitIssue = () => {
    if (!activeVehicle || !issueType) return;
    setList(prev => prev.map(v => v.id === activeVehicle.id
      ? { ...v, status: "Issue", notes: [v.notes, `${issueType}: ${issueDesc}`].filter(Boolean).join(" · ") }
      : v));
    setOpenIssue(false);
    setActiveVehicle(null);
    setIssueType(""); setIssueDesc("");
  };

  const assignRider = (vehId: number, name: string | null) =>
    setList(prev => prev.map(v => v.id === vehId ? { ...v, assignedRider: name, status: name ? "In Use" : "Available" } : v));

  const clearIssue = (vehId: number) =>
    setList(prev => prev.map(v => v.id === vehId ? { ...v, status: "Available" } : v));

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Vehicles Management</Text>
          <Text style={styles.subtle}>Manage fleet vehicles and track their status</Text>
        </View>
        <Pressable style={styles.btnSolid} onPress={() => setOpenAdd(true)}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.btnSolidText}>  Add Vehicle</Text>
        </Pressable>
      </View>

      {/* Cards */}
      <View style={{ gap: 12 }}>
        {list.map(v => {
          const t = tone(v.status);
          return (
            <View key={v.id} style={styles.card}>
              {/* top row */}
              <View style={styles.rowBetween}>
                <View>
                  <View style={[styles.row, { gap: 8, alignItems: "center" }]}>
                    <Feather name="truck" size={18} />
                    <Text style={styles.cardTitle}>{v.registrationNo}</Text>
                  </View>
                  <Text style={styles.subtleSmall}>Last service: {v.serviceDate}</Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <View style={[styles.badge, { backgroundColor: t.bg, borderColor: t.border }]}>
                    <Text style={[styles.badgeText, { color: t.text }]}>{v.status}</Text>
                  </View>
                </View>
              </View>

              {/* details */}
              <View style={{ marginTop: 10, gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.subtleSmall}>
                    Rider: {v.assignedRider ?? "Unassigned"}
                  </Text>
                  {v.assignedRider ? (
                    <Pressable style={styles.btnOutlineSm} onPress={() => assignRider(v.id, null)}>
                      <Feather name="user-x" size={14} /><Text>  Unassign</Text>
                    </Pressable>
                  ) : (
                    <AssignMenu
                      riders={availableRiders}
                      onPick={(name) => assignRider(v.id, name)}
                    />
                  )}
                </View>
                {!!v.notes && <Text style={styles.subtleSmall}>Notes: {v.notes}</Text>}
              </View>

              {/* actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8, marginTop: 10 }]}>
                {v.status === "Issue" ? (
                  <Pressable style={styles.btnOutlineSm} onPress={() => clearIssue(v.id)}>
                    <Feather name="check-circle" size={14} /><Text>  Resolve</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.btnOutlineSm} onPress={() => markIssue(v)}>
                    <Feather name="alert-triangle" size={14} /><Text>  Report Issue</Text>
                  </Pressable>
                )}
                <Pressable style={styles.btnOutlineSm} onPress={() => {/* future: edit sheet */}}>
                  <Feather name="edit-2" size={14} /><Text>  Edit</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* ===== Add Vehicle Modal ===== */}
      <Modal transparent visible={openAdd} animationType="slide" onRequestClose={() => setOpenAdd(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="truck" size={18} />
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Add New Vehicle</Text>
            </View>
            {field("Registration Number", (
              <TextInput
                value={regNo}
                onChangeText={setRegNo}
                placeholder="e.g., MH12AB1234"
                style={styles.input}
              />
            ))}
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                {field("Last Service Date", (
                  <TextInput
                    value={serviceDate}
                    onChangeText={setServiceDate}
                    placeholder="YYYY-MM-DD"
                    style={styles.input}
                  />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                {field("Initial Status", (
                  <Segmented
                    options={["Available", "Issue"]}
                    value={initialStatus}
                    onChange={(v) => setInitialStatus(v as Vehicle["status"])}
                  />
                ))}
              </View>
            </View>
            {field("Notes", (
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Any additional notes"
                multiline
                style={[styles.input, { height: 90, textAlignVertical: "top" }]}
              />
            ))}
            <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenAdd(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSolid, !regNo.trim() && { opacity: 0.5 }]}
                disabled={!regNo.trim()}
                onPress={addVehicle}
              >
                <Text style={styles.btnSolidText}>Add Vehicle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Report Issue Modal ===== */}
      <Modal transparent visible={openIssue} animationType="slide" onRequestClose={() => setOpenIssue(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Report Vehicle Issue</Text>
              <Text style={styles.subtleSmall}>
                Vehicle: {activeVehicle?.registrationNo ?? "-"}
              </Text>
            </View>
            {field("Issue Type", (
              <Segmented
                options={["Puncture", "Maintenance", "Breakdown", "Accident", "Other"]}
                value={issueType}
                onChange={setIssueType}
              />
            ))}
            {field("Description", (
              <TextInput
                value={issueDesc}
                onChangeText={setIssueDesc}
                placeholder="Describe the issue in detail"
                multiline
                style={[styles.input, { height: 100, textAlignVertical: "top" }]}
              />
            ))}
            <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenIssue(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.btnSolid, !issueType && { opacity: 0.5 }]}
                disabled={!issueType}
                onPress={submitIssue}
              >
                <Text style={styles.btnSolidText}>Report Issue</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===== Small UI bits ===== */
function AssignMenu({ riders, onPick }: { riders: Rider[]; onPick: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  return open ? (
    <View style={styles.assignMenu}>
      {riders.map(r => (
        <Pressable key={r.id} style={styles.assignRow} onPress={() => { onPick(r.name); setOpen(false); }}>
          <Feather name="user-plus" size={14} />
          <Text>  {r.name}</Text>
        </Pressable>
      ))}
      <Pressable style={[styles.assignRow, { borderTopWidth: 1, borderColor: "#e5e7eb" }]} onPress={() => setOpen(false)}>
        <Feather name="x" size={14} />
        <Text>  Close</Text>
      </Pressable>
    </View>
  ) : (
    <Pressable style={styles.btnOutlineSm} onPress={() => setOpen(true)}>
      <Feather name="user-plus" size={14} /><Text>  Assign Rider</Text>
    </Pressable>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map(opt => {
        const active = value === opt;
        return (
          <Pressable key={opt} onPress={() => onChange(opt)} style={[styles.segmentBtn, active && styles.segmentBtnActive]}>
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ===== Styles ===== */
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
  cardTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  label: { fontWeight: "700", color: "#111827" },

  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
  badgeText: { fontSize: 12, fontWeight: "700" },

  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: "#fff" },

  // buttons
  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  btnOutline: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnOutlineSm: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  // segmented control
  segmented: { flexDirection: "row", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  segmentBtnActive: { backgroundColor: "#111827" },
  segmentText: { fontWeight: "700", color: "#111827" },
  segmentTextActive: { color: "#fff" },

  // assign menu
  assignMenu: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden", backgroundColor: "#fff" },
  assignRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10 },

  // modal backdrop
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
});
