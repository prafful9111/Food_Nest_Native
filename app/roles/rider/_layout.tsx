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





    </Drawer>
  );
}
