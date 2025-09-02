// vehicles-management.tsx
import React, { useMemo, useState, useEffect } from "react";
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
import { LinearGradient } from "expo-linear-gradient";

/* ===================== Types ===================== */
type VehicleStatus = "Available" | "In Use" | "Issue";

type Vehicle = {
  id: number;
  registrationNo: string;
  serviceDate: string; // YYYY-MM-DD
  status: VehicleStatus;
  assignedRider: string | null;
  notes: string;
  batteryIMEI?: string | null;
};

type Battery = {
  id: number;
  imei: string;
  vehicleId: number;
  type: "Lithium-ion 48V" | "Lithium-ion 60V" | "Lead Acid 48V" | "Lead Acid 60V";
  capacity: string; // e.g., "20Ah"
  installationDate: string; // YYYY-MM-DD
  status: "Active" | "Maintenance" | "Faulty";
  lastChecked?: string; // YYYY-MM-DD
};

type ServiceRecord = {
  id: number;
  vehicleId: number;
  date: string; // YYYY-MM-DD
  type: "Regular Maintenance" | "Repair";
  description: string;
  cost: number; // INR
  mechanic: string;
};

type Rider = { id: number; name: string; available: boolean };

/* ===================== Seed Data (matches web) ===================== */
// Vehicles
const seedVehicles: Vehicle[] = [
  {
    id: 1,
    registrationNo: "MH12AB1234",
    serviceDate: "2024-01-15",
    status: "Available",
    assignedRider: null,
    notes: "Recent maintenance completed",
    batteryIMEI: "356938035643809",
  },
  {
    id: 2,
    registrationNo: "MH12CD5678",
    serviceDate: "2024-01-10",
    status: "In Use",
    assignedRider: "John Smith",
    notes: "Good condition",
    batteryIMEI: "356938035643810",
  },
  {
    id: 3,
    registrationNo: "MH12EF9012",
    serviceDate: "2023-12-20",
    status: "Issue",
    assignedRider: null,
    notes: "Puncture repair needed",
    batteryIMEI: null,
  },
];

// Batteries (sample batteries kept)
const seedBatteries: Battery[] = [
  {
    id: 1,
    imei: "356938035643809",
    vehicleId: 1,
    type: "Lithium-ion 48V",
    capacity: "20Ah",
    installationDate: "2024-01-15",
    status: "Active",
    lastChecked: "2024-01-20",
  },
  {
    id: 2,
    imei: "356938035643810",
    vehicleId: 2,
    type: "Lithium-ion 48V",
    capacity: "20Ah",
    installationDate: "2024-01-10",
    status: "Active",
    lastChecked: "2024-01-18",
  },
];

// Service Records
const seedService: ServiceRecord[] = [
  {
    id: 1,
    vehicleId: 1,
    date: "2024-01-15",
    type: "Regular Maintenance",
    description: "Oil change, brake check, tire rotation",
    cost: 2500,
    mechanic: "Rajesh Kumar",
  },
  {
    id: 2,
    vehicleId: 1,
    date: "2023-12-01",
    type: "Repair",
    description: "Chain replacement",
    cost: 800,
    mechanic: "Suresh Patel",
  },
  {
    id: 3,
    vehicleId: 2,
    date: "2024-01-10",
    type: "Regular Maintenance",
    description: "General service and battery check",
    cost: 2200,
    mechanic: "Rajesh Kumar",
  },
  {
    id: 4,
    vehicleId: 3,
    date: "2023-12-20",
    type: "Repair",
    description: "Puncture repair and tire replacement",
    cost: 1200,
    mechanic: "Amit Singh",
  },
];

// Riders (displayed in web; selectable in native for convenience)
const riders: Rider[] = [
  { id: 1, name: "John Smith", available: false },
  { id: 2, name: "Mike Davis", available: true },
  { id: 3, name: "Sarah Johnson", available: true },
];

