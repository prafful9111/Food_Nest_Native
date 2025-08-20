// app/features/refill/CookCoordination.tsx (Expo / React Native)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { MaterialCommunityIcons as MCI } from "@expo/vector-icons";

/* ---------- Types ---------- */
type CookStatus = "active" | "break" | "offline";
type Workload = "high" | "medium" | "low";
type Priority = "high" | "medium" | "low";

interface Task {
  item: string;
  quantity: number;
  estimatedTime: string;
  priority: Priority;
}
interface Cook {
  id: string;
  name: string;
  status: CookStatus;
  currentTasks: Task[];
  workload: Workload;
  shiftEnd: string;
  location: string;
  lastActive: string;
}
interface PendingRequest {
  id: number;
  item: string;
  quantity: number;
  assignedTo: string;
  priority: Priority;
  estimatedCompletion: string;
  notes?: string;
  status: "pending" | "in-progress";
}
interface Message {
  id: number;
  from: string;
  message: string;
  time: string;
  type: "update" | "request" | "completion";
}

/* ---------- Data (mock) ---------- */
const cooksStatus: Cook[] = [
  {
    id: "C001",
    name: "Chef Kumar",
    status: "active",
    currentTasks: [
      { item: "Vada Pav", quantity: 25, estimatedTime: "15 mins", priority: "high" },
      { item: "Chai", quantity: 30, estimatedTime: "10 mins", priority: "medium" },
    ],
    workload: "high",
    shiftEnd: "6:00 PM",
    location: "Kitchen A",
    lastActive: "2 mins ago",
  },
  {
    id: "C002",
    name: "Chef Priya",
    status: "active",
    currentTasks: [{ item: "Poha", quantity: 20, estimatedTime: "12 mins", priority: "medium" }],
    workload: "medium",
    shiftEnd: "5:30 PM",
    location: "Kitchen B",
    lastActive: "1 min ago",
  },
  {
    id: "C003",
    name: "Chef Ahmed",
    status: "break",
    currentTasks: [],
    workload: "low",
    shiftEnd: "7:00 PM",
    location: "Kitchen A",
    lastActive: "15 mins ago",
  },
  {
    id: "C004",
    name: "Chef Maria",
    status: "active",
    currentTasks: [
      { item: "Water Bottle", quantity: 50, estimatedTime: "5 mins", priority: "low" },
      { item: "Poha", quantity: 15, estimatedTime: "8 mins", priority: "high" },
    ],
    workload: "high",
    shiftEnd: "6:30 PM",
    location: "Kitchen B",
    lastActive: "just now",
  },
];

const pendingRequests: PendingRequest[] = [
  {
    id: 1,
    item: "Vada Pav",
    quantity: 30,
    assignedTo: "Chef Kumar",
    priority: "high",
    estimatedCompletion: "3:45 PM",
    notes: "For downtown route - high demand area",
    status: "in-progress",
  },
  {
    id: 2,
    item: "Chai",
    quantity: 40,
    assignedTo: "Chef Priya",
    priority: "medium",
    estimatedCompletion: "4:00 PM",
    notes: "Regular restock",
    status: "pending",
  },
];

const messages: Message[] = [
  { id: 1, from: "Chef Kumar", message: "Vada Pav batch ready - 25 units available for pickup", time: "2 mins ago", type: "update" },
  { id: 2, from: "Coordinator", message: "Need urgent Poha preparation - downtown route running low", time: "5 mins ago", type: "request" },
  { id: 3, from: "Chef Maria", message: "Water bottle restock completed - 50 units ready", time: "8 mins ago", type: "completion" },
];

const foodItems = ["Poha", "Vada Pav", "Chai", "Water Bottle"];

/* ---------- Tiny UI primitives ---------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.badge, style]}>{children}</View>;
}

/* ---------- Color helpers ---------- */
const statusBadge = (s: CookStatus) => {
  switch (s) {
    case "active":
      return { bg: "#dcfce7", fg: "#166534" };
    case "break":
      return { bg: "#fef3c7", fg: "#92400e" };
    case "offline":
    default:
      return { bg: "#f3f4f6", fg: "#374151" };
  }
};
const workloadBadge = (w: Workload) => {
  switch (w) {
    case "high":
      return { bg: "#fee2e2", fg: "#991b1b" };
    case "medium":
      return { bg: "#fef3c7", fg: "#92400e" };
    case "low":
    default:
      return { bg: "#dcfce7", fg: "#166534" };
  }
};
const priorityBadge = (p: Priority) => {
  switch (p) {
    case "high":
      return { bg: "#fee2e2", fg: "#991b1b" };
    case "medium":
      return { bg: "#fef3c7", fg: "#92400e" };
    case "low":
    default:
      return { bg: "#dcfce7", fg: "#166534" };
  }
};

