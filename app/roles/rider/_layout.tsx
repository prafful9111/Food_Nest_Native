import { Drawer } from "expo-router/drawer";

export default function RiderLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "rider",
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

    </Drawer>
  );
}
