import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { api } from "@/lib/api";

/* ===== Seed data (kept, unchanged) ===== */
type Person = { id: number; name: string; available: boolean };

const supervisors: Person[] = [
  { id: 1, name: "Alice Johnson", available: true },
  { id: 2, name: "Bob Smith", available: false },
  { id: 3, name: "Carol Davis", available: true },
  { id: 4, name: "David Wilson", available: true },
];

const riders: Person[] = [
  { id: 1, name: "Mike Rodriguez", available: true },
  { id: 2, name: "Sarah Chen", available: true },
  { id: 3, name: "James Wilson", available: false },
  { id: 4, name: "Emily Davis", available: true },
];

const cooks: Person[] = [
  { id: 1, name: "Roberto Singh", available: true },
  { id: 2, name: "Maria Garcia", available: true },
  { id: 3, name: "David Kim", available: false },
];

type Team = {
  id: number;
  name: string;
  supervisors: string[];
  riders: string[];
  cooks: string[];
  created: string;
  routes: number;
};

const initialTeams: Team[] = [
  {
    id: 1,
    name: "Downtown Team",
    supervisors: ["Alice Johnson", "David Wilson"],
    riders: ["Mike Rodriguez", "Sarah Chen"],
    cooks: ["Roberto Singh"],
    created: "2024-01-15",
    routes: 3,
  },
  {
    id: 2,
    name: "Suburban Team",
    supervisors: ["Carol Davis"],
    riders: ["Emily Davis"],
    cooks: ["Maria Garcia"],
    created: "2024-01-20",
    routes: 2,
  },
];

/* ===== New API types & helpers (added) ===== */
type Member = { id: string; name: string; email?: string };

type ApiTeam = {
  id: string;
  name: string;
  created: string;
  routes: number;
  supervisors: Member[];
  riders: Member[];
  cooks: Member[];
};

const idsToNames = (ids: string[], pool: Member[]) =>
  ids.map((id) => pool.find((p) => p.id === id)?.name || id);

/* ================== Screen ================== */
export default function TeamManagement() {
  // keep your original local teams (not used now)
  const [_legacyTeams] = useState<Team[]>(initialTeams);

  // live teams from backend
  const [teams, setTeams] = useState<ApiTeam[]>([]);
  const [loading, setLoading] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<ApiTeam | null>(null);

  // form state (store IDs now)
  const [teamName, setTeamName] = useState("");
  const [selSupIds, setSelSupIds] = useState<string[]>([]);
  const [selRidIds, setSelRidIds] = useState<string[]>([]);
  const [selCookIds, setSelCookIds] = useState<string[]>([]);

  // picker option pools loaded from backend
  const [supOptions, setSupOptions] = useState<Member[]>([]);
  const [riderOptions, setRiderOptions] = useState<Member[]>([]);
  const [cookOptions, setCookOptions] = useState<Member[]>([]);

  const canSubmit =
    teamName.trim().length > 0 &&
    (selSupIds.length + selRidIds.length + selCookIds.length) > 0;

  const resetForm = () => {
    setTeamName("");
    setSelSupIds([]);
    setSelRidIds([]);
    setSelCookIds([]);
    setEditingTeam(null);
  };

  const toggle = (list: string[], id: string, setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((n) => n !== id) : [...list, id]);
  };

  // Open modal to CREATE
  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  // Open modal to EDIT
  const openEdit = (team: ApiTeam) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelSupIds(team.supervisors.map((m) => m.id));
    setSelRidIds(team.riders.map((m) => m.id));
    setSelCookIds(team.cooks.map((m) => m.id));
    setOpen(true);
  };

  // Save (create or edit) — wired to backend
  const submit = async () => {
    if (!canSubmit) return;

    try {
      if (editingTeam) {
        await api.patch(`/api/admin/teams/${editingTeam.id}`, {
          name: teamName.trim(),
          supervisors: selSupIds,
          riders: selRidIds,
          cooks: selCookIds,
        });
        Alert.alert("Success", "Team updated.");
      } else {
        await api.post(`/api/admin/teams`, {
          name: teamName.trim(),
          supervisors: selSupIds,
          riders: selRidIds,
          cooks: selCookIds,
        });
        Alert.alert("Success", "Team created.");
      }
      await loadTeams();
      setOpen(false);
      resetForm();
    } catch (e: any) {
      Alert.alert("Failed", e?.message || "Could not save team.");
    }
  };

  /* ---------- data loaders ---------- */
  async function loadTeams() {
    try {
      setLoading(true);
      const res = await api.get<{ items: ApiTeam[] }>("/api/admin/teams");
      setTeams(res.items || []);
    } catch (e) {
      console.error("loadTeams error", e);
      Alert.alert("Error", "Could not load teams.");
    } finally {
      setLoading(false);
    }
  }

