import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Modal,
} from "react-native";
import { Feather } from "@expo/vector-icons";

/* ===== Seed data ===== */
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

/* ================== Screen ================== */
export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>(initialTeams);

  // modal state
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);

  // form state
  const [teamName, setTeamName] = useState("");
  const [selSup, setSelSup] = useState<string[]>([]);
  const [selRid, setSelRid] = useState<string[]>([]);
  const [selCook, setSelCook] = useState<string[]>([]);

  const canSubmit = teamName.trim().length > 0 && (selSup.length + selRid.length + selCook.length) > 0;

  const resetForm = () => {
    setTeamName("");
    setSelSup([]);
    setSelRid([]);
    setSelCook([]);
    setEditingTeam(null);
  };

  const toggle = (list: string[], name: string, setter: (v: string[]) => void) => {
    setter(list.includes(name) ? list.filter((n) => n !== name) : [...list, name]);
  };

  // Open modal to CREATE
  const openCreate = () => {
    resetForm();
    setOpen(true);
  };

  // Open modal to EDIT
  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setTeamName(team.name);
    setSelSup(team.supervisors);
    setSelRid(team.riders);
    setSelCook(team.cooks);
    setOpen(true);
  };

  // Save (create or edit)
  const submit = () => {
    if (!canSubmit) return;

    if (editingTeam) {
      // update existing
      const updated: Team = {
        ...editingTeam,
        name: teamName.trim(),
        supervisors: selSup,
        riders: selRid,
        cooks: selCook,
      };
      setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? updated : t)));
    } else {
      // create new
      const newTeam: Team = {
        id: Date.now(),
        name: teamName.trim(),
        supervisors: selSup,
        riders: selRid,
        cooks: selCook,
        created: new Date().toISOString().slice(0, 10),
        routes: Math.max(1, Math.floor(Math.random() * 4)),
      };
      setTeams((prev) => [...prev, newTeam]);
    }

    setOpen(false);
    resetForm();
  };

  return (
    <ScrollView contentContainerStyle={styles.page}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.h1}>Team Management</Text>
          <Text style={styles.subtle}>Create and manage teams with supervisors</Text>
        </View>
        <Pressable style={styles.btnSolid} onPress={openCreate}>
          <Feather name="plus" color="#fff" size={16} />
          <Text style={styles.btnSolidText}>  Create Team</Text>
        </Pressable>
      </View>

      {/* Teams list */}
      <View style={{ gap: 12 }}>
        {teams.map((team) => (
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
                  <ChipRow data={team.supervisors} color="#1d4ed8" />
                </Section>
              )}
              {team.riders.length > 0 && (
                <Section title="Riders" icon="truck">
                  <ChipRow data={team.riders} color="#047857" />
                </Section>
              )}
              {team.cooks.length > 0 && (
                <Section title="Cooks" icon="coffee">
                  <ChipRow data={team.cooks} color="#c2410c" />
                </Section>
              )}
            </View>
          </View>
        ))}
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
                people={supervisors.filter((s) => s.available)}
                selected={selSup}
                onToggle={(name) => toggle(selSup, name, setSelSup)}
              />

              {/* Riders */}
              <PickerGroup
                icon="truck"
                title="Select Riders"
                people={riders.filter((r) => r.available)}
                selected={selRid}
                onToggle={(name) => toggle(selRid, name, setSelRid)}
              />

              {/* Cooks */}
              <PickerGroup
                icon="coffee"
                title="Select Cooks"
                people={cooks.filter((c) => c.available)}
                selected={selCook}
                onToggle={(name) => toggle(selCook, name, setSelCook)}
              />

              {/* Selected preview */}
              {(selSup.length || selRid.length || selCook.length) ? (
                <View style={{ paddingTop: 10, borderTopWidth: 1, borderColor: "#e5e7eb", gap: 8 }}>
                  <Text style={styles.label}>Selected Team Members</Text>

                  {selSup.length > 0 && (
                    <View>
                      <Badge text="Supervisors" outline />
                      <ChipRow data={selSup} color="#1d4ed8" />
                    </View>
                  )}
                  {selRid.length > 0 && (
                    <View>
                      <Badge text="Riders" outline />
                      <ChipRow data={selRid} color="#047857" />
                    </View>
                  )}
                  {selCook.length > 0 && (
                    <View>
                      <Badge text="Cooks" outline />
                      <ChipRow data={selCook} color="#c2410c" />
                    </View>
                  )}
                </View>
              ) : null}

              {/* Actions */}
              <View style={[styles.row, { justifyContent: "flex-end", gap: 8, paddingTop: 10, borderTopWidth: 1, borderColor: "#e5e7eb" }]}>
                <Pressable style={styles.btnOutline} onPress={() => { setOpen(false); resetForm(); }}>
                  <Text>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.btnSolid, !canSubmit && { opacity: 0.5 }]}
                  disabled={!canSubmit}
                  onPress={submit}
                >
                  <Text style={styles.btnSolidText}>{editingTeam ? "Save Changes" : "Create Team"}</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

/* ========== Small pieces ========== */
function Section({ title, icon, children }: { title: string; icon: keyof typeof Feather.glyphMap; children: React.ReactNode }) {
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
      {data.map((name) => (
        <View
          key={name}
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: `${color}22`,
            borderWidth: 1,
            borderColor: `${color}55`,
          }}
        >
          <Text style={{ color }}>{name}</Text>
        </View>
      ))}
    </View>
  );
}

function PickerGroup({
  icon,
  title,
  people,
  selected,
  onToggle,
}: {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  people: Person[];
  selected: string[];
  onToggle: (name: string) => void;
}) {
  return (
    <View>
      <View style={[styles.row, { alignItems: "center", gap: 8, marginBottom: 6 }]}>
        <Feather name={icon} size={16} />
        <Text style={styles.label}>{title}</Text>
      </View>
      <View style={styles.selectorBox}>
        {people.map((p) => {
          const checked = selected.includes(p.name);
          return (
            <Pressable
              key={p.id}
              style={styles.selectRow}
              onPress={() => onToggle(p.name)}
            >
              <Feather name={checked ? "check-square" : "square"} size={18} />
              <Text style={{ marginLeft: 8 }}>{p.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Badge({ text, outline = false }: { text: string; outline?: boolean }) {
  return (
    <View
      style={[
        {
          alignSelf: "flex-start",
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 999,
        },
        outline
          ? { borderWidth: 1, borderColor: "#cbd5e1" }
          : { backgroundColor: "#f1f5f9" },
      ]}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color: "#334155" }}>{text}</Text>
    </View>
  );
}

/* ========== Styles ========== */
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

  // inputs
  field: { gap: 6 },
  label: { fontWeight: "700", color: "#111827" },
  input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

  // selector
  selectorBox: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 8, gap: 6, maxHeight: 160 },
  selectRow: { flexDirection: "row", alignItems: "center", padding: 6, borderRadius: 8 },

  // buttons
  btnSolid: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  btnSolidText: { color: "#fff", fontWeight: "700" },
  btnOutline: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },

  // backdrop
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
});
