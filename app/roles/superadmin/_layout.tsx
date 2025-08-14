import { Drawer } from "expo-router/drawer";

export default function SuperAdminLayout() {
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
    </Drawer>
  );
}
