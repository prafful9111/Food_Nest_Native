import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";

export default function RiderLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Rider",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="RiderOverview" options={{ title: "Rider Overview" }} />

      <Drawer.Screen name="RiderLogs" options={{ title: "Log Sales" }} />

      <Drawer.Screen name="CartHealth" options={{ title: "Cart Health" }} />  
      <Drawer.Screen name="MyRoute" options={{ title: "My Route" }} />
      <Drawer.Screen name="RequestMore" options={{ title: "Request More" }} />
      <Drawer.Screen name ="AvialableVehicles" options={{title:"Available Vehicles"}}/> 
      <Drawer.Screen name="MyInventory" options={{ title: "My Inventory" }} />

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
