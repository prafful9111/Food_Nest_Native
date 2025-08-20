import { Drawer } from "expo-router/drawer";

export default function CookLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "Cook",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="CookOverview" options={{ title: "Cook Overview" }} />


    </Drawer>
  );
}
