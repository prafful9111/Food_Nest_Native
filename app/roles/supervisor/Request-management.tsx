import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";

/** ========= Data (mirrors web) ========= */
const alerts = {
  refillRequests: [
    { id: 1, rider: "John Smith", route: "Downtown A", item: "Classic Burger", quantity: 5, urgent: true,  time: "10 min ago" },
    { id: 2, rider: "Mike Davis", route: "Suburban B", item: "Chicken Tacos",  quantity: 8, urgent: false, time: "25 min ago" },
  ],
  sosRequests: [
    { id: 1, rider: "Sarah Johnson", route: "Beach C",      reason: "Vehicle breakdown",  location: "Beach Rd & 5th St", time: "5 min ago" },
    { id: 2, rider: "Tom Wilson",    route: "University D", reason: "Medical emergency",  location: "University Campus", time: "2 min ago" },
  ],
  idleRiders: [
    { id: 1, rider: "Alex Chen", route: "Park E", location: "Central Park",   duration: "15 min", lastSale: "45 min ago" },
    { id: 2, rider: "Lisa Wang", route: "Mall F", location: "Shopping Center", duration: "12 min", lastSale: "32 min ago" },
  ],
  offRouteRiders: [
    { id: 1, rider: "Mark Brown", route: "Residential G", currentLocation: "Industrial Area", deviation: "2.3 km", time: "8 min ago" },
    { id: 2, rider: "Emma Davis", route: "Office H",      currentLocation: "Residential Zone", deviation: "1.8 km", time: "15 min ago" },
  ],
  missedCheckpoints: [
    { id: 1, rider: "Chris Lee", route: "Harbor I", checkpoint: "Pier 7",            scheduledTime: "2:30 PM", missedBy: "25 min" },
    { id: 2, rider: "Anna Kim",  route: "School J", checkpoint: "Elementary School", scheduledTime: "1:45 PM", missedBy: "40 min" },
  ],
};

/** ========= Small UI primitives ========= */
function Card({ title, subtitle, icon, children, tone = "neutral" }: {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "destructive";
}) {
  const toneBg =
    tone === "destructive" ? "#FEF2F2" :
    tone === "warning"     ? "#FFFBEB" :
    tone === "success"     ? "#F0FDF4" :
                             "#FFFFFF";
  const border =
    tone === "destructive" ? "#FECACA" :
    tone === "warning"     ? "#FDE68A" :
    tone === "success"     ? "#BBF7D0" :
                             "#EEF1F5";
  return (
    <View style={[styles.card, { backgroundColor: "#fff", borderColor: "#ECEFF3" }]}>
      <View style={{ marginBottom: 8 }}>
        <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
          {icon}
          <Text style={styles.h4}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.subtleSmall}>{subtitle}</Text> : null}
      </View>
      <View style={[styles.sectionBody, { backgroundColor: toneBg, borderColor: border }]}>
        {children}
      </View>
    </View>
  );
}

function Badge({ text, color = "#111827", bg = "#E5E7EB", outline = false }: {
  text: string;
  color?: string;
  bg?: string;
  outline?: boolean;
}) {
  return (
    <View style={[
      styles.badge,
      outline ? { backgroundColor: "transparent", borderColor: bg } : { backgroundColor: bg, borderColor: "transparent" }
    ]}>
      <Text style={[styles.badgeText, { color }]}>{text}</Text>
    </View>
  );
}

function Button({ title, onPress, variant = "solid", tone = "primary", leftIcon }: {
  title: string;
  onPress?: () => void;
  variant?: "solid" | "outline";
  tone?: "primary" | "success" | "warning" | "destructive" | "neutral";
  leftIcon?: React.ReactNode;
}) {
  const colors = {
    primary: { bg: "#2563EB", border: "#2563EB", text: "#fff" },
    success: { bg: "#16A34A", border: "#16A34A", text: "#fff" },
    warning: { bg: "#F59E0B", border: "#F59E0B", text: "#111827" },
    destructive: { bg: "#DC2626", border: "#DC2626", text: "#fff" },
    neutral: { bg: "#111827", border: "#111827", text: "#fff" },
  }[tone];

  const solid = variant === "solid";
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: solid ? colors.bg : "#fff",
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {leftIcon}
      <Text style={[
        styles.btnText,
        { color: solid ? colors.text : colors.border }
      ]}>{title}</Text>
    </Pressable>
  );
}

