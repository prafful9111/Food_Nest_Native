import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";

export default function SuperAdminLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
      screenOptions={{
        headerTitle: "SuperAdmin",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="overview" options={{ title: "Overview" }} />
      <Drawer.Screen name="user-management" options={{ title: "User Management" }} />
      <Drawer.Screen name="food-items" options={{ title: "Food Items" }} />
      <Drawer.Screen name="inventory" options={{ title: "Inventory" }} />
      <Drawer.Screen name="routes-management" options={{ title: "Routes Management" }} />
      <Drawer.Screen name="team-management" options={{ title: "Team Management" }} />
      <Drawer.Screen name="combos-management" options={{ title: "Combos Management" }} />
      <Drawer.Screen name="vehicles-management" options={{ title: "Vehicles Management" }} />
      <Drawer.Screen name="analytics" options={{ title: "Analytics" }} />

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
