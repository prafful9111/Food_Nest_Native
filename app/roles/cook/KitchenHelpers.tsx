// app/features/cook/KitchenHelpers.tsx (Expo / React Native)

import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

type HelperStatus = "active" | "break" | "offline";
type TaskPriority = "high" | "medium" | "low";
type TaskStatus = "pending" | "in-progress" | "completed";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  status: TaskStatus;
  estimatedTime: string;
  assignedAt: string;
}

interface Helper {
  id: string;
  name: string;
  avatar: string; // URL (optional)
  email: string;
  phone: string;
  shift: string;
  status: HelperStatus;
  tasks: Task[];
}

/* ---- Mock data (parity with web) ---- */
const mockHelpers: Helper[] = [
  {
    id: "1",
    name: "Maria Santos",
    avatar: "",
    email: "maria@foodnest.com",
    phone: "+1234567890",
    shift: "Morning (6AM - 2PM)",
    status: "active",
    tasks: [
      {
        id: "t1",
        title: "Prep vegetables for lunch",
        description: "Cut onions, tomatoes, and peppers for today's specials",
        priority: "high",
        status: "in-progress",
        estimatedTime: "30 mins",
        assignedAt: "9:00 AM",
      },
      {
        id: "t2",
        title: "Clean prep station",
        description: "Sanitize all prep surfaces and organize tools",
        priority: "medium",
        status: "completed",
        estimatedTime: "15 mins",
        assignedAt: "8:30 AM",
      },
    ],
  },
  {
    id: "2",
    name: "James Wilson",
    avatar: "",
    email: "james@foodnest.com",
    phone: "+1234567891",
    shift: "Evening (2PM - 10PM)",
    status: "break",
    tasks: [
      {
        id: "t3",
        title: "Stock inventory",
        description: "Check and restock dry goods and spices",
        priority: "medium",
        status: "pending",
        estimatedTime: "45 mins",
        assignedAt: "2:30 PM",
      },
    ],
  },
  {
    id: "3",
    name: "Lisa Chen",
    avatar: "",
    email: "lisa@foodnest.com",
    phone: "+1234567892",
    shift: "Morning (6AM - 2PM)",
    status: "active",
    tasks: [
      {
        id: "t4",
        title: "Prepare marinades",
        description: "Mix marinades for tomorrow's meat preparations",
        priority: "low",
        status: "completed",
        estimatedTime: "20 mins",
        assignedAt: "10:00 AM",
      },
    ],
  },
];

