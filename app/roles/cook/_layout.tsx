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
      <Drawer.Screen name="MyMenu" options={{ title: "My Menu" }} />
      <Drawer.Screen name="FoodPrepStatus" options={{ title: "Food Prep Status" }} />
      <Drawer.Screen name="RawMaterialRequests" options={{ title: "Raw Material Requests" }} />
      <Drawer.Screen name="RiderRequests" options={{ title: "Rider Requests" }} />
      <Drawer.Screen name="Specials" options={{ title: "Specials" }} />
      <Drawer.Screen name="KitchenHelpers" options={{ title: "Kitchen Helpers" }} />


    </Drawer>
  );
}