/* ===================== Helpers ===================== */
function tone(status: VehicleStatus) {
  switch (status) {
    case "Available":
      return { bg: "#10b98122", border: "#10b98155", text: "#065f46" };
    case "In Use":
      return { bg: "#2563eb22", border: "#2563eb55", text: "#1e40af" };
    case "Issue":
      return { bg: "#ef444422", border: "#ef444455", text: "#991b1b" };
  }
}
const field = (label: string, children: React.ReactNode) => (
  <View style={{ gap: 6 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);
const today = () => new Date().toISOString().slice(0, 10);
const UNASSIGNED_VEHICLE_ID = 0;

/* ===== Reusable: Gradient primary button (yellow) ===== */
function SolidButton({
  onPress,
  disabled,
  children,
  style,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ borderRadius: 10, overflow: "hidden" }}>
      <LinearGradient
        colors={["#fde047", "#facc15"]} // amber-300 -> amber-400
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.btnSolid, disabled && { opacity: 0.5 }, style]}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>{children}</View>
      </LinearGradient>
    </Pressable>
  );
}

/* ===================== Screen ===================== */
export default function VehiclesManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(seedVehicles);
  const [batteries, setBatteries] = useState<Battery[]>(seedBatteries);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>(seedService);

  // Add Vehicle modal
  const [openAdd, setOpenAdd] = useState(false);
  const [regNo, setRegNo] = useState("");
  const [serviceDate, setServiceDate] = useState("");
  const [initialStatus, setInitialStatus] = useState<VehicleStatus>("Available");
  const [notes, setNotes] = useState("");

  // Issue modal
  const [openIssue, setOpenIssue] = useState(false);
  const [activeVehicle, setActiveVehicle] = useState<Vehicle | null>(null);
  const [issueType, setIssueType] = useState("");
  const [issueDesc, setIssueDesc] = useState("");

  // Battery modal (per-vehicle)
  const [openBattery, setOpenBattery] = useState(false);
  const [batIMEI, setBatIMEI] = useState("");
  const [batType, setBatType] = useState<Battery["type"] | "">("");
  const [batCapacity, setBatCapacity] = useState("");
  const [batInstallDate, setBatInstallDate] = useState("");
  const [batStatus, setBatStatus] = useState<Battery["status"] | "">("");

  // Global Add Battery modal
  const [openAddBattery, setOpenAddBattery] = useState(false);
  const [newBatIMEI, setNewBatIMEI] = useState("");
  const [newBatType, setNewBatType] = useState<Battery["type"] | "">("");
  const [newBatCapacity, setNewBatCapacity] = useState("");
  const [newBatInstallDate, setNewBatInstallDate] = useState("");
  const [newBatStatus, setNewBatStatus] = useState<Battery["status"] | "">("");

  // Picker for existing unassigned batteries (inside per-vehicle Battery modal)
  const [pickExistingIMEI, setPickExistingIMEI] = useState<string>("");

  // Service modal
  const [openService, setOpenService] = useState(false);

  // Remove modal
  const [openRemove, setOpenRemove] = useState(false);

  // Assign rider mini-picker
  const availableRiders = useMemo(() => riders.filter((r) => r.available), []);
  const unassignedBatteries = useMemo(
    () => batteries.filter((b) => b.vehicleId === UNASSIGNED_VEHICLE_ID),
    [batteries]
  );

  // Prefill battery form when opening on a vehicle
  useEffect(() => {
    if (!openBattery) return;
    if (!activeVehicle) return;
    const existing = batteries.find((b) => b.vehicleId === activeVehicle.id);
    if (existing) {
      setBatIMEI(existing.imei);
      setBatType(existing.type);
      setBatCapacity(existing.capacity);
      setBatInstallDate(existing.installationDate);
      setBatStatus(existing.status);
    } else {
      setBatIMEI("");
      setBatType("");
      setBatCapacity("");
      setBatInstallDate("");
      setBatStatus("");
    }
    // reset picker only when the modal opens
    setPickExistingIMEI("");
  }, [openBattery, activeVehicle, batteries]);

  /* ===================== Actions ===================== */
  const addVehicle = () => {
    if (!regNo.trim()) return;
    const v: Vehicle = {
      id: Date.now(),
      registrationNo: regNo.trim(),
      serviceDate: serviceDate || today(),
      status: initialStatus,
      assignedRider: null,
      notes: notes.trim(),
      batteryIMEI: null,
    };
    setVehicles((prev) => [v, ...prev]);
    setOpenAdd(false);
    setRegNo("");
    setServiceDate("");
    setInitialStatus("Available");
    setNotes("");
  };

  const markIssue = (v: Vehicle) => {
    setActiveVehicle(v);
    setOpenIssue(true);
  };
  const submitIssue = () => {
    if (!activeVehicle || !issueType) return;
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? {
              ...v,
              status: "Issue",
              notes: [v.notes, `${issueType}: ${issueDesc}`]
                .filter(Boolean)
                .join(" · "),
            }
          : v
      )
    );
    setOpenIssue(false);
    setActiveVehicle(null);
    setIssueType("");
    setIssueDesc("");
  };
  const clearIssue = (vehId: number) =>
    setVehicles((prev) =>
      prev.map((v) => (v.id === vehId ? { ...v, status: "Available" } : v))
    );

  const assignRider = (vehId: number, name: string | null) =>
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === vehId
          ? { ...v, assignedRider: name, status: name ? "In Use" : "Available" }
          : v
      )
    );

  const openBatteryFor = (v: Vehicle) => {
    setActiveVehicle(v);
    setOpenBattery(true);
  };

  const submitBattery = () => {
    if (!activeVehicle) return;
    if (!batIMEI || !batType || !batStatus) return;

    setBatteries((prev) => {
      const byVehicle = prev.find((b) => b.vehicleId === activeVehicle.id);
      const byIMEI = prev.find((b) => b.imei === batIMEI.trim());

      // If IMEI exists elsewhere, move it to this vehicle (and free previous)
      if (byIMEI && byIMEI.vehicleId !== activeVehicle.id) {
        return prev.map((b) =>
          b.id === byIMEI.id
            ? {
                ...b,
                type: batType as Battery["type"],
                capacity: batCapacity,
                installationDate: batInstallDate || b.installationDate || today(),
                status: batStatus as Battery["status"],
                lastChecked: today(),
                vehicleId: activeVehicle.id,
              }
            : b.vehicleId === activeVehicle.id && b.id !== byIMEI.id
            ? { ...b, vehicleId: UNASSIGNED_VEHICLE_ID }
            : b
        );
      }

      // If vehicle already had a battery, update it
      if (byVehicle) {
        return prev.map((b) =>
          b.vehicleId === activeVehicle.id
            ? {
                ...b,
                imei: batIMEI.trim(),
                type: batType as Battery["type"],
                capacity: batCapacity,
                installationDate: batInstallDate || b.installationDate || today(),
                status: batStatus as Battery["status"],
                lastChecked: today(),
              }
            : b
        );
      }

      // Otherwise, create a new battery attached to the vehicle
      return [
        ...prev,
        {
          id: Date.now(),
          imei: batIMEI.trim(),
          vehicleId: activeVehicle.id,
          type: batType as Battery["type"],
          capacity: batCapacity,
          installationDate: batInstallDate || today(),
          status: batStatus as Battery["status"],
          lastChecked: today(),
        },
      ];
    });

    // reflect battery IMEI on the vehicle
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id ? { ...v, batteryIMEI: batIMEI.trim() } : v
      )
    );

    setOpenBattery(false);
  };

  const openServiceFor = (v: Vehicle) => {
    setActiveVehicle(v);
    setOpenService(true);
  };

  const openRemoveFor = (v: Vehicle) => {
    setActiveVehicle(v);
    setOpenRemove(true);
  };
  const confirmRemove = () => {
    if (!activeVehicle) return;
    const id = activeVehicle.id;
    setVehicles((prev) => prev.filter((v) => v.id !== id));
    setBatteries((prev) => prev.filter((b) => b.vehicleId !== id));
    setServiceRecords((prev) => prev.filter((s) => s.vehicleId !== id));
    setOpenRemove(false);
    setActiveVehicle(null);
  };

  // Add Battery globally (unassigned first)
  const addBatteryGlobally = () => {
    if (!newBatIMEI || !newBatType || !newBatStatus) return;

    // prevent duplicates
    const dup = batteries.some((b) => b.imei.trim() === newBatIMEI.trim());
    if (dup) {
      alert("A battery with this IMEI already exists.");
      return;
    }

    setBatteries((prev) => [
      ...prev,
      {
        id: Date.now(),
        imei: newBatIMEI.trim(),
        vehicleId: UNASSIGNED_VEHICLE_ID,
        type: newBatType as Battery["type"],
        capacity: newBatCapacity.trim(),
        installationDate: newBatInstallDate || today(),
        status: newBatStatus as Battery["status"],
        lastChecked: today(),
      },
    ]);

    setOpenAddBattery(false);
    setNewBatIMEI("");
    setNewBatType("");
    setNewBatCapacity("");
    setNewBatInstallDate("");
    setNewBatStatus("");
  };

  /* ===================== Render ===================== */
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Vehicles Management</Text>
          <Text style={styles.subtle}>Manage fleet vehicles and track their status</Text>
        </View>
      </View>

      {/* Actions row (left-aligned) */}
      <View style={[styles.row, { gap: 8 }]}>
        <SolidButton onPress={() => setOpenAdd(true)}>
          <Feather name="plus" size={16} color="#ffffff" />
          <Text style={[styles.btnSolidText, { color: "#ffffff", marginLeft: 6 }]}>Add Vehicle</Text>
        </SolidButton>

        {/* Add Battery button (global) */}
        <SolidButton onPress={() => setOpenAddBattery(true)}>
          <Feather name="battery-charging" size={16} color="#ffffff" />
          <Text style={[styles.btnSolidText, { color: "#ffffff", marginLeft: 6 }]}>Add Battery</Text>
        </SolidButton>
      </View>

      {/* Cards (one per vehicle) */}
      <View style={{ gap: 12 }}>
        {vehicles.map((v) => {
          const t = tone(v.status);
          const battery = batteries.find((b) => b.vehicleId === v.id);
          return (
            <View key={v.id} style={styles.card}>
              {/* Top row */}
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

              {/* Details */}
              <View style={{ marginTop: 10, gap: 6 }}>
                <View style={styles.rowBetween}>
                  <Text style={styles.subtleSmall}>
                    Rider: {v.assignedRider ?? "Unassigned"}
                  </Text>
                  {v.assignedRider ? (
                    <Pressable style={styles.btnOutlineSm} onPress={() => assignRider(v.id, null)}>
                      <Feather name="user-x" size={14} />
                      <Text>  Unassign</Text>
                    </Pressable>
                  ) : (
                    <AssignMenu
                      riders={availableRiders}
                      onPick={(name) => assignRider(v.id, name)}
                    />
                  )}
                </View>

                {!!v.notes && <Text style={styles.subtleSmall}>Notes: {v.notes}</Text>}

                {/* Battery quick glance */}
                <View style={styles.rowBetween}>
                  <Text style={styles.subtleSmall}>
                    Battery: {battery ? `${battery.imei} • ${battery.status}` : "— None —"}
                  </Text>
                  <Pressable style={styles.btnOutlineSm} onPress={() => openBatteryFor(v)}>
                    <Feather name="battery-charging" size={14} />
                    <Text>  Battery</Text>
                  </Pressable>
                </View>
              </View>

              {/* Actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8, marginTop: 10 }]}>
                {v.status === "Issue" ? (
                  <Pressable style={styles.btnOutlineSm} onPress={() => clearIssue(v.id)}>
                    <Feather name="check-circle" size={14} />
                    <Text>  Resolve</Text>
                  </Pressable>
                ) : (
                  <Pressable style={styles.btnOutlineSm} onPress={() => markIssue(v)}>
                    <Feather name="alert-triangle" size={14} />
                    <Text>  Report Issue</Text>
                  </Pressable>
                )}

                <Pressable style={styles.btnOutlineSm} onPress={() => openServiceFor(v)}>
                  <Feather name="clock" size={14} />
                  <Text>  Service</Text>
                </Pressable>

                <Pressable
                  style={[styles.btnOutlineSm, { borderColor: "#ef4444" }]}
                  onPress={() => openRemoveFor(v)}
                >
                  <Feather name="trash-2" size={14} color="#ef4444" />
                  <Text style={{ color: "#ef4444" }}>  Remove</Text>
                </Pressable>
              </View>
            </View>
          );
        })}
      </View>

      {/* ===================== Add Vehicle Modal ===================== */}
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
                    onChange={(v) => setInitialStatus(v as VehicleStatus)}
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
              <SolidButton onPress={addVehicle} disabled={!regNo.trim()}>
                <Text style={[styles.btnSolidText, { color: "#111" }]}>Add Vehicle</Text>
              </SolidButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== Add Battery (Global) Modal ===================== */}
      <Modal
        transparent
        visible={openAddBattery}
        animationType="slide"
        onRequestClose={() => setOpenAddBattery(false)}
      >
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="battery-charging" size={18} />
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Add New Battery</Text>
            </View>

            {field("Battery IMEI Number", (
              <TextInput
                value={newBatIMEI}
                onChangeText={setNewBatIMEI}
                placeholder="e.g., 356938035643899"
                style={styles.input}
              />
            ))}

            {field("Battery Type", (
              <Segmented
                options={["Lithium-ion 48V", "Lithium-ion 60V", "Lead Acid 48V", "Lead Acid 60V"]}
                value={newBatType}
                onChange={(v) => setNewBatType(v as Battery["type"])}
              />
            ))}

            {field("Battery Capacity", (
              <TextInput
                value={newBatCapacity}
                onChangeText={setNewBatCapacity}
                placeholder="e.g., 20Ah"
                style={styles.input}
              />
            ))}

            {field("Installation Date", (
              <TextInput
                value={newBatInstallDate}
                onChangeText={setNewBatInstallDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
            ))}

            {field("Battery Status", (
              <Segmented
                options={["Active", "Maintenance", "Faulty"]}
                value={newBatStatus}
                onChange={(v) => setNewBatStatus(v as Battery["status"])}
              />
            ))}

            <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenAddBattery(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <SolidButton
                onPress={addBatteryGlobally}
                disabled={!newBatIMEI || !newBatType || !newBatStatus}
              >
                <Text style={[styles.btnSolidText, { color: "#111" }]}>Add Battery</Text>
              </SolidButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== Report Issue Modal ===================== */}
      <Modal transparent visible={openIssue} animationType="slide" onRequestClose={() => setOpenIssue(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Report Vehicle Issue</Text>
              <Text style={styles.subtleSmall}>Vehicle: {activeVehicle?.registrationNo ?? "-"}</Text>
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
              <SolidButton onPress={submitIssue} disabled={!issueType}>
                <Text style={[styles.btnSolidText, { color: "#111" }]}>Report Issue</Text>
              </SolidButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== Battery Management Modal ===================== */}
      <Modal transparent visible={openBattery} animationType="slide" onRequestClose={() => setOpenBattery(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="battery-charging" size={18} />
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Battery Management</Text>
            </View>
            <Text style={styles.subtleSmall}>Vehicle: {activeVehicle?.registrationNo ?? "-"}</Text>

            {/* Current battery (if any) */}
            {activeVehicle &&
              (() => {
                const b = batteries.find((x) => x.vehicleId === activeVehicle.id);
                if (!b) return null;
                return (
                  <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Current Battery</Text>
                    <Text style={styles.infoText}>IMEI: {b.imei}</Text>
                    <Text style={styles.infoText}>Type: {b.type}</Text>
                    <Text style={styles.infoText}>Capacity: {b.capacity}</Text>
                    <Text style={styles.infoText}>Status: {b.status}</Text>
                  </View>
                );
              })()}

            {/* Choose an existing unassigned battery (optional helper) */}
            {unassignedBatteries.length > 0 && (
              <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>Assign Existing Battery</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {unassignedBatteries.map((b) => {
                      const active = pickExistingIMEI === b.imei;
                      return (
                        <Pressable
                          key={b.id}
                          onPress={() => {
                            if (active) {
                              setPickExistingIMEI("");
                            } else {
                              setPickExistingIMEI(b.imei);
                              // Pre-fill fields
                              setBatIMEI(b.imei);
                              setBatType(b.type);
                              setBatCapacity(b.capacity || "");
                              setBatInstallDate(b.installationDate || "");
                              setBatStatus(b.status);
                            }
                          }}
                          style={[styles.btnOutlineSm, active && { backgroundColor: "#111827" }]}
                        >
                          <Feather name="battery" size={14} color={active ? "#fff" : "#111"} />
                          <Text style={[{ marginLeft: 6 }, active && { color: "#fff" }]}>{b.imei}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </ScrollView>
                <Text style={styles.subtleSmall}>(Tap an IMEI to pre-fill & assign it to this vehicle)</Text>
              </View>
            )}

            {field("Battery IMEI Number", (
              <TextInput
                value={batIMEI}
                onChangeText={setBatIMEI}
                placeholder="e.g., 356938035643809"
                style={styles.input}
              />
            ))}

            {field("Battery Type", (
              <Segmented
                options={["Lithium-ion 48V", "Lithium-ion 60V", "Lead Acid 48V", "Lead Acid 60V"]}
                value={batType}
                onChange={(v) => setBatType(v as Battery["type"])}
              />
            ))}

            {field("Battery Capacity", (
              <TextInput
                value={batCapacity}
                onChangeText={setBatCapacity}
                placeholder="e.g., 20Ah"
                style={styles.input}
              />
            ))}

            {field("Installation Date", (
              <TextInput
                value={batInstallDate}
                onChangeText={setBatInstallDate}
                placeholder="YYYY-MM-DD"
                style={styles.input}
              />
            ))}

            {field("Battery Status", (
              <Segmented
                options={["Active", "Maintenance", "Faulty"]}
                value={batStatus}
                onChange={(v) => setBatStatus(v as Battery["status"])}
              />
            ))}

            <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenBattery(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <SolidButton
                onPress={submitBattery}
                disabled={!batIMEI || !batType || !batStatus}
              >
                <Text style={[styles.btnSolidText, { color: "#111" }]}>
                  {activeVehicle && batteries.find((b) => b.vehicleId === activeVehicle.id)
                    ? "Update Battery"
                    : "Add Battery"}
                </Text>
              </SolidButton>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== Service Records Modal ===================== */}
      <Modal transparent visible={openService} animationType="slide" onRequestClose={() => setOpenService(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="clock" size={18} />
              <Text style={{ fontSize: 18, fontWeight: "800" }}>Service Records</Text>
            </View>
            <Text style={styles.subtleSmall}>Vehicle: {activeVehicle?.registrationNo ?? "-"}</Text>

            <View style={{ gap: 8 }}>
              {activeVehicle &&
              serviceRecords.filter((s) => s.vehicleId === activeVehicle.id).length > 0 ? (
                serviceRecords
                  .filter((s) => s.vehicleId === activeVehicle.id)
                  .map((rec) => (
                    <View key={rec.id} style={styles.serviceRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.serviceTitle}>{rec.date} • {rec.type}</Text>
                        <Text style={styles.subtleSmall}>{rec.description}</Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={styles.serviceCost}>₹{rec.cost.toLocaleString()}</Text>
                        <Text style={styles.subtleSmall}>{rec.mechanic}</Text>
                      </View>
                    </View>
                  ))
              ) : (
                <Text style={[styles.subtleSmall, { textAlign: "center", paddingVertical: 10 }]}>
                  No service records found for this vehicle
                </Text>
              )}
            </View>

            <View style={[styles.row, { justifyContent: "flex-end" }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenService(false)}>
                <Text>Close</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===================== Remove Vehicle Modal ===================== */}
      <Modal transparent visible={openRemove} animationType="fade" onRequestClose={() => setOpenRemove(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, width: "100%" }]}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="trash-2" size={18} color="#ef4444" />
              <Text style={{ fontSize: 18, fontWeight: "800", color: "#ef4444" }}>
                Remove Vehicle
              </Text>
            </View>
            <Text style={styles.subtleSmall}>
              Are you sure you want to remove vehicle {activeVehicle?.registrationNo}? This action cannot be undone.
            </Text>

            <View style={[styles.row, { justifyContent: "flex-end", gap: 8 }]}>
              <Pressable style={styles.btnOutline} onPress={() => setOpenRemove(false)}>
                <Text>Cancel</Text>
              </Pressable>
              <Pressable style={styles.btnDanger} onPress={confirmRemove}>
                <Text style={styles.btnSolidText}>Remove Vehicle</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ===================== Small UI bits ===================== */
function AssignMenu({
  riders,
  onPick,
}: {
  riders: Rider[];
  onPick: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return open ? (
    <View style={styles.assignMenu}>
      {riders.map((r) => (
        <Pressable
          key={r.id}
          style={styles.assignRow}
          onPress={() => {
            onPick(r.name);
            setOpen(false);
          }}
        >
          <Feather name="user-plus" size={14} />
          <Text>  {r.name}</Text>
        </Pressable>
      ))}
      <Pressable
        style={[styles.assignRow, { borderTopWidth: 1, borderColor: "#e5e7eb" }]}
        onPress={() => setOpen(false)}
      >
        <Feather name="x" size={14} />
        <Text>  Close</Text>
      </Pressable>
    </View>
  ) : (
    <Pressable style={styles.btnOutlineSm} onPress={() => setOpen(true)}>
      <Feather name="user-plus" size={14} />
      <Text>  Assign Rider</Text>
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
      {options.map((opt) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.segmentBtn, active && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/* ===================== Styles ===================== */
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

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, fontWeight: "700" },

  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  // Buttons (btnSolid now used as the gradient container)
  btnSolid: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnSolidText: { fontWeight: "700" },
  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  btnDanger: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnOutlineSm: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#fff",
  },

  // Segmented
  segmented: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  segmentBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  segmentBtnActive: { backgroundColor: "#111827" },
  segmentText: { fontWeight: "700", color: "#111827" },
  segmentTextActive: { color: "#fff" },

  // Assign menu
  assignMenu: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  assignRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 10 },

  // Info box
  infoBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 12,
  },
  infoTitle: { fontWeight: "700", marginBottom: 4, color: "#111827" },
  infoText: { color: "#374151", fontSize: 12 },

  // Modal backdrop
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },

  // Service row
  serviceRow: {
    borderWidth: 1,
    borderColor: "#eceff3",
    borderRadius: 12,
    padding: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    gap: 10,
  },
  serviceTitle: { fontWeight: "800", color: "#111827" },
  serviceCost: { fontWeight: "800", color: "#111827" },
});
