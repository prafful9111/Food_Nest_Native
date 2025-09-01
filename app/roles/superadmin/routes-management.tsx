import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next"; // ✅ i18n
import LanguageSwitcher from "@/components/LanguageSwitcher";

/** ---------- Types ---------- */
type RouteItem = {
  id: number;
  name: string;
  region: string;
  status: "Active" | "Inactive";
  rider: string;
  stops: string[];
  duration: string;
  lastUpdate: string;
};

/** ---------- Seed data (parity with web) ---------- */
const seed: RouteItem[] = [
  {
    id: 1,
    name: "Downtown Route A",
    region: "Central",
    status: "Active",
    rider: "John Smith",
    stops: ["City Hall", "Central Park", "Business District", "Shopping Mall", "University Campus"],
    duration: "4 hours",
    lastUpdate: "2 hours ago",
  },
  {
    id: 2,
    name: "Suburban Route B",
    region: "North",
    status: "Active",
    rider: "Mike Davis",
    stops: ["Residential Area A", "Community Center", "Local School", "Grocery Plaza", "Medical Center"],
    duration: "3.5 hours",
    lastUpdate: "1 hour ago",
  },
  {
    id: 3,
    name: "Beach Route C",
    region: "South",
    status: "Inactive",
    rider: "Unassigned",
    stops: ["Marina", "Beach Boardwalk", "Pier Restaurant", "Surf Shop", "Beach Hotel"],
    duration: "5 hours",
    lastUpdate: "1 day ago",
  },
];

