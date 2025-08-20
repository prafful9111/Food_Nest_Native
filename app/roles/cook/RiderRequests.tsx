// app/features/supervisor/RiderRequests.tsx (Expo / React Native)

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

type Priority = "high" | "medium" | "low";
type Status = "pending" | "forwarded" | "rejected";

interface RequestItem {
  id: number;
  rider: string;
  riderId: string;
  item: string;
  quantity: number;
  currentStock: number;
  location: string;
  requestTime: string;
  priority: Priority;
  status: Status;
  reason?: string;
  assignedCoordinator?: string;
}

interface Coordinator {
  id: string;
  name: string;
}

/* ---------- Tiny UI primitives ---------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({
  label,
  bg,
  fg,
  outline,
}: {
  label: string;
  bg?: string;
  fg?: string;
  outline?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        outline && { borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "transparent" },
        bg && { backgroundColor: bg },
      ]}
    >
      <Text style={[styles.badgeText, fg && { color: fg }]}>{label}</Text>
    </View>
  );
}

/* ---------- Helpers ---------- */
const priorityColors = (p: Priority) => {
  switch (p) {
    case "high":
      return { bg: "#fee2e2", fg: "#991b1b" }; // red
    case "medium":
      return { bg: "#fef3c7", fg: "#92400e" }; // amber
    case "low":
      return { bg: "#dcfce7", fg: "#166534" }; // green
    default:
      return { bg: "#f3f4f6", fg: "#374151" };
  }
};
const statusColors = (s: Status) => {
  switch (s) {
    case "pending":
      return { bg: "#fef3c7", fg: "#92400e" }; // amber
    case "forwarded":
      return { bg: "#dbeafe", fg: "#1e40af" }; // blue
    case "rejected":
      return { bg: "#fee2e2", fg: "#991b1b" }; // red
    default:
      return { bg: "#f3f4f6", fg: "#374151" };
  }
};

