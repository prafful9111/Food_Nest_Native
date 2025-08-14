import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
} from "react-native";
import { Feather } from "@expo/vector-icons";

type Stop = { id: string; name: string; lat: number; lng: number };
type RouteItem = {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  rider: string | "Unassigned";
  duration: string;
  lastUpdate: string;
  stops: Stop[];
};

const seed: RouteItem[] = [
  {
    id: "1",
    name: "Downtown Route A",
    status: "Active",
    rider: "Rohit",
    duration: "3 hours",
    lastUpdate: "10 min ago",
    stops: [
      { id: "s1", name: "Central Park", lat: 19.07, lng: 72.87 },
      { id: "s2", name: "City Hall", lat: 19.08, lng: 72.86 },
    ],
  },
  {
    id: "2",
    name: "City Center B",
    status: "Active",
    rider: "Asha",
    duration: "2.5 hours",
    lastUpdate: "30 min ago",
    stops: [],
  },
];

export default function RoutesManagement() {
  const [routes, setRoutes] = useState<RouteItem[]>(seed);
  const [newStopName, setNewStopName] = useState("");

  const addStop = (routeId: string) => {
    if (!newStopName.trim()) return;
    setRoutes((arr) =>
      arr.map((r) =>
        r.id === routeId
          ? {
              ...r,
              stops: [
                ...r.stops,
                { id: String(Date.now()), name: newStopName, lat: 0, lng: 0 },
              ],
            }
          : r
      )
    );
    setNewStopName("");
  };

  const removeStop = (routeId: string, stopId: string) => {
    setRoutes((arr) =>
      arr.map((r) =>
        r.id === routeId ? { ...r, stops: r.stops.filter((s) => s.id !== stopId) } : r
      )
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Text style={styles.h1}>Routes Management</Text>
      <Text style={styles.subtle}>Manage routes, riders and stops</Text>

      <FlatList
        data={routes}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{item.name}</Text>
              <View
                style={[
                  styles.badge,
                  item.status === "Active" ? styles.badgeGreen : styles.badgeGray,
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    item.status === "Active" ? styles.badgeTextOn : styles.badgeTextOff,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
            <Text style={styles.subtle}>
              Rider: {item.rider} · {item.duration} · Updated {item.lastUpdate}
            </Text>

            <View style={{ gap: 8, marginTop: 8 }}>
              <Text style={{ fontWeight: "700" }}>Stops</Text>

              {item.stops.map((s) => (
                <View key={s.id} style={styles.rowBetween}>
                  <Text>• {s.name}</Text>
                  <Pressable
                    style={styles.iconBtn}
                    onPress={() => removeStop(item.id, s.id)}
                  >
                    <Feather name="x" size={14} />
                  </Pressable>
                </View>
              ))}

              <View style={styles.row}>
                <TextInput
                  placeholder="New stop name"
                  value={newStopName}
                  onChangeText={setNewStopName}
                  style={styles.input}
                />
                <Pressable style={styles.btnSolid} onPress={() => addStop(item.id)}>
                  <Feather name="plus" size={16} color="#fff" />
                  <Text style={{ color: "#fff", fontWeight: "600", marginLeft: 6 }}>
                    Add Stop
                  </Text>
                </Pressable>
              </View>

              {/* Map placeholder: later we’ll drop in react-native-maps here */}
              <View style={styles.mapStub}>
                <Text style={{ color: "#6b7280" }}>
                  Map preview goes here (react-native-maps).
                </Text>
              </View>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  h1: { fontSize: 24, fontWeight: "700" },
  subtle: { color: "#6b7280", marginBottom: 8 },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
    elevation: 3,
  },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 16, fontWeight: "700" },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  badgeGreen: { backgroundColor: "#10b98122", borderColor: "#10b98155" },
  badgeGray: { backgroundColor: "#e5e7eb", borderColor: "#d1d5db" },
  badgeText: { fontSize: 12, fontWeight: "600" },
  badgeTextOn: { color: "#065f46" },
  badgeTextOff: { color: "#374151" },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  iconBtn: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  btnSolid: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111827",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },

  mapStub: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
});
