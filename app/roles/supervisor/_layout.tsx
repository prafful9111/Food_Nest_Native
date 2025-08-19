import { Drawer } from "expo-router/drawer";

export default function SupervisorLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Supervisor",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="overview" options={{ title: "Supervisor Overview" }} />
      <Drawer.Screen name="riderlogs" options={{ title: "RiderLogs" }} />




    </Drawer>
  );
}
