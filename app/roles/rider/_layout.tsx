import { Drawer } from "expo-router/drawer";

export default function RiderLayout() {
  return (
    <Drawer
    
      screenOptions={{
        headerTitle: "rider",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen name="rideroverview" options={{ title: "Rider Overview" }} />

      <Drawer.Screen name="logsales" options={{ title: "Log Sales" }} />

      <Drawer.Screen name="carthealth" options={{ title: "Cart Health" }} />  





    </Drawer>
  );
}