/* ---------- Screen ---------- */
export default function RiderRequestsScreen() {
  const [requests, setRequests] = useState<RequestItem[]>([
    {
      id: 1,
      rider: "Mike Thompson",
      riderId: "R001",
      item: "Vada Pav",
      quantity: 15,
      currentStock: 0,
      location: "Downtown Route A",
      requestTime: "2024-01-20 10:30 AM",
      priority: "high",
      status: "pending",
      reason: "Completely out of stock, customers waiting",
    },
    {
      id: 2,
      rider: "Sarah Wilson",
      riderId: "R002",
      item: "Poha",
      quantity: 10,
      currentStock: 2,
      location: "Business District Route B",
      requestTime: "2024-01-20 10:45 AM",
      priority: "medium",
      status: "pending",
      reason: "Running very low, need refill soon",
    },
    {
      id: 3,
      rider: "David Chen",
      riderId: "R003",
      item: "Chai",
      quantity: 20,
      currentStock: 0,
      location: "University Route C",
      requestTime: "2024-01-20 11:00 AM",
      priority: "high",
      status: "forwarded",
      reason: "Out of stock, high demand area",
    },
  ]);

  const coordinators: Coordinator[] = [
    { id: "RC001", name: "Alex Martinez" },
    { id: "RC002", name: "Lisa Rodriguez" },
    { id: "RC003", name: "James Wilson" },
  ];

  const [forwardOpen, setForwardOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [forwardCoordinator, setForwardCoordinator] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");

  const openForwardModal = (req: RequestItem) => {
    setSelectedRequest(req);
    setForwardCoordinator("");
    setInstructions("");
    setForwardOpen(true);
  };
  const closeForwardModal = () => setForwardOpen(false);

  const handleForward = () => {
    if (!selectedRequest || !forwardCoordinator) return;
    setRequests((prev) =>
      prev.map((r) =>
        r.id === selectedRequest.id
          ? { ...r, status: "forwarded", assignedCoordinator: forwardCoordinator }
          : r
      )
    );
    const name = coordinators.find((c) => c.id === forwardCoordinator)?.name ?? "Coordinator";
    setForwardOpen(false);
    setSelectedRequest(null);
    setForwardCoordinator("");
    setInstructions("");
    Alert.alert("Request Forwarded", `Forwarded to ${name}.`);
  };

  const handleReject = (requestId: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
    );
    Alert.alert("Request Rejected", "Rider request has been rejected.");
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>Rider Requests</Text>
        <Text style={styles.subtle}>Manage refill requests from riders</Text>
      </View>

      <View style={{ gap: 12 }}>
        {requests.map((request) => {
          const pc = priorityColors(request.priority);
          const sc = statusColors(request.status);
          return (
            <Card key={request.id}>
              <View style={styles.topRow}>
                <View style={{ flex: 1, gap: 8 }}>
                  {/* Title + badges */}
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{request.rider}</Text>
                    <Badge label={request.riderId} outline />
                    <Badge label={`${request.priority} priority`} bg={pc.bg} fg={pc.fg} />
                    <Badge label={request.status} bg={sc.bg} fg={sc.fg} />
                  </View>

                  {/* Metadata row */}
                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <Feather name="package" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>
                        <Text style={{ fontWeight: "700" }}>
                          {request.quantity}x {request.item}
                        </Text>
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="map-pin" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{request.location}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Feather name="clock" size={14} color="#6b7280" />
                      <Text style={styles.metaText}>{request.requestTime}</Text>
                    </View>
                  </View>

                  {/* Stock + Reason */}
                  <Text style={styles.metaText}>
                    <Text style={{ color: "#6b7280" }}>Current Stock: </Text>
                    <Text
                      style={{
                        color: request.currentStock <= 2 ? "#b91c1c" : "#16a34a",
                        fontWeight: request.currentStock <= 2 ? "700" as any : "400" as any,
                      }}
                    >
                      {request.currentStock} units
                    </Text>
                  </Text>

                  {request.reason ? (
                    <Text style={[styles.metaText, { fontStyle: "italic" }]}>
                      <Text style={{ color: "#6b7280", fontStyle: "normal" }}>Reason: </Text>
                      {request.reason}
                    </Text>
                  ) : null}
                </View>

                {/* Actions */}
                <View style={styles.actionsCol}>
                  {request.status === "pending" ? (
                    <>
                      <Pressable
                        onPress={() => openForwardModal(request)}
                        style={({ pressed }) => [
                          styles.btnPrimary,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Feather name="user" size={14} color="#fff" />
                        <Text style={styles.btnPrimaryText}>Forward to Coordinator</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleReject(request.id)}
                        style={({ pressed }) => [
                          styles.iconBtnDestructive,
                          pressed && { opacity: 0.8 },
                        ]}
                        accessibilityLabel="Reject request"
                      >
                        <Feather name="x" size={16} color="#fff" />
                      </Pressable>
                    </>
                  ) : request.status === "forwarded" ? (
                    <Badge label="Forwarded to Coordinator" bg="#1f2937" fg="#fff" />
                  ) : null}
                </View>
              </View>
            </Card>
          );
        })}
      </View>

      {/* Forward Modal */}
      <Modal
        visible={forwardOpen}
        animationType="slide"
        transparent
        onRequestClose={closeForwardModal}
      >
        <Pressable style={styles.backdrop} onPress={closeForwardModal} />
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Forward to Refill Coordinator</Text>
          <Text style={styles.modalDesc}>
            Assign this request to a refill coordinator for fulfillment
          </Text>

          {/* Select Coordinator */}
          <View style={{ marginTop: 12, gap: 8 }}>
            <Text style={styles.label}>Assign to Coordinator</Text>
            <View style={styles.selectBox}>
              {coordinators.map((c) => {
                const active = forwardCoordinator === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setForwardCoordinator(c.id)}
                    style={({ pressed }) => [
                      styles.selectRow,
                      active && styles.selectRowActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <View style={[styles.radio, active && styles.radioActive]} />
                    <Text
                      style={[
                        styles.selectText,
                        active && { fontWeight: "700" },
                      ]}
                    >
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Instructions */}
          <View style={{ marginTop: 12, gap: 6 }}>
            <Text style={styles.label}>Instructions</Text>
            <TextInput
              placeholder="Special instructions for the coordinator"
              placeholderTextColor="#9ca3af"
              value={instructions}
              onChangeText={setInstructions}
              style={[styles.input, { height: 96, textAlignVertical: "top" }]}
              multiline
            />
          </View>

          <Pressable
            onPress={handleForward}
            disabled={!forwardCoordinator}
            style={({ pressed }) => [
              styles.btnPrimary,
              { marginTop: 16 },
              (!forwardCoordinator || pressed) && { opacity: 0.85 },
              !forwardCoordinator && { backgroundColor: "#9ca3af" },
            ]}
          >
            <Text style={styles.btnPrimaryText}>Forward Request</Text>
          </Pressable>

          <Pressable onPress={closeForwardModal} style={styles.modalClose}>
            <Feather name="x" size={18} color="#6b7280" />
          </Pressable>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 28, backgroundColor: "#f9fafb", gap: 12 },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },

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

  topRow: { flexDirection: "row", gap: 12, justifyContent: "space-between" },
  titleRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  title: { fontSize: 16, fontWeight: "700", color: "#111827" },

  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 2,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#374151", fontSize: 12 },

  actionsCol: { alignItems: "flex-end", gap: 8 },

  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
  },
  badgeText: { fontSize: 12, color: "#111827" },

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

  iconBtnDestructive: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
  },

  /* Modal */
  backdrop: {
    position: "absolute",
    inset: 0 as any,
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

  selectBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    overflow: "hidden",
  },
  selectRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  selectRowActive: { backgroundColor: "#f3f4f6" },
  selectText: { fontSize: 14, color: "#111827" },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#9ca3af",
  },
  radioActive: { borderColor: "#111827", backgroundColor: "#111827" },

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

  modalClose: {
    position: "absolute",
    right: 12,
    top: 12,
    padding: 6,
    borderRadius: 8,
  },
});
