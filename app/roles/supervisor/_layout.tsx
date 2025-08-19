import { Drawer } from "expo-router/drawer";

export default function SupervisorLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Supervisor",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="supervisoroverview" options={{ title: "Supervisor Overview" }} />
      <Drawer.Screen name="riderlogs" options={{ title: "Rider Logs" }} />
      <Drawer.Screen name="assignrider" options={{ title: "Assign Rider" }} />
      <Drawer.Screen name="viewinvantory" options={{ title: "View Invantory" }} />
      <Drawer.Screen name="viewroutes" options={{ title: "View Routes" }} />




    </Drawer>
  );
}
