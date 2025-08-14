import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";

function NavButton({ to, label }: { to: string; label: string }) {
  return (
    <Pressable
      onPress={() => router.push(to as any)}  // cast here to avoid TS route typing noise
      style={{ padding: 14, borderRadius: 10, borderWidth: 1, marginVertical: 6 }}
    >
      <Text style={{ fontSize: 18, textAlign: "center" }}>{label}</Text>
    </Pressable>
  );
}

export default function Index() {
  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 24, textAlign: "center", marginBottom: 16 }}>
        FoodNest Native 🚀
      </Text>

      {/* NOTE: every path starts with a leading slash → absolute route */}
      <NavButton to="/roles/superadmin" label="SuperAdmin" />
      <NavButton to="/roles/supervisor" label="Supervisor" />
      <NavButton to="/roles/rider" label="Rider" />
      <NavButton to="/roles/cook" label="Cook" />
      <NavButton to="/roles/refill" label="Refill Coordinator" />
    </View>
  );
}
