import { Drawer } from "expo-router/drawer";

export default function SupervisorLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Supervisor",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="SupervisorOverview" options={{ title: "Supervisor Overview" }} />
      <Drawer.Screen name="RiderLogs" options={{ title: "Rider Logs" }} />
      <Drawer.Screen name="AssignRider" options={{ title: "Assign Rider" }} />
      <Drawer.Screen name="ViewInventory" options={{ title: "View Invantory" }} />
      <Drawer.Screen name="ViewRoutes" options={{ title: "View Routes" }} />
      <Drawer.Screen name="RawMaterialInventory" options={{ title: "Raw Material Inventory" }} />

    </Drawer>
  );
}
