import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";


function GradientIcon({
  name,
  size = 24,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
}) {
  const box = size + 12;
  return (
    <LinearGradient
      colors={["#FFE082", "#FFC107", "#FFA000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradCircle, { width: box, height: box, borderRadius: box / 2 }]}
    >
      <Feather name={name} size={size} color="#fff" />
    </LinearGradient>
  );
}

export default function RefillCoordinatorLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };


  const [refillcoordinatorName, setrefillcoordinatorName] = useState<string>("");

useEffect(() => {
  (async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      if (raw) {
        const parsed = JSON.parse(raw);
        setrefillcoordinatorName(parsed?.name || parsed?.email || "");
      }
    } catch {
      setrefillcoordinatorName("");
    }
  })();
}, []);


  return (
    <Drawer
      screenOptions={{
        headerTitle: refillcoordinatorName ? `Welcome ${refillcoordinatorName}` : "Welcome Cook",
        drawerActiveTintColor: "#7A4F01",
        drawerActiveBackgroundColor: "rgba(255,193,7,0.12)",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen
        name="RefillCoordinatorOverview"
        options={{
          title: "Refill Coordinator Overview",
          drawerIcon: ({ size }) => <GradientIcon name="home" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="RefillRequests"
        options={{
          title: "Refill Requests",
          drawerIcon: ({ size }) => <GradientIcon name="refresh-cw" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="InventoryStatus"
        options={{
          title: "Inventory Status",
          drawerIcon: ({ size }) => <GradientIcon name="bar-chart-2" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="CookCoordination"
        options={{
          title: "Cook Coordination",
          drawerIcon: ({ size }) => <GradientIcon name="users" size={size ?? 24} />,
        }}
      />

      {/* Custom Signout Button */}
      <Drawer.Screen
        name="signout"
        options={{
          title: "Sign Out",
          drawerItemStyle: { marginTop: "auto" },
          drawerIcon: ({ size }) => <GradientIcon name="log-out" size={size ?? 24} />,
        }}
        listeners={{
          focus: () => {
            // If you want this to trigger sign-out directly from the drawer item,
            // convert this "screen" into a custom component and call handleSignOut().
          },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  gradCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFA000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