/* ---------- Screen ---------- */
export default function CookCoordinationScreen() {
  const [reqOpen, setReqOpen] = useState(false);
  const [newRequest, setNewRequest] = useState({
    cook: "",
    item: "",
    quantity: "",
    priority: "" as Priority | "",
    notes: "",
  });

  const canSubmit =
    newRequest.cook.trim() && newRequest.item.trim() && parseInt(newRequest.quantity || "0", 10) > 0;

  const handleSendRequest = () => {
    if (!canSubmit) {
      Alert.alert("Missing info", "Please fill in Cook, Item, and Quantity.");
      return;
    }
    const cookName = cooksStatus.find((c) => c.id === newRequest.cook)?.name ?? "Cook";
    Alert.alert("Request Sent", `Production request sent to ${cookName}.`);
    setNewRequest({ cook: "", item: "", quantity: "", priority: "", notes: "" });
    setReqOpen(false);
  };

  const onMessageCook = (cookName: string) =>
    Alert.alert("Message", `Open chat with ${cookName} (not wired).`);
  const onCheckStatus = (id: number) =>
    Alert.alert("Check Status", `Checking progress for request #${id} (not wired).`);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.page}>
        {/* Header (no inline button now) */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.h1}>Cook Coordination</Text>
            <Text style={styles.subtle}>
              Coordinate with kitchen staff and manage production requests
            </Text>
          </View>
        </View>

        {/* Kitchen Staff Status */}
        <Card>
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>Kitchen Staff Status</Text>
            <Text style={styles.sectionDesc}>Real-time cook availability and workload</Text>
          </View>

          <View style={{ gap: 12 }}>
            {cooksStatus.map((cook) => {
              const sc = statusBadge(cook.status);
              const wc = workloadBadge(cook.workload);
              return (
                <View key={cook.id} style={styles.cookCard}>
                  <View style={styles.cookTopRow}>
                    <View style={styles.cookLeft}>
                      <MCI name="chef-hat" size={20} color="#111827" />
                      <View>
                        <Text style={styles.cookName}>{cook.name}</Text>
                        <Text style={styles.cookMeta}>{cook.location}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <Badge style={{ backgroundColor: sc.bg }}>
                        <Text style={[styles.badgeText, { color: sc.fg }]}>{cook.status}</Text>
                      </Badge>
                      <Badge style={{ backgroundColor: wc.bg }}>
                        <Text style={[styles.badgeText, { color: wc.fg }]}>{cook.workload}</Text>
                      </Badge>
                    </View>
                  </View>

                  {cook.currentTasks.length > 0 && (
                    <View style={{ gap: 6 }}>
                      <Text style={styles.smallBold}>Current Tasks:</Text>
                      {cook.currentTasks.map((t, i) => {
                        const pc = priorityBadge(t.priority);
                        return (
                          <View key={i} style={styles.taskRow}>
                            <Text style={styles.taskMain}>
                              {t.quantity}x {t.item}
                            </Text>
                            <View style={styles.taskRight}>
                              <Badge style={{ backgroundColor: pc.bg }}>
                                <Text style={[styles.badgeText, { color: pc.fg }]}>{t.priority}</Text>
                              </Badge>
                              <Text style={styles.cookMeta}>{t.estimatedTime}</Text>
                            </View>
                          </View>
                        );
                      })}
                    </View>
                  )}

                  <View style={styles.cookFooter}>
                    <Text style={styles.footerText}>Shift ends: {cook.shiftEnd}</Text>
                    <Text style={styles.footerText}>Last seen: {cook.lastActive}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card>

        {/* Communication */}
        <Card>
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>Communication</Text>
            <Text style={styles.sectionDesc}>Recent messages and updates from kitchen</Text>
          </View>

          <View style={{ gap: 8 }}>
            {messages.map((m) => (
              <View key={m.id} style={styles.msgCard}>
                <View style={styles.msgHeader}>
                  <Feather name="message-square" size={14} color="#111827" />
                  <Text style={styles.msgFrom}>{m.from}</Text>
                  <Text style={styles.msgTime}>{m.time}</Text>
                </View>
                <Text style={styles.msgBody}>{m.message}</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Active Production Requests */}
        <Card>
          <View style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>Active Production Requests</Text>
            <Text style={styles.sectionDesc}>Track ongoing and pending production requests</Text>
          </View>

          <View style={{ gap: 10 }}>
            {pendingRequests.map((r) => {
              const pc = priorityBadge(r.priority);
              return (
                <View key={r.id} style={styles.reqRow}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.reqTopLine}>
                      <Text style={styles.reqTitle}>
                        {r.quantity}x {r.item}
                      </Text>
                      <Badge style={{ backgroundColor: pc.bg }}>
                        <Text style={[styles.badgeText, { color: pc.fg }]}>{r.priority}</Text>
                      </Badge>
                      <Badge style={styles.badgeOutline}>
                        <Text style={styles.badgeOutlineText}>{r.status}</Text>
                      </Badge>
                    </View>
                    <Text style={styles.reqMeta}>Assigned to: {r.assignedTo}</Text>
                    <Text style={styles.reqMeta}>Expected completion: {r.estimatedCompletion}</Text>
                    {!!r.notes && <Text style={styles.reqMeta}>Notes: {r.notes}</Text>}
                  </View>

                  <View style={{ gap: 8, alignItems: "flex-end" }}>
                    <Pressable
                      onPress={() => onMessageCook(r.assignedTo)}
                      style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.9 }]}
                    >
                      <Feather name="message-square" size={14} color="#111827" />
                      <Text style={styles.btnOutlineText}>Message Cook</Text>
                    </Pressable>
                    {r.status === "in-progress" && (
                      <Pressable
                        onPress={() => onCheckStatus(r.id)}
                        style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.9 }]}
                      >
                        <Feather name="clock" size={14} color="#fff" />
                        <Text style={styles.btnPrimaryText}>Check Status</Text>
                      </Pressable>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </Card>
      </ScrollView>

      {/* Floating Action Button */}
      <Pressable
        onPress={() => setReqOpen(true)}
        style={({ pressed }) => [styles.fab, pressed && { opacity: 0.9 }]}
        accessibilityRole="button"
        accessibilityLabel="Create new production request"
      >
        <Feather name="send" size={20} color="#fff" />
      </Pressable>

      {/* New Request Modal */}
      <Modal visible={reqOpen} animationType="slide" transparent onRequestClose={() => setReqOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setReqOpen(false)} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Send Production Request</Text>
          <Text style={styles.modalDesc}>Send a new production request to kitchen staff</Text>

          {/* Assign to Cook */}
          <View style={{ marginTop: 12, gap: 8 }}>
            <Text style={styles.label}>Assign to Cook</Text>
            <View style={styles.selectBox}>
              {cooksStatus
                .filter((c) => c.status === "active")
                .map((c) => {
                  const active = newRequest.cook === c.id;
                  return (
                    <Pressable
                      key={c.id}
                      onPress={() => setNewRequest((p) => ({ ...p, cook: c.id }))}
                      style={({ pressed }) => [
                        styles.selectRow,
                        active && styles.selectRowActive,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <View style={[styles.radio, active && styles.radioActive]} />
                      <Text style={[styles.selectText, active && { fontWeight: "700" }]}>
                        {c.name} — {c.workload} workload
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          </View>

          {/* Food Item */}
          <View style={{ marginTop: 12, gap: 8 }}>
            <Text style={styles.label}>Food Item</Text>
            <View style={styles.selectBox}>
              {foodItems.map((item) => {
                const active = newRequest.item === item;
                return (
                  <Pressable
                    key={item}
                    onPress={() => setNewRequest((p) => ({ ...p, item }))}
                    style={({ pressed }) => [
                      styles.selectRow,
                      active && styles.selectRowActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <View style={[styles.radio, active && styles.radioActive]} />
                    <Text style={[styles.selectText, active && { fontWeight: "700" }]}>{item}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Quantity */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={styles.label}>Quantity</Text>
            <TextInput
              value={newRequest.quantity}
              onChangeText={(t) => setNewRequest((p) => ({ ...p, quantity: t.replace(/[^\d]/g, "") }))}
              keyboardType="number-pad"
              inputMode="numeric"
              placeholder="Enter quantity"
              placeholderTextColor="#9ca3af"
              style={styles.input}
            />
          </View>

          {/* Priority */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={styles.label}>Priority</Text>
            <View style={styles.segment}>
              {(["high", "medium", "low"] as Priority[]).map((opt) => {
                const active = newRequest.priority === opt;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setNewRequest((p) => ({ ...p, priority: opt }))}
                    style={[styles.segmentItem, active && styles.segmentItemActive]}
                  >
                    <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Notes */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              value={newRequest.notes}
              onChangeText={(t) => setNewRequest((p) => ({ ...p, notes: t }))}
              placeholder="Additional instructions or context"
              placeholderTextColor="#9ca3af"
              style={[styles.input, { height: 96, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          {/* Submit */}
          <Pressable
            onPress={handleSendRequest}
            disabled={!canSubmit}
            style={[
              styles.btnPrimary,
              { marginTop: 16, alignSelf: "stretch", justifyContent: "center" },
              !canSubmit && { backgroundColor: "#9ca3af" },
            ]}
          >
            <Text style={styles.btnPrimaryText}>Send Request</Text>
          </Pressable>

          <Pressable onPress={() => setReqOpen(false)} style={styles.modalClose}>
            <Feather name="x" size={18} color="#6b7280" />
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: {
    padding: 16,
    paddingBottom: 96, // extra space so FAB doesn't cover content
    backgroundColor: "#f9fafb",
    gap: 12,
  },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  /* Card */
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
    gap: 8,
  },

  /* Section headings */
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: 0.2,
  },
  sectionDesc: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },

  /* Cook list */
  cookCard: { backgroundColor: "#f3f4f6", padding: 10, borderRadius: 10, gap: 8 },
  cookTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cookLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  cookName: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cookMeta: { color: "#6b7280", fontSize: 12 },
  smallBold: { fontSize: 12, fontWeight: "700", color: "#111827" },
  taskRow: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  taskMain: { fontSize: 13, fontWeight: "600", color: "#111827" },
  taskRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  cookFooter: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { color: "#6b7280", fontSize: 11 },

  /* Messages */
  msgCard: { backgroundColor: "#f3f4f6", padding: 10, borderRadius: 10, gap: 4 },
  msgHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  msgFrom: { fontSize: 12, fontWeight: "700", color: "#111827" },
  msgTime: { fontSize: 11, color: "#6b7280", marginLeft: "auto" },
  msgBody: { fontSize: 13, color: "#111827" },

  /* Requests */
  reqRow: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reqTopLine: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  reqTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  reqMeta: { color: "#6b7280", fontSize: 12 },

  /* Badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, color: "#111827" },
  badgeOutline: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "transparent",
  },
  badgeOutlineText: { fontSize: 12, color: "#111827" },

  /* Buttons */
  btnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },

  btnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  btnOutlineText: { color: "#111827", fontWeight: "800" },

  /* FAB */
  fab: {
    position: "absolute",
    right: 16,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 6, // Android
    shadowColor: "#000", // iOS
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },

  /* Modal */
  backdrop: {
    position: "absolute",
    top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    marginTop: "auto",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  modalTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },
  modalDesc: { color: "#6b7280", fontSize: 12 },

  label: { fontSize: 12, fontWeight: "700", color: "#1f2937" },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    fontSize: 14,
    color: "#111827",
  },

  /* Select/radio list */
  selectBox: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" },
  selectRow: { paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", gap: 10 },
  selectRowActive: { backgroundColor: "#f3f4f6" },
  selectText: { fontSize: 14, color: "#111827" },
  radio: { width: 16, height: 16, borderRadius: 999, borderWidth: 2, borderColor: "#9ca3af" },
  radioActive: { borderColor: "#111827", backgroundColor: "#111827" },

  /* Segmented control */
  segment: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 10, padding: 4, gap: 6 },
  segmentItem: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8 },
  segmentItemActive: { backgroundColor: "#111827" },
  segmentText: { fontSize: 12, fontWeight: "700", color: "#374151" },
  segmentTextActive: { color: "#fff" },

  modalClose: { position: "absolute", right: 12, top: 12, padding: 6, borderRadius: 8 },
});