/* ---- Tiny UI primitives ---- */
function Card({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
function Badge({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.badge, style]}>{children}</View>;
}

/* ---- Helpers ---- */
const statusBadgeColors = (s: HelperStatus) => {
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
const priorityTextColor = (p: TaskPriority) => {
  switch (p) {
    case "high":
      return { color: "#dc2626" };
    case "medium":
      return { color: "#b45309" };
    case "low":
      return { color: "#16a34a" };
    default:
      return { color: "#374151" };
  }
};
const taskStatusIcon = (s: TaskStatus) => {
  switch (s) {
    case "completed":
      return "check-circle" as const;
    case "in-progress":
      return "clock" as const;
    case "pending":
    default:
      return "alert-circle" as const;
  }
};

export default function KitchenHelpersScreen() {
  const activeHelpers = mockHelpers.filter((h) => h.status === "active").length;
  const totalTasks = mockHelpers.reduce((acc, h) => acc + h.tasks.length, 0);
  const completedTasks = mockHelpers.reduce(
    (acc, h) => acc + h.tasks.filter((t) => t.status === "completed").length,
    0
  );

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View>
        <Text style={styles.h1}>Kitchen Helpers</Text>
        <Text style={styles.subtle}>Manage your kitchen staff and their tasks</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        <Card>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Active Helpers</Text>
            <Feather name="users" size={14} color="#2563eb" />
          </View>
          <Text style={styles.kpiValue}>{activeHelpers}</Text>
          <Text style={styles.kpiSubtle}>out of {mockHelpers.length} total</Text>
        </Card>

        <Card>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Total Tasks</Text>
            <Feather name="clock" size={14} color="#f59e0b" />
          </View>
          <Text style={styles.kpiValue}>{totalTasks}</Text>
          <Text style={styles.kpiSubtle}>assigned today</Text>
        </Card>

        <Card>
          <View style={styles.cardTopRow}>
            <Text style={styles.cardTitleSm}>Completed</Text>
            <Feather name="check-circle" size={14} color="#10b981" />
          </View>
          <Text style={styles.kpiValue}>{completedTasks}</Text>
          <Text style={styles.kpiSubtle}>of {totalTasks} tasks</Text>
        </Card>
      </View>

      {/* Helpers list */}
      <View style={{ gap: 12 }}>
        {mockHelpers.map((h) => {
          const sc = statusBadgeColors(h.status);
          return (
            <Card key={h.id}>
              {/* Header */}
              <View style={styles.helperHeader}>
                <View style={styles.helperLeft}>
                  <View style={styles.avatarWrap}>
                    {h.avatar ? (
                      <Image source={{ uri: h.avatar }} style={styles.avatar} />
                    ) : (
                      <View style={[styles.avatar, styles.avatarFallback]}>
                        <Text style={styles.avatarText}>
                          {h.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={{ gap: 2 }}>
                    <Text style={styles.helperName}>{h.name}</Text>
                    <Text style={styles.helperMeta}>{h.email}</Text>
                    <Text style={styles.helperMeta}>{h.phone}</Text>
                    <Text style={styles.helperShift}>{h.shift}</Text>
                  </View>
                </View>

                <Badge style={{ backgroundColor: sc.bg }}>
                  <Text style={{ color: sc.fg, fontWeight: "700" }}>
                    {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                  </Text>
                </Badge>
              </View>

              {/* Tasks */}
              <View style={{ gap: 10 }}>
                <View style={styles.tasksHeaderRow}>
                  <Text style={styles.sectionTitle}>Current Tasks</Text>
                  <Badge style={styles.badgeOutline}>
                    <Text style={styles.badgeOutlineText}>{h.tasks.length} tasks</Text>
                  </Badge>
                </View>

                {h.tasks.length > 0 ? (
                  <View style={{ gap: 8 }}>
                    {h.tasks.map((t) => {
                      const iconName = taskStatusIcon(t.status);
                      return (
                        <View key={t.id} style={styles.taskCard}>
                          <View style={styles.taskTopRow}>
                            <View style={styles.taskTitleRow}>
                              <Feather name={iconName} size={16} color="#374151" />
                              <Text style={styles.taskTitle}>{t.title}</Text>
                            </View>
                            <View style={styles.taskChipsRow}>
                              <Badge style={styles.badgeOutline}>
                                <Text style={[styles.badgeOutlineText, priorityTextColor(t.priority)]}>
                                  {t.priority}
                                </Text>
                              </Badge>
                              <Badge style={styles.badgeMuted}>
                                <Text style={styles.badgeMutedText}>{t.estimatedTime}</Text>
                              </Badge>
                            </View>
                          </View>

                          <Text style={styles.taskDesc}>{t.description}</Text>

                          <View style={styles.taskFooterRow}>
                            <Text style={styles.taskFooterText}>Assigned: {t.assignedAt}</Text>
                            <Badge style={t.status === "completed" ? styles.badgeSolid : styles.badgeOutline}>
                              <Text
                                style={
                                  t.status === "completed" ? styles.badgeSolidText : styles.badgeOutlineText
                                }
                              >
                                {t.status.replace("-", " ")}
                              </Text>
                            </Badge>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>No tasks assigned</Text>
                )}

                {/* Actions */}
                <View style={styles.actionsRow}>
                  <Pressable style={styles.btnOutline}>
                    <Text style={styles.btnOutlineText}>Assign Task</Text>
                  </Pressable>
                  <Pressable style={styles.btnOutline}>
                    <Text style={styles.btnOutlineText}>View Details</Text>
                  </Pressable>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

/* ---- Styles ---- */
const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 28, backgroundColor: "#f9fafb", gap: 12 },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280", marginTop: 2 },

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

  /* KPI cards */
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  cardTitleSm: { fontSize: 12, fontWeight: "700", color: "#1f2937" },
  kpiValue: { fontSize: 22, fontWeight: "800", color: "#111827" },
  kpiSubtle: { color: "#6b7280", fontSize: 12 },

  /* Helper card header */
  helperHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  helperLeft: { flexDirection: "row", alignItems: "center", gap: 12, flexShrink: 1 },
  avatarWrap: { width: 40, height: 40, borderRadius: 999, overflow: "hidden" },
  avatar: { width: 40, height: 40, borderRadius: 999 },
  avatarFallback: { backgroundColor: "#e5e7eb", alignItems: "center", justifyContent: "center" },
  avatarText: { fontWeight: "800", color: "#111827" },

  helperName: { fontSize: 16, fontWeight: "700", color: "#111827" },
  helperMeta: { color: "#6b7280", fontSize: 12 },
  helperShift: { color: "#111827", fontSize: 12, fontWeight: "600" },

  /* Section */
  sectionTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },

  /* Badges */
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
  },
  badgeOutline: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "transparent",
  },
  badgeOutlineText: { color: "#111827", fontSize: 12 },
  badgeMuted: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#eef2ff",
  },
  badgeMutedText: { color: "#1e40af", fontSize: 12 },
  badgeSolid: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
  },
  badgeSolidText: { color: "#fff", fontSize: 12 },

  /* Tasks */
  tasksHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskCard: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  taskTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  taskTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  taskTitle: { fontSize: 14, fontWeight: "600", color: "#111827", flexShrink: 1 },
  taskChipsRow: { flexDirection: "row", gap: 6 },

  taskDesc: { color: "#6b7280", fontSize: 12 },
  taskFooterRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  taskFooterText: { color: "#6b7280", fontSize: 12 },

  /* Actions */
  actionsRow: { flexDirection: "row", gap: 8, paddingTop: 4 },
  btnOutline: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  btnOutlineText: { color: "#111827", fontWeight: "800" },
  emptyText: {

  }
});
