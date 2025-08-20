import { Drawer } from "expo-router/drawer";

export default function RefillCoordinatorLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Refill Coordinator",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="CookOverview" options={{ title: "Cook Overview" }} />



    </Drawer>
  );
}
