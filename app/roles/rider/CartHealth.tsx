// screens/CartHealth.tsx
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

/* ---------- types ---------- */
type LogItem = {
  id: string;
  time: string; // readable timestamp
  action: "start_charging" | "stop_charging" | "note";
  note?: string;
};

/* ---------- tiny UI atoms ---------- */
function Badge({
  text,
  variant = "solid",
  color = "#2563eb",
}: {
  text: string;
  variant?: "solid" | "outline";
  color?: string;
}) {
  const solid = variant === "solid";
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: solid ? color : "transparent", borderColor: color },
      ]}
    >
      <Text style={{ color: solid ? "#fff" : color, fontSize: 11, fontWeight: "700" }}>
        {text}
      </Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${pct}%` }]} />
    </View>
  );
}

/* ---------- helpers ---------- */
const tone = {
  success: "#059669",
  warning: "#d97706",
  destructive: "#dc2626",
  primary: "#2563eb",
  gray: "#6b7280",
} as const;

function nowLabel() {
  const d = new Date();
  return d.toLocaleString();
}

/* ---------- screen ---------- */
export default function CartHealthScreen() {
  // Mocked base data (swap with API later)
  const [cartId] = useState("CART-TH-1081");
  const [location] = useState("Depot A · Bay 3");
  const [batteryPct, setBatteryPct] = useState(42); // %
  const [isCharging, setIsCharging] = useState(false);
  const [chargeRatePctPerHr] = useState(25); // demo rate
  const [rangePerPctKm] = useState(1.1); // 1% ≈ 1.1 km (demo)
  const [noteInput, setNoteInput] = useState("");
  const [logs, setLogs] = useState<LogItem[]>([
    { id: Math.random().toString(36).slice(2), time: nowLabel(), action: "note", note: "Pre-shift check completed." },
  ]);

  // Simulate battery going up while charging (demo-only)
  useEffect(() => {
    if (!isCharging) return;
    const id = setInterval(() => {
      setBatteryPct((prev) => Math.min(100, prev + 1)); // +1% every tick
    }, 4000); // every 4s
    return () => clearInterval(id);
  }, [isCharging]);

  const rangeKm = useMemo(() => Math.round(batteryPct * rangePerPctKm), [batteryPct, rangePerPctKm]);

  const etaToFull = useMemo(() => {
    if (!isCharging || batteryPct >= 100) return "—";
    const pctRemaining = 100 - batteryPct;
    const hours = pctRemaining / chargeRatePctPerHr;
    const totalMinutes = Math.ceil(hours * 60);
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [isCharging, batteryPct, chargeRatePctPerHr]);

  const statusBadge = isCharging ? (
    <Badge text="Charging" variant="solid" color={tone.success} />
  ) : (
    <Badge text="Idle" variant="outline" color={tone.gray} />
  );

  const toggleCharging = () => {
    setIsCharging((prev) => {
      const next = !prev;
      setLogs((l) => [
        {
          id: Math.random().toString(36).slice(2),
          time: nowLabel(),
          action: next ? "start_charging" : "stop_charging",
        },
        ...l,
      ]);
      return next;
    });
  };

  const addNote = () => {
    const val = noteInput.trim();
    if (!val) return;
    setLogs((l) => [
      { id: Math.random().toString(36).slice(2), time: nowLabel(), action: "note", note: val },
      ...l,
    ]);
    setNoteInput("");
    Keyboard.dismiss();
  };

  const bumpBattery = (delta: number) =>
    setBatteryPct((p) => Math.max(0, Math.min(100, p + delta)));

  return (
    <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
      {/* Page Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Cart Health</Text>
          <Text style={styles.subtle}>Monitor your cart status and toggle charging</Text>
        </View>
        <Badge text={cartId} variant="outline" color={tone.gray} />
      </View>

      {/* Status + Actions */}
      <View style={[styles.card, { gap: 12 }]}>
        <View style={styles.cardHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
              <Feather name="zap" size={18} />
              <Text style={styles.sectionTitle}>Power & Battery</Text>
            </View>
            <View style={[styles.row, { alignItems: "center", gap: 8, marginTop: 6, flexWrap: "wrap" }]}>
              <View style={[styles.row, { gap: 6, alignItems: "center" }]}>
                <Feather name="map-pin" size={14} color={tone.gray} />
                <Text style={styles.subtle}>{location}</Text>
              </View>
              {statusBadge}
            </View>
          </View>

          <Pressable
            onPress={toggleCharging}
            style={({ pressed }) => [
              styles.primaryBtn,
              isCharging && { shadowColor: tone.success },
              pressed && { opacity: 0.95 },
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !isCharging }}
          >
            <Feather name={isCharging ? "power" : "battery-charging"} size={16} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.primaryBtnText}>{isCharging ? "Stop Charging" : "Start Charging"}</Text>
          </Pressable>
        </View>

        {/* Battery meter / Range / ETA */}
        <View style={styles.grid3}>
          <View style={styles.metricTile}>
            <Text style={styles.subtleSmall}>Battery</Text>
            <View style={[styles.row, { alignItems: "flex-end", gap: 6, marginTop: 6 }]}>
              <Text style={styles.big}>{batteryPct}%</Text>
              <Text style={styles.subtle}>SoC</Text>
            </View>
            <View style={{ marginTop: 10 }}>
              <ProgressBar value={batteryPct} />
            </View>
          </View>

          <View style={styles.metricTile}>
            <Text style={styles.subtleSmall}>Estimated Range</Text>
            <View style={[styles.row, { alignItems: "center", gap: 8, marginTop: 6 }]}>
              <Feather name="activity" size={18} />
              <Text style={styles.tileValue}>{rangeKm} km</Text>
            </View>
            <Text style={styles.note}>Approximation based on current SoC</Text>
          </View>

          <View style={styles.metricTile}>
            <Text style={styles.subtleSmall}>ETA to Full</Text>
            <View style={[styles.row, { alignItems: "center", gap: 8, marginTop: 6 }]}>
              <Feather name="clock" size={18} />
              <Text style={styles.tileValue}>{etaToFull}</Text>
            </View>
            <Text style={styles.note}>Charge rate ~{chargeRatePctPerHr}% / hr</Text>
          </View>
        </View>

        {/* Quick note + Demo controls */}
        <View style={styles.grid2}>
          {/* Quick Note */}
          <View style={[styles.cardLite, { gap: 8 }]}>
            <Text style={styles.cardTitle}>Add a quick note</Text>
            <Text style={styles.subtleSmall}>Optional — visible in activity log</Text>
            <Text style={styles.label}>Note</Text>
            <TextInput
              placeholder="e.g., Plugged into Bay 3, cable secure"
              value={noteInput}
              onChangeText={setNoteInput}
              onSubmitEditing={addNote}
              returnKeyType="done"
              style={styles.input}
            />
            <Text style={styles.hint}>Press enter/done to save</Text>
          </View>

          {/* Demo controls */}
          <View style={[styles.cardLite, { gap: 8 }]}>
            <Text style={styles.cardTitle}>Demo Controls</Text>
            <Text style={styles.subtleSmall}>For testing in UI only</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
              <GhostBtn label="+5% Battery" onPress={() => bumpBattery(+5)} />
              <GhostBtn label="-5% Battery" onPress={() => bumpBattery(-5)} />
              <GhostBtn label="Set 100%" onPress={() => setBatteryPct(100)} />
              <GhostBtn label="Set 10%" onPress={() => setBatteryPct(10)} />
            </View>
          </View>
        </View>
      </View>

      {/* Activity Log */}
      <View style={styles.card}>
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.sectionTitle}>Activity Log</Text>
          <Text style={styles.subtle}>Charging actions & notes</Text>
        </View>

        <View style={styles.listWrap}>
          {logs.length === 0 ? (
            <View style={{ padding: 12 }}>
              <Text style={[styles.subtle, { textAlign: "center" }]}>No activity yet.</Text>
            </View>
          ) : (
            logs.map((log, idx) => {
              const badge =
                log.action === "start_charging" ? (
                  <Badge text="Started charging" variant="solid" color={tone.success} />
                ) : log.action === "stop_charging" ? (
                  <Badge text="Stopped charging" variant="outline" color={tone.gray} />
                ) : (
                  <Badge text="Note" variant="outline" color={tone.primary} />
                );

              return (
                <View key={log.id} style={{}}>
                  <View style={[styles.listRow, { alignItems: "flex-start", gap: 10 }]}>
                    <View style={[styles.row, { alignItems: "center", gap: 8, flex: 1 }]}>
                      {badge}
                      {log.note ? (
                        <Text style={{ color: "#111827" }}>{log.note}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.subtleSmall}>{log.time}</Text>
                  </View>
                  {idx < logs.length - 1 ? <View style={styles.divider} /> : null}
                </View>
              );
            })
          )}
        </View>
      </View>
    </ScrollView>
  );
}

/* ---------- small ghost button ---------- */
function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ghostBtn, pressed && { opacity: 0.9 }]}>
      <Text style={styles.ghostBtnText}>{label}</Text>
    </Pressable>
  );
}

/* ---------- styles (aligned with your other screens) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },
  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },
  label: { fontSize: 12, fontWeight: "700", color: "#374151" },
  hint: { fontSize: 11, color: "#9ca3af" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },

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
  cardHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  /* grid-ish layouts */
  grid3: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  grid2: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  metricTile: {
    flex: 1,
    minWidth: 220,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  big: { fontSize: 32, fontWeight: "900", color: "#111827", lineHeight: 34 },
  tileValue: { fontSize: 20, fontWeight: "800", color: "#111827" },
  note: { marginTop: 4, fontSize: 11, color: "#6b7280" },

  /* list/table look */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  divider: { height: 1, backgroundColor: "#eef1f5" },

  /* progress */
  progressTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: "#f1f5f9",
    overflow: "hidden",
  },
  progressFill: { height: 8, borderRadius: 999, backgroundColor: "#2563eb" },

  /* buttons */
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },

  ghostBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  ghostBtnText: { color: "#111827", fontWeight: "800", fontSize: 12 },

  /* badge */
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },

   row: { flexDirection: "row" },

     cardLite: {
    // define the styles for cardLite here
  },

  cardTitle: {
    // define the styles for cardTitle here
  },

  input: {
    // define the styles for input here
  },

});
