import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";

export default function RefillCoordinatorLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Refill Coordinator",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="RefillCoordinatorOverview" options={{ title: "Refill Coordinator Overview" }} />
      <Drawer.Screen name="RefillRequests" options={{ title: "Refill Requests" }} />
      <Drawer.Screen name="InventoryStatus" options={{ title: "Inventory Status" }} />
      <Drawer.Screen name="CookCoordination" options={{ title: "Cook Coordination" }} />

      {/* Custom Signout Button */}
      <Drawer.Screen
        name="signout"
        options={{
          title: "Sign Out",
          drawerItemStyle: { marginTop: 'auto' },
          drawerIcon: ({ color, size }) => (
            <Feather name="log-out" size={size} color={color} />
          ),
        }}
        listeners={{
          focus: () => {
            // This will be handled by the custom component
          },
        }}
      />

    </Drawer>
  );
}
