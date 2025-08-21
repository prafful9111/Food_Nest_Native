import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert, RefreshControl } from "react-native";
import { api } from "@/lib/api";

type Req = { _id: string; email: string; name: string; role: string; createdAt: string };

export default function RegistrationRequests() {
  const [data, setData] = useState<Req[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const res = await api.get<{ items: Req[] }>("/api/admin/requests");
    setData(res.items);
  }, []);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    try { await api.post(`/api/admin/requests/${id}/approve`); Alert.alert("Approved", "User created."); load(); }
    catch (e: any) { Alert.alert("Error", e.message || "Approve failed"); }
  };
  const decline = async (id: string) => {
    try { await api.post(`/api/admin/requests/${id}/decline`); load(); }
    catch (e: any) { Alert.alert("Error", e.message || "Decline failed"); }
  };

  return (
    <FlatList
      data={data}
      keyExtractor={(x) => x._id}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      renderItem={({ item }) => (
        <View style={{ padding: 14, borderBottomWidth: 1, borderColor: "#eee", gap: 6, backgroundColor: "white" }}>
          <Text style={{ fontWeight: "700" }}>{item.name} • {item.role.toUpperCase()}</Text>
          <Text style={{ color: "#555" }}>{item.email}</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
            <Pressable onPress={() => approve(item._id)} style={{ backgroundColor: "#2e7d32", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "700" }}>Approve</Text>
            </Pressable>
            <Pressable onPress={() => decline(item._id)} style={{ backgroundColor: "#c62828", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}>
              <Text style={{ color: "white", fontWeight: "700" }}>Decline</Text>
            </Pressable>
          </View>
        </View>
      )}
      ListEmptyComponent={<View style={{ padding: 20 }}><Text>No pending registration requests.</Text></View>}
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