/** ========= Helpers ========= */
const urgencyBadge = (urgent: boolean) =>
  urgent
    ? <Badge text="Urgent" color="#fff" bg="#DC2626" />
    : <Badge text="Normal" color="#111827" bg="#F59E0B" />;

/** ========= Screen ========= */
export default function RequestsManagementScreen() {
  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={{ marginBottom: 4 }}>
        <Text style={styles.h1}>Requests Management</Text>
        <Text style={styles.subtle}>Monitor and respond to rider alerts and requests</Text>
      </View>

      {/* Grid 2-up: Refill / SOS */}
      <View style={styles.grid2up}>
        {/* Refill Requests */}
        <Card
          title="Refill Requests"
          subtitle="Riders requesting inventory refills"
          icon={<MaterialCommunityIcons name="gas-station" size={18} />}
          tone="neutral"
        >
          <View style={{ rowGap: 10 }}>
            {alerts.refillRequests.map((r) => (
              <View key={r.id} style={styles.blockNeutral}>
                <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                  <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                    <Text style={styles.bold}>{r.rider}</Text>
                    <Badge text={r.route} outline bg="#E5E7EB" color="#111827" />
                  </View>
                  {urgencyBadge(r.urgent)}
                </View>
                <Text style={styles.subtleSmall}>
                  Needs {r.quantity} {r.item} • {r.time}
                </Text>
                <View style={[styles.row, { gap: 8, marginTop: 8 }]}>
                  <Button title="Approve" tone="success" />
                  <Button title="Contact Rider" variant="outline" tone="primary" />
                </View>
              </View>
            ))}
          </View>
        </Card>

        {/* SOS Requests */}
        <Card
          title="SOS Requests"
          subtitle="Emergency assistance requests"
          icon={<Feather name="alert-triangle" size={18} color="#DC2626" />}
          tone="destructive"
        >
          <View style={{ rowGap: 10 }}>
            {alerts.sosRequests.map((s) => (
              <View key={s.id} style={styles.blockDestructive}>
                <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                  <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                    <Text style={styles.bold}>{s.rider}</Text>
                    <Badge text={s.route} outline bg="#FECACA" color="#111827" />
                  </View>
                  <Badge text="Emergency" color="#fff" bg="#DC2626" />
                </View>
                <Text style={[styles.textSm]}>
                  <Text style={styles.bold}>Reason:</Text> {s.reason}
                </Text>
                <Text style={styles.subtleSmall}>
                  <Feather name="map-pin" size={12} /> {s.location} • {s.time}
                </Text>
                <View style={[styles.row, { gap: 8, marginTop: 8 }]}>
                  <Button title="Respond Now" tone="destructive" />
                  <Button title="Call Rider" variant="outline" tone="destructive" />
                </View>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Grid 3-up: Idle / Off Route / Missed Checkpoints */}
      <View style={styles.grid3up}>
        {/* Idle Riders */}
        <Card
          title="Idle Riders (10+ min)"
          subtitle="Riders without sales activity"
          icon={<Feather name="clock" size={18} />}
          tone="warning"
        >
          <View style={{ rowGap: 8 }}>
            {alerts.idleRiders.map((r) => (
              <View key={r.id} style={styles.blockWarning}>
                <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                  <Text style={styles.bold}>{r.rider}</Text>
                  <Badge text={r.duration} color="#111827" bg="#F59E0B" />
                </View>
                <Text style={styles.textXs}>
                  {r.location} • Last sale: {r.lastSale}
                </Text>
                <Button title="Contact" variant="outline" tone="primary" />
              </View>
            ))}
          </View>
        </Card>

        {/* Off Route Riders */}
        <Card
          title="Off Route Riders"
          subtitle="Riders deviating from assigned routes"
          icon={<Feather name="navigation" size={18} />}
          tone="warning"
        >
          <View style={{ rowGap: 8 }}>
            {alerts.offRouteRiders.map((r) => (
              <View key={r.id} style={styles.blockWarning}>
                <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                  <Text style={styles.bold}>{r.rider}</Text>
                  <Badge text={r.deviation} color="#111827" bg="#F59E0B" />
                </View>
                <Text style={styles.textXs}>
                  Expected: {r.route} • Current: {r.currentLocation}
                </Text>
                <Button title="Guide Back" variant="outline" tone="primary" />
              </View>
            ))}
          </View>
        </Card>

        {/* Missed Checkpoints */}
        <Card
          title="Missed Checkpoints"
          subtitle="Riders who missed scheduled stops"
          icon={<Feather name="map-pin" size={18} />}
          tone="destructive"
        >
          <View style={{ rowGap: 8 }}>
            {alerts.missedCheckpoints.map((c) => (
              <View key={c.id} style={styles.blockDestructive}>
                <View style={[styles.rowBetween, { marginBottom: 4 }]}>
                  <Text style={styles.bold}>{c.rider}</Text>
                  <Badge text={c.missedBy} color="#fff" bg="#DC2626" />
                </View>
                <Text style={styles.textXs}>
                  {c.checkpoint} • Due: {c.scheduledTime}
                </Text>
                <Button title="Reschedule" variant="outline" tone="destructive" />
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Summary Stats */}
      <Card title="Alert Summary" subtitle="Current status overview" icon={null} tone="neutral">
        <View style={styles.summaryGrid}>
          <SummaryTile
            label="Refill Requests"
            value={String(alerts.refillRequests.length)}
            tone="warning"
          />
          <SummaryTile
            label="SOS Alerts"
            value={String(alerts.sosRequests.length)}
            tone="destructive"
          />
          <SummaryTile
            label="Idle Riders"
            value={String(alerts.idleRiders.length)}
            tone="warning"
          />
          <SummaryTile
            label="Off Route"
            value={String(alerts.offRouteRiders.length)}
            tone="warning"
          />
          <SummaryTile
            label="Missed Stops"
            value={String(alerts.missedCheckpoints.length)}
            tone="destructive"
          />
        </View>
      </Card>
    </ScrollView>
  );
}

/** ========= Summary tile ========= */
function SummaryTile({ value, label, tone }: { value: string; label: string; tone: "warning" | "destructive" }) {
  const color = tone === "warning" ? "#F59E0B" : "#DC2626";
  return (
    <View style={styles.summaryTile}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.subtleSmall}>{label}</Text>
    </View>
  );
}

/** ========= Styles ========= */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, paddingBottom: 32, backgroundColor: "#FFFFFF" },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  h4: { fontSize: 16, fontWeight: "800", color: "#111827" },
  bold: { fontWeight: "800", color: "#111827" },

  subtle: { color: "#6B7280" },
  subtleSmall: { color: "#6B7280", fontSize: 12 },
  textSm: { color: "#111827", fontSize: 13 },
  textXs: { color: "#6B7280", fontSize: 12 },

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  grid2up: {
    gap: 12,
  },
  grid3up: {
    gap: 12,
    marginTop: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    shadowColor: "#0F172A",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  sectionBody: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    borderColor: "#EEF1F5",
  },

  // content blocks within cards
  blockNeutral: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 10,
  },
  blockWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.20)",
    padding: 10,
    borderRadius: 10,
  },
  blockDestructive: {
    backgroundColor: "rgba(220, 38, 38, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(220, 38, 38, 0.20)",
    padding: 10,
    borderRadius: 10,
  },

  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: { fontSize: 11, fontWeight: "700" },

  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  btnText: { fontWeight: "800" },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  summaryTile: {
    flexBasis: "18%",
    flexGrow: 1,
    minWidth: 120,
    alignItems: "center",
    padding: 10,
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#EEF1F5",
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: "800",
  },
});