/** ---------- Screen ---------- */
export default function RoutesManagement() {
  const { t } = useTranslation(); // ✅ i18n
  const [routes, setRoutes] = useState<RouteItem[]>(seed);

  // Create/Edit dialog
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RouteItem | null>(null);

  // Form state
  const [routeName, setRouteName] = useState("");
  const [region, setRegion] = useState("");
  const [rider, setRider] = useState("");
  const [stops, setStops] = useState<string[]>([""]);
  const [tab, setTab] = useState<"manual" | "map">("manual");

  const canSave = routeName.trim() && region.trim() && (stops.filter(s => s.trim()).length > 0);

  const resetForm = () => {
    setEditing(null);
    setRouteName("");
    setRegion("");
    setRider("");
    setStops([""]);
    setTab("manual");
  };

  const startCreate = () => { resetForm(); setOpen(true); };
  const startEdit = (r: RouteItem) => {
    setEditing(r);
    setRouteName(r.name);
    setRegion(r.region);
    setRider(r.rider === "Unassigned" ? "" : r.rider);
    setStops(r.stops.length ? r.stops : [""]);
    setOpen(true);
  };

  const addStop = () => setStops(prev => [...prev, ""]);
  const removeStop = (i: number) => setStops(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);
  const changeStop = (i: number, v: string) => setStops(prev => prev.map((s, idx) => idx === i ? v : s));

  const save = () => {
    if (!canSave) return;
    const payload: RouteItem = {
      id: editing ? editing.id : Date.now(),
      name: routeName.trim(),
      region: region.trim(),
      status: editing?.status ?? "Active",
      rider: rider.trim() || t("routes.unassigned"),
      stops: stops.map(s => s.trim()).filter(Boolean),
      duration: editing?.duration ?? t("routes.durationDefault"),
      lastUpdate: t("routes.lastUpdate.justNow"),
    };
    setRoutes(list => editing ? list.map(r => r.id === editing.id ? payload : r) : [payload, ...list]);
    setOpen(false);
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <LanguageSwitcher />
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>{t("routes.header.title")}</Text>
          <Text style={styles.subtle}>{t("routes.header.subtitle")}</Text>
        </View>
        <Pressable style={styles.btnSolid} onPress={startCreate}>
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.btnSolidText}>  {t("routes.buttons.addRoute")}</Text>
        </Pressable>
      </View>

      {/* Overview "table" */}
      <View style={styles.card}>
        <View style={[styles.rowBetween, { marginBottom: 8 }]}>
          <Text style={styles.sectionTitle}>{t("routes.overview.title")}</Text>
          <Text style={styles.subtleSmall}>{t("routes.overview.subtitle")}</Text>
        </View>

        <View style={styles.listWrap}>
          {/* Header */}
          <View style={[styles.tableRow, styles.tableHead]}>
            <Text style={[styles.th, { flex: 1.8 }]}>{t("routes.table.routeName")}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t("routes.table.region")}</Text>
            <Text style={[styles.th, { flex: 0.9 }]}>{t("routes.table.stops")}</Text>
            <Text style={[styles.th, { flex: 1 }]}>{t("routes.table.status")}</Text>
            <Text style={[styles.th, { flex: 1, textAlign: "right" }]}>{t("routes.table.actions")}</Text>
          </View>

          {/* Body */}
          {routes.map((r, i) => (
            <View key={r.id} style={[styles.tableRow, i < routes.length - 1 ? styles.tableDivider : null]}>
              <Text style={[styles.td, { flex: 1.8, fontWeight: "700" }]}>{r.name}</Text>
              <Text style={[styles.td, { flex: 1 }]}>{r.region}</Text>
              <Text style={[styles.td, { flex: 0.9 }]}>{r.stops.length} {t("routes.labels.stops")}</Text>
              <View style={[styles.tdContainer, { flex: 1 }]}>
                <Badge
                  text={t(`routes.status.${r.status}`)}
                  tone={r.status === "Active" ? "green" : "gray"}
                />
              </View>
              <View style={[styles.tdContainer, { flex: 1, alignItems: "flex-end" }]}>
                <Pressable style={styles.btnOutlineSm} onPress={() => startEdit(r)}>
                  <Text>{t("routes.actions.edit")}</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Cards per route */}
      <View style={{ gap: 12 }}>
        {routes.map(route => (
          <View key={route.id} style={styles.card}>
            <View style={[styles.rowBetween, { marginBottom: 8 }]}>
              <View>
                <Text style={{ fontSize: 16, fontWeight: "800" }}>{route.name}</Text>
                <View style={[styles.row, { gap: 12, marginTop: 4 }]}>
                  <Text style={styles.subtleSmall}><Feather name="user" size={12} /> {route.rider}</Text>
                  <Text style={styles.subtleSmall}><Feather name="clock" size={12} /> {route.duration}</Text>
                </View>
              </View>
              <View style={[styles.row, { gap: 8, alignItems: "center" }]}>
                <Badge
                  text={t(`routes.status.${route.status}`)}
                  tone={route.status === "Active" ? "green" : "gray"}
                />
                <Pressable style={styles.btnOutlineSm} onPress={() => startEdit(route)}>
                  <Text>{t("routes.actions.edit")}</Text>
                </Pressable>
              </View>
            </View>

            <View style={{ gap: 8 }}>
              <View>
                <View style={[styles.row, { gap: 6, alignItems: "center", marginBottom: 6 }]}>
                  <Feather name="map-pin" size={14} />
                  <Text style={{ fontWeight: "700" }}>{t("routes.labels.routeStops")}</Text>
                </View>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {route.stops.map((stop, idx) => (
                    <View key={idx} style={styles.stopPill}>
                      <View style={styles.stopIndex}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>{idx + 1}</Text></View>
                      <Text>{stop}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.subtleSmall}>{t("routes.lastUpdate.prefix")} {route.lastUpdate}</Text>
                <Text style={styles.subtleSmall}>{route.stops.length} {t("routes.labels.stopsTotal")}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Create/Edit Modal */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, maxHeight: "90%", width: "100%" }]}>
            <View>
              <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                <Feather name="map" size={18} />
                <Text style={{ fontSize: 18, fontWeight: "800" }}>
                  {editing ? t("routes.modal.titleEdit") : t("routes.modal.titleCreate")}
                </Text>
              </View>
              <Text style={styles.subtle}>
                {t("routes.modal.subtitle")}
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {/* Top row */}
              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>{t("routes.fields.routeName")}</Text>
                  <TextInput
                    style={styles.input}
                    value={routeName}
                    onChangeText={setRouteName}
                    placeholder={t("routes.placeholders.routeName") as string}
                  />
                </View>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>{t("routes.fields.region")}</Text>
                  <TextInput
                    style={styles.input}
                    value={region}
                    onChangeText={setRegion}
                    placeholder={t("routes.placeholders.region") as string}
                  />
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={[styles.field, { flex: 1 }]}>
                  <Text style={styles.label}>{t("routes.fields.assignRider")}</Text>
                  <TextInput
                    style={styles.input}
                    value={rider}
                    onChangeText={setRider}
                    placeholder={t("routes.placeholders.rider") as string}
                  />
                </View>
              </View>

              {/* Tabs */}
              <View style={styles.tabsBar}>
                <Pressable onPress={() => setTab("manual")} style={[styles.tabBtn, tab === "manual" && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, tab === "manual" && styles.tabTextActive]}>{t("routes.tabs.manual")}</Text>
                </Pressable>
                <Pressable onPress={() => setTab("map")} style={[styles.tabBtn, tab === "map" && styles.tabBtnActive]}>
                  <Text style={[styles.tabText, tab === "map" && styles.tabTextActive]}>{t("routes.tabs.map")}</Text>
                </Pressable>
              </View>

              {tab === "manual" ? (
                <View style={{ gap: 10 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.label}>{t("routes.fields.routeStops")}</Text>
                    <Pressable style={styles.btnOutlineSm} onPress={addStop}>
                      <Feather name="plus" size={14} /><Text>  {t("routes.actions.add")}</Text>
                    </Pressable>
                  </View>

                  {stops.map((s, idx) => (
                    <View key={idx} style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                      <TextInput
                        style={[styles.input, { flex: 1 }]}
                        placeholder={`${t("routes.placeholders.stop")} ${idx + 1}`}
                        value={s}
                        onChangeText={(v) => changeStop(idx, v)}
                      />
                      {stops.length > 1 && (
                        <Pressable style={styles.btnOutlineSm} onPress={() => removeStop(idx)}>
                          <Feather name="x" size={14} /><Text>  {t("routes.actions.remove")}</Text>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={{ gap: 8 }}>
                  <Text style={styles.label}>{t("routes.fields.mapLabel")}</Text>
                  <View style={styles.mapStub}>
                    <Text style={styles.subtleSmall}>
                      {t("routes.map.placeholder")}
                    </Text>
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8, paddingTop: 8 }]}>
                <Pressable style={styles.btnOutline} onPress={() => { setOpen(false); resetForm(); }}>
                  <Text>{t("routes.actions.cancel")}</Text>
                </Pressable>
                <Pressable style={[styles.btnSolid, !canSave && { opacity: 0.5 }]} disabled={!canSave} onPress={save}>
                  <Text style={styles.btnSolidText}>
                    {editing ? t("routes.actions.saveRoute") : t("routes.actions.createRoute")}
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

/** ---------- Small UI bits ---------- */
function Badge({ text, tone }: { text: string; tone: "green" | "gray" }) {
  const c = tone === "green" ? "#10b981" : "#9ca3af";
  const tC = tone === "green" ? "#065f46" : "#374151";
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: `${c}22`, borderWidth: 1, borderColor: `${c}55` }}>
      <Text style={{ color: tC, fontWeight: "700", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

/** ---------- Styles ---------- */
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
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#111827" },

  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  tableHead: { backgroundColor: "#f9fafb" },
  tableRow: { paddingHorizontal: 12, paddingVertical: 10, flexDirection: "row", alignItems: "center" },
  tableDivider: { borderBottomWidth: 1, borderBottomColor: "#eef1f5" },
  th: { fontWeight: "800", color: "#111827" },
  td: { color: "#111827" },

  stopPill: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f3f4f6", paddingVertical: 8, paddingHorizontal: 10, borderRadius: 12 },
  stopIndex: { width: 20, height: 20, borderRadius: 999, backgroundColor: "#111827", alignItems: "center", justifyContent: "center" },

  // inputs
  field: { gap: 6 },
  label: { fontWeight: "700", color: "#111827" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  // buttons
  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  btnOutline: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnOutlineSm: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },

  // tabs
  tabsBar: { flexDirection: "row", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, overflow: "hidden" },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  tabBtnActive: { backgroundColor: "#111827" },
  tabText: { fontWeight: "700", color: "#111827" },
  tabTextActive: { color: "#fff" },

  // modal
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
  mapStub: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, padding: 16, backgroundColor: "#f9fafb" },

  tdContainer: { flex: 1 },
});
