import React, { useState } from "react";
import {
    View,
    Text,
    ScrollView,
    Modal,
    TextInput,
    Pressable,
    StyleSheet,
    FlatList,
    Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type User = {
    id: string;
    name: string;
    email: string;
    role: "Rider" | "Cook" | "Supervisor" | "Refill Coordinator";
    status: "Active" | "Inactive";
};


const seed: User[] = [
    { id: "1", name: "John Smith", email: "john@foodcart.com", role: "Rider", status: "Active" },
    { id: "2", name: "Sarah Khan", email: "sarah@foodcart.com", role: "Cook", status: "Active" },
    { id: "3", name: "Mike Davis", email: "mike@foodcart.com", role: "Supervisor", status: "Active" },
    { id: "4", name: "Emily Brown", email: "emily@foodcart.com", role: "Refill Coordinator", status: "Inactive" },
];

export default function UserManagement() {
    const [users, setUsers] = useState<User[]>(seed);
    const [open, setOpen] = useState(false);
    const [editing, setEdit] = useState<User | null>(null);

    // form state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<User["role"]>("Rider");
    const [status, setStatus] = useState<User["status"]>("Active");

    const reset = () => {
        setEdit(null);
        setName(""); setEmail("");
        setRole("Rider"); setStatus("Active");
    };

    const startAdd = () => { reset(); setOpen(true); };
    const startEdit = (u: User) => {
        setEdit(u);
        setName(u.name); setEmail(u.email);
        setRole(u.role); setStatus(u.status);
        setOpen(true);
    };

    const save = () => {
        if (!name.trim() || !email.includes("@")) {
            Alert.alert("Please enter a valid name and email.");
            return;
        }
        if (editing) {
            setUsers(arr => arr.map(x => x.id === editing.id ? { ...editing, name, email, role, status } : x));
        } else {
            setUsers(arr => [...arr, { id: String(Date.now()), name, email, role, status }]);
        }
        setOpen(false);
        reset();
    };

    const remove = (id: string) => setUsers(arr => arr.filter(x => x.id !== id));

    return (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
            {/* Header */}
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.h1}>User Management</Text>
                    <Text style={styles.subtle}>Manage staff and permissions</Text>
                </View>
                <Pressable style={styles.addBtn} onPress={startAdd}>
                    <Feather name="plus" size={16} color="#fff" />
                    <Text style={styles.addBtnText}>  Add User</Text>
                </Pressable>
            </View>

            {/* Table-like list */}
            <View style={styles.card}>
                <View style={[styles.row, styles.thead]}>
                    <Text style={[styles.cellName, styles.bold]}>Name</Text>
                    <Text style={[styles.cellEmail, styles.bold]}>Email</Text>
                    <Text style={[styles.cellSmall, styles.bold]}>Role</Text>
                    <Text style={[styles.cellSmall, styles.bold]}>Status</Text>
                    <Text style={[styles.cellActions, styles.bold]}>Actions</Text>
                </View>

                <FlatList
                    data={users}
                    keyExtractor={(i) => i.id}
                    renderItem={({ item }) => (
                        <View style={[styles.row, styles.trow]}>
                            <Text style={styles.cellName}>{item.name}</Text>
                            <Text style={styles.cellEmail}>{item.email}</Text>
                            <Text style={styles.cellSmall}>{item.role}</Text>
                            <Text style={styles.cellSmall}>
                                <View style={[
                                    styles.badge,
                                    item.status === "Active" ? styles.badgeGreen : styles.badgeGray
                                ]}>
                                    <Text style={[
                                        styles.badgeText,
                                        item.status === "Active" ? styles.badgeTextOn : styles.badgeTextOff
                                    ]}>
                                        {item.status}
                                    </Text>
                                </View>
                            </Text>
                            <View style={[styles.cellActions, { flexDirection: "row", gap: 8 }]}>
                                <Pressable style={styles.iconBtn} onPress={() => startEdit(item)}>
                                    <Feather name="edit-2" size={16} />
                                </Pressable>
                                <Pressable style={styles.iconBtn} onPress={() => remove(item.id)}>
                                    <Feather name="trash-2" size={16} />
                                </Pressable>
                            </View>
                        </View>
                    )}
                />
            </View>

            {/* Add/Edit Modal */}
            <Modal transparent visible={open} animationType="slide" onRequestClose={() => setOpen(false)}>
                <View style={styles.backdrop}>
                    <View style={[styles.card, { padding: 16, gap: 12 }]}>
                        <Text style={styles.modalTitle}>{editing ? "Edit User" : "Add User"}</Text>
                        <Text style={styles.subtle}>Invite staff and set permissions</Text>

                        <View style={styles.formRow}>
                            <View style={styles.field}>
                                <Text style={styles.label}>Name</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full name"
                                    value={name}
                                    onChangeText={setName}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="name@company.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <View style={styles.formRow}>
                            <View style={styles.field}>
                                <Text style={styles.label}>Role</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Rider / Cook / Supervisor / Refill Coordinator"
                                    value={role}
                                    onChangeText={(t) => setRole(t as User["role"])}
                                />
                            </View>
                            <View style={styles.field}>
                                <Text style={styles.label}>Status</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Active / Inactive"
                                    value={status}
                                    onChangeText={(t) => setStatus(t as User["status"])}
                                />
                            </View>
                        </View>

                        <View style={styles.actionsRow}>
                            <Pressable style={styles.btnOutline} onPress={() => setOpen(false)}>
                                <Text>Cancel</Text>
                            </Pressable>
                            <Pressable style={styles.btnSolid} onPress={save}>
                                <Text style={{ color: "#fff", fontWeight: "600" }}>
                                    {editing ? "Save" : "Add"}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({


    iconBtn: {
        padding: 8,
        backgroundColor: '#f0f0f0', // change as needed
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    h1: { fontSize: 24, fontWeight: "700" },
    subtle: { color: "#6b7280" },

    addBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#111827", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    addBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

    card: { backgroundColor: "#fff", borderRadius: 14, padding: 12, shadowColor: "#000", shadowOpacity: 0.08, shadowOffset: { width: 0, height: 6 }, shadowRadius: 10, elevation: 3 },

    // table-like
    row: { flexDirection: "row", alignItems: "center" },
    thead: { paddingVertical: 8, borderBottomWidth: 1, borderColor: "#e5e7eb" },
    trow: { paddingVertical: 10, borderBottomWidth: 1, borderColor: "#f3f4f6" },

    cellName: { flex: 1.5 },
    cellEmail: { flex: 1.8 },
    cellSmall: { flex: 1 },
    cellActions: { flex: 1.2, alignItems: "flex-end" },
    bold: { fontWeight: "700" },

    // badges
    badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, borderWidth: 1, alignSelf: "flex-start" },
    badgeGreen: { backgroundColor: "#10b98122", borderColor: "#10b98155" },
    badgeGray: { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
    badgeText: { fontSize: 12, fontWeight: "600" },
    badgeTextOn: { color: "#065f46" },
    badgeTextOff: { color: "#374151" },

    // modal
    backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: "700" },

    formRow: { flexDirection: "row", gap: 12 },
    field: { flex: 1, gap: 6 },
    label: { fontWeight: "600", color: "#374151" },
    input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },

    actionsRow: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 6 },
    btnOutline: { paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderRadius: 10, borderColor: "#d1d5db" },
    btnSolid: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#111827", borderRadius: 10 },
});
