import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, Pressable, Alert } from "react-native";
import { approveRequest, declineRequest, listRequests, RegistrationRequest } from "@/lib/requestsStore";
import { useFocusEffect } from "expo-router";

export default function RegistrationRequests() {
  const [data, setData] = useState<RegistrationRequest[]>([]);
  const load = useCallback(async () => setData(await listRequests()), []);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    try {
      await approveRequest(id);
      Alert.alert("Approved", "User account created.");
      load();
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed approving.");
    }
  };

  const decline = async (id: string) => {
    await declineRequest(id);
    load();
  };

  const Item = ({ item }: { item: RegistrationRequest }) => (
    <View
      style={{
        padding: 14,
        borderBottomWidth: 1,
        borderColor: "#eee",
        gap: 6,
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontWeight: "700" }}>{item.name} • {item.role.toUpperCase()}</Text>
      <Text style={{ color: "#555" }}>{item.email}</Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 6 }}>
        <Pressable
          onPress={() => approve(item.id)}
          style={{ backgroundColor: "#2e7d32", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Approve</Text>
        </Pressable>
        <Pressable
          onPress={() => decline(item.id)}
          style={{ backgroundColor: "#c62828", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Decline</Text>
        </Pressable>
      </View>
    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(x) => x.id}
      renderItem={({ item }) => <Item item={item} />}
      ListEmptyComponent={
        <View style={{ padding: 20 }}>
          <Text>No pending registration requests.</Text>
        </View>
      }
      contentContainerStyle={{ paddingBottom: 20 }}
    />
  );
}
