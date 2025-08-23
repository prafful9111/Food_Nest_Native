import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";

export default function SupervisorLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Supervisor",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen 
        name="SupervisorOverview" 
        options={{ 
          title: "Supervisor Overview",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="RiderLogs" 
        options={{ 
          title: "Rider Logs",
          drawerIcon: ({ color, size }) => (
            <Feather name="file-text" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="AssignRider" 
        options={{ 
          title: "Assign Rider",
          drawerIcon: ({ color, size }) => (
            <Feather name="user-plus" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="ViewInventory" 
        options={{ 
          title: "View Inventory",
          drawerIcon: ({ color, size }) => (
            <Feather name="eye" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="ViewRoutes" 
        options={{ 
          title: "View Routes",
          drawerIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="RawMaterialInventory" 
        options={{ 
          title: "Raw Material Inventory",
          drawerIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }} 
      />

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