// Accepts a variety of backend shapes and normalizes to {id, name, email}
function normalizeUsers(payload: any): { id: string; name: string; email?: string }[] {
  const arr =
    (payload && Array.isArray(payload.users) && payload.users) || // { users: [...] }
    (Array.isArray(payload) && payload) ||                        // [...] directly
    (payload && Array.isArray(payload.items) && payload.items) || // { items: [...] }
    [];

  return arr
    .map((u: any) => ({
      id: String(u.id ?? u._id ?? u.userId ?? u.uuid ?? ""),
      // prefer real name; fall back to handle/email if needed
      name: String(u.name ?? u.fullName ?? u.displayName ?? u.handle ?? u.email ?? "").trim(),
      email: u.email || undefined,
      role: u.role,
    }))
    .filter((u: any) => u.id && u.name);
}


async function loadOptions() {
  try {
    // Try role-filtered endpoints first
    const [sup, rid, cook] = await Promise.all([
      api.get<any>("/api/admin/users?role=supervisor"),
      api.get<any>("/api/admin/users?role=rider"),
      api.get<any>("/api/admin/users?role=cook"),
    ]);

    let _sup = normalizeUsers(sup);
    let _rid = normalizeUsers(rid);
    let _cook = normalizeUsers(cook);

    // Fallback: if your backend didn't implement ?role= filter yet, fetch all and split by role
    if (!_sup.length && !_rid.length && !_cook.length) {
      const all = await api.get<any>("/api/admin/users");
      const normalized = normalizeUsers(all);
      _sup = normalized.filter((u: any) => u.role === "supervisor");
      _rid = normalized.filter((u: any) => u.role === "rider");
      _cook = normalized.filter((u: any) => u.role === "cook");
    }

    setSupOptions(_sup);
    setRiderOptions(_rid);
    setCookOptions(_cook);
  } catch (e: any) {
    console.error("loadOptions error", e);
    // Extra fallback: attempt unfiltered then split by role if 403/500 happened for role queries
    try {
      const all = await api.get<any>("/api/admin/users");
      const normalized = normalizeUsers(all);
      setSupOptions(normalized.filter((u: any) => u.role === "supervisor"));
      setRiderOptions(normalized.filter((u: any) => u.role === "rider"));
      setCookOptions(normalized.filter((u: any) => u.role === "cook"));
    } catch (e2: any) {
      console.error("loadOptions fallback error", e2);
      Alert.alert("Error", "Could not load user lists.");
    }
  }
}


  /* ------------ initial load ------------ */
  useEffect(() => {
    loadOptions();
    loadTeams();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Team Management</Text>
          <Text style={styles.subtle}>Create and manage teams with supervisors</Text>
        </View>

        {/* Yellow gradient Create Team button */}
        <LinearGradient
          colors={["#facc15", "#f59e0b"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.btnGradient}
        >
          <Pressable style={styles.btnGradientInner} onPress={openCreate}>
            <Feather name="plus" color="#ffffff" size={16} />
            <Text style={styles.btnGradientText}>  Create Team</Text>
          </Pressable>
        </LinearGradient>
      </View>

      {/* Teams list */}
      <View style={{ gap: 12 }}>
        {loading ? (
          <View style={[styles.card, { alignItems: "center", paddingVertical: 18 }]}>
            <ActivityIndicator />
          </View>
        ) : teams.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.subtle}>No teams yet. Create your first team.</Text>
          </View>
        ) : (
          teams.map((team) => (
            <View key={team.id} style={styles.card}>
              <View style={[styles.rowBetween, { marginBottom: 6 }]}>
                <View>
                  <View style={[styles.row, { alignItems: "center", gap: 8 }]}>
                    <Feather name="users" size={18} />
                    <Text style={{ fontSize: 18, fontWeight: "800" }}>{team.name}</Text>
                  </View>
                  <Text style={[styles.subtleSmall, { marginTop: 4 }]}>
                    Created: {team.created}  ·  {team.routes} active routes
                  </Text>
                </View>

                {/* EDIT TEAM */}
                <Pressable style={styles.btnOutline} onPress={() => openEdit(team)}>
                  <Text>Edit Team</Text>
                </Pressable>
              </View>

              <View style={{ gap: 12 }}>
                {team.supervisors.length > 0 && (
                  <Section title="Supervisors" icon="user">
                    <ChipRow data={team.supervisors.map((m) => m.name)} color="#1d4ed8" />
                  </Section>
                )}
                {team.riders.length > 0 && (
                  <Section title="Riders" icon="truck">
                    <ChipRow data={team.riders.map((m) => m.name)} color="#047857" />
                  </Section>
                )}
                {team.cooks.length > 0 && (
                  <Section title="Cooks" icon="coffee">
                    <ChipRow data={team.cooks.map((m) => m.name)} color="#c2410c" />
                  </Section>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Create/Edit Team Modal */}
      <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <View style={[styles.card, { padding: 16, gap: 12, maxHeight: "90%", width: "100%" }]}>
            <View>
              <Text style={{ fontSize: 18, fontWeight: "800" }}>
                {editingTeam ? "Edit Team" : "Create New Team"}
              </Text>
              <Text style={styles.subtle}>
                {editingTeam
                  ? "Update team name and membership"
                  : "Create a team and assign supervisors to manage operations"}
              </Text>
            </View>

            <ScrollView contentContainerStyle={{ gap: 12 }}>
              {/* Team Name */}
              <View style={styles.field}>
                <Text style={styles.label}>Team Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter team name"
                  value={teamName}
                  onChangeText={setTeamName}
                />
              </View>

              {/* Supervisors */}
              <PickerGroup
                icon="user"
                title="Select Supervisors"
                people={supOptions}
                selected={selSupIds}
                onToggle={(id) => toggle(selSupIds, id, setSelSupIds)}
              />

              {/* Riders */}
              <PickerGroup
                icon="truck"
                title="Select Riders"
                people={riderOptions}
                selected={selRidIds}
                onToggle={(id) => toggle(selRidIds, id, setSelRidIds)}
              />

              {/* Cooks */}
              <PickerGroup
                icon="coffee"
                title="Select Cooks"
                people={cookOptions}
                selected={selCookIds}
                onToggle={(id) => toggle(selCookIds, id, setSelCookIds)}
              />

              {/* Selected preview */}
              {selSupIds.length || selRidIds.length || selCookIds.length ? (
                <View style={{ paddingTop: 10, borderTopWidth: 1, borderColor: "#e5e7eb", gap: 8 }}>
                  <Text style={styles.label}>Selected Team Members</Text>

                  {selSupIds.length > 0 && (
                    <View>
                      <Badge text="Supervisors" outline />
                      <ChipRow data={idsToNames(selSupIds, supOptions)} color="#1d4ed8" />
                    </View>
                  )}
                  {selRidIds.length > 0 && (
                    <View>
                      <Badge text="Riders" outline />
                      <ChipRow data={idsToNames(selRidIds, riderOptions)} color="#047857" />
                    </View>
                  )}
                  {selCookIds.length > 0 && (
                    <View>
                      <Badge text="Cooks" outline />
                      <ChipRow data={idsToNames(selCookIds, cookOptions)} color="#c2410c" />
                    </View>
                  )}
                </View>
              ) : null}

              {/* Actions */}
              <View
                style={[
                  styles.row,
                  { justifyContent: "flex-end", gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: "#e5e7eb" },
                ]}
              >
                <Pressable
                  style={styles.btnOutline}
                  onPress={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  <Text>Cancel</Text>
                </Pressable>

                <Pressable
                  disabled={!canSubmit}
                  onPress={submit}
                  style={[styles.btnSolid, !canSubmit && { opacity: 0.5 }]}
                >
                  <Feather name="check" color="#fff" size={16} />
                  <Text style={styles.btnSolidText}>  Save</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ---------- small UI helpers you already used ---------- */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  children: React.ReactNode;
}) {
  return (
    <View>
      <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 6 }]}>
        <Feather name={icon} size={16} />
        <Text style={{ fontWeight: "700" }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function ChipRow({ data, color }: { data: string[]; color: string }) {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
      {data.map((d, idx) => (
        <View
          key={d + "_" + idx}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: color,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>{d}</Text>
        </View>
      ))}
    </View>
  );
}

function Badge({ text, outline = false }: { text: string; outline?: boolean }) {
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          marginBottom: 6,
        },
        outline
          ? { borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" }
          : { backgroundColor: "#e5e7eb" },
      ]}
    >
      <Text style={{ fontWeight: "700", color: "#111827" }}>{text}</Text>
    </View>
  );
}

/* ---------- PickerGroup updated to use Member + IDs ---------- */
function PickerGroup({
  icon,
  title,
  people,
  selected,
  onToggle,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  people: Member[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <View>
      <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 6 }]}>
        <Feather name={icon} size={16} />
        <Text style={[styles.label, { marginBottom: 0 }]}>{title}</Text>
      </View>

      <View style={[styles.listWrap]}>
        {people.length === 0 ? (
          <Text style={{ padding: 12, color: "#6b7280" }}>No options</Text>
        ) : (
          people.map((p, idx) => {
            const checked = selected.includes(p.id);
            return (
              <View key={p.id + "_" + idx}>
                <Pressable
                  onPress={() => onToggle(p.id)}
                  style={[styles.listRow, { justifyContent: "space-between" }]}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Feather name={checked ? "check-square" : "square"} size={18} />
                    <Text style={{ marginLeft: 8 }}>{p.name}</Text>
                  </View>
                  {p.email ? <Text style={styles.subtleSmall}>{p.email}</Text> : null}
                </Pressable>
                {idx < people.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

/* ---------- styles (kept + a few additions) ---------- */
const styles = StyleSheet.create({
  page: { padding: 16, gap: 16, paddingBottom: 32, backgroundColor: "#f9fafb" },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  h1: { fontSize: 22, fontWeight: "800", color: "#111827" },
  subtle: { color: "#6b7280" },
  subtleSmall: { color: "#6b7280", fontSize: 12 },

  row: { flexDirection: "row" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },

  card: {
    flex: 1,
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

  /* old solid button (kept, still used for Save) */
  btnSolid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnSolidText: { color: "#fff", fontWeight: "700" },

  /* outline button (kept) */
  btnOutline: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  /* NEW: yellow gradient button wrapper + inner pressable */
  btnGradient: {
    borderRadius: 999,
  },
  btnGradientInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  btnGradientText: { color: "#ffffff", fontWeight: "800" },

  /* form */
  field: { gap: 6 },
  label: { fontWeight: "700", color: "#111827", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },

  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    padding: 16,
    justifyContent: "flex-end",
  },

  /* list container reused in picker */
  listWrap: { borderWidth: 1, borderColor: "#eef1f5", borderRadius: 12, overflow: "hidden" },
  listRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
  },
  divider: { height: 1, backgroundColor: "#eef1f5" },
});
