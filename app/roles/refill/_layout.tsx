import { Drawer } from "expo-router/drawer";

export default function RefillCoordinatorLayout() {
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



    </Drawer>
  );
}
