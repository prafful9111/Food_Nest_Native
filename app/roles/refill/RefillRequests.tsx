// app/features/refill/RefillRequests.tsx (Expo / React Native)

import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- Types ---------- */
type Priority = "high" | "medium" | "low";
type Status = "assigned" | "in-progress" | "delivered" | "rejected";

interface Request {
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
  urgencyReason: string;
  assignedBy?: string;
  cookInstructions?: string;
  deliveredAt?: string;
  startedAt?: string;
}

/* ---------- Tiny UI primitives ---------- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({
  children,
  style,
  outline,
}: {
  children: React.ReactNode;
  style?: any;
  outline?: boolean;
}) {
  return (
    <View
      style={[
        styles.badge,
        outline && styles.badgeOutline,
        style,
      ]}
    >
      <Text style={[styles.badgeText, outline && { color: "#111827" }]}>{children}</Text>
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
    default:
      return { bg: "#dcfce7", fg: "#166534" }; // green
  }
};
const statusColors = (s: Status) => {
  switch (s) {
    case "assigned":
      return { bg: "#fef3c7", fg: "#92400e" }; // amber
    case "in-progress":
      return { bg: "#dbeafe", fg: "#1e40af" }; // blue
    case "delivered":
      return { bg: "#dcfce7", fg: "#166534" }; // green
    case "rejected":
      return { bg: "#fee2e2", fg: "#991b1b" }; // red
    default:
      return { bg: "#f3f4f6", fg: "#374151" };
  }
};

/* ---------- Screen ---------- */
export default function RefillRequestsScreen() {
  const [requests, setRequests] = useState<Request[]>([
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
      status: "assigned",
      urgencyReason: "Completely out of stock, customers waiting",
      assignedBy: "Chef Sarah",
      cookInstructions: "Urgent priority - rider has customers waiting",
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
      status: "assigned",
      urgencyReason: "Running very low, need refill soon",
      assignedBy: "Chef Sarah",
      cookInstructions: "Normal priority refill",
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
      status: "delivered",
      urgencyReason: "Out of stock, high demand area",
      assignedBy: "Chef Sarah",
      deliveredAt: "2024-01-20 12:30 PM",
    },
  ]);

  const handleStartDelivery = (requestId: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "in-progress", startedAt: new Date().toLocaleString() }
          : r
      )
    );
    Alert.alert("Delivery Started", "You have started the delivery process.");
  };

  const handleCompleteDelivery = (requestId: number) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, status: "delivered", deliveredAt: new Date().toLocaleString() }
          : r
      )
    );
    Alert.alert("Delivery Completed", "Refill delivered to rider.");
  };

  const handleRejectRequest = (requestId: number) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: "rejected" } : r))
    );
    Alert.alert("Request Rejected", "Refill request has been rejected.");
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={{ marginBottom: 8 }}>
        <Text style={styles.h1}>Assigned Refill Requests</Text>
        <Text style={styles.subtle}>Deliver refill requests assigned by cooks to riders</Text>
      </View>

      <View style={{ gap: 12 }}>
        {requests.map((request) => {
          const pc = priorityColors(request.priority);
          const sc = statusColors(request.status);

          return (
            <Card key={request.id}>
              <View style={styles.topRow}>
                {/* Left: info */}
                <View style={{ flex: 1, gap: 8 }}>
                  {/* Title + badges */}
                  <View style={styles.titleRow}>
                    <Text style={styles.title}>{request.rider}</Text>
                    <Badge outline>
                      <Text style={styles.badgeOutlineText}>{request.riderId}</Text>
                    </Badge>
                    <Badge style={{ backgroundColor: pc.bg }}>
                      <Text style={{ color: pc.fg, fontWeight: "700" }}>
                        {request.priority} priority
                      </Text>
                    </Badge>
                    <Badge style={{ backgroundColor: sc.bg }}>
                      <Text style={{ color: sc.fg, fontWeight: "700" }}>{request.status}</Text>
                    </Badge>
                  </View>

                  {/* Meta grid */}
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

                  {/* Stock */}
                  <Text style={styles.metaText}>
                    <Text style={{ color: "#6b7280" }}>Current Stock: </Text>
                    <Text
                      style={{
                        color: request.currentStock <= 5 ? "#b91c1c" : "#16a34a",
                        fontWeight: request.currentStock <= 5 ? "700" : "400",
                      }}
                    >
                      {request.currentStock} units
                    </Text>
                  </Text>

                  {/* Optional fields */}
                  {!!request.urgencyReason && (
                    <Text style={[styles.metaText, { fontStyle: "italic" }]}>
                      <Text style={{ color: "#6b7280", fontStyle: "normal" }}>Reason: </Text>
                      {request.urgencyReason}
                    </Text>
                  )}
                  {!!request.assignedBy && (
                    <Text style={styles.metaText}>
                      <Text style={{ color: "#6b7280" }}>Assigned by: </Text>
                      <Text style={{ fontWeight: "600" }}>{request.assignedBy}</Text>
                    </Text>
                  )}
                  {!!request.cookInstructions && (
                    <Text style={[styles.metaText, { fontStyle: "italic" }]}>
                      <Text style={{ color: "#6b7280", fontStyle: "normal" }}>Instructions: </Text>
                      {request.cookInstructions}
                    </Text>
                  )}
                  {request.status === "delivered" && !!request.deliveredAt && (
                    <Text style={styles.metaText}>
                      <Text style={{ color: "#6b7280" }}>Delivered at: </Text>
                      {request.deliveredAt}
                    </Text>
                  )}
                  {request.status === "in-progress" && !!request.startedAt && (
                    <Text style={styles.metaText}>
                      <Text style={{ color: "#6b7280" }}>Started at: </Text>
                      {request.startedAt}
                    </Text>
                  )}
                </View>

                {/* Right: actions */}
                <View style={styles.actionsCol}>
                  {request.status === "assigned" && (
                    <>
                      <Pressable
                        onPress={() => handleStartDelivery(request.id)}
                        style={({ pressed }) => [
                          styles.btnPrimary,
                          pressed && { opacity: 0.9 },
                        ]}
                      >
                        <Text style={styles.btnPrimaryText}>Start Delivery</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => handleRejectRequest(request.id)}
                        style={({ pressed }) => [
                          styles.iconBtnDestructive,
                          pressed && { opacity: 0.85 },
                        ]}
                        accessibilityLabel="Reject request"
                      >
                        <Feather name="x" size={16} color="#fff" />
                      </Pressable>
                    </>
                  )}

                  {request.status === "in-progress" && (
                    <Pressable
                      onPress={() => handleCompleteDelivery(request.id)}
                      style={({ pressed }) => [
                        styles.btnOutline,
                        pressed && { opacity: 0.9 },
                      ]}
                    >
                      <Feather name="check-circle" size={16} color="#111827" />
                      <Text style={styles.btnOutlineText}>Mark Delivered</Text>
                    </Pressable>
                  )}

                  {request.status === "delivered" && (
                    <Badge style={{ backgroundColor: "#dcfce7" }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                        <Feather name="check-circle" size={14} color="#166534" />
                        <Text style={{ color: "#166534", fontWeight: "700" }}>Delivered</Text>
                      </View>
                    </Badge>
                  )}
                </View>
              </View>
            </Card>
          );
        })}
      </View>
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

  metaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 2 },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaText: { color: "#374151", fontSize: 12 },

  /* badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
  },
  badgeText: { fontSize: 12, color: "#fff" },
  badgeOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  badgeOutlineText: { fontSize: 12, color: "#111827" },

  actionsCol: { alignItems: "flex-end", gap: 8 },

  btnPrimary: {
    backgroundColor: "#111827",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
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

  iconBtnDestructive: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#dc2626",
  },
});
