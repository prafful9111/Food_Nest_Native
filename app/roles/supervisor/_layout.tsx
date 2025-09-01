import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet } from "react-native";

function GradientIcon({
  name,
  size = 24,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
}) {
  const box = size + 12;
  return (
    <LinearGradient
      colors={["#FFE082", "#FFC107", "#FFA000"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradCircle, { width: box, height: box, borderRadius: box / 2 }]}
    >
      <Feather name={name} size={size} color="#fff" />
    </LinearGradient>
  );
}

export default function SupervisorLayout() {
  const router = useRouter();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
      screenOptions={{
        headerTitle: "Supervisor",
        drawerActiveTintColor: "#7A4F01",
        drawerActiveBackgroundColor: "rgba(255,193,7,0.12)",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen
        name="SupervisorOverview"
        options={{
          title: "Supervisor Overview",
          drawerIcon: ({ size }) => <GradientIcon name="home" size={size ?? 24} />,
        }}
      />
            <Drawer.Screen
        name='food-items'
        options={{
          title: 'Food Items',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='coffee'
              size={size}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="RiderLogs"
        options={{
          title: "Rider Logs",
          drawerIcon: ({ size }) => <GradientIcon name="file-text" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="AssignRider"
        options={{
          title: "Assign Rider",
          drawerIcon: ({ size }) => <GradientIcon name="user-plus" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="ViewInventory"
        options={{
          title: "View Inventory",
          drawerIcon: ({ size }) => <GradientIcon name="eye" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="ViewRoutes"
        options={{
          title: "View Routes",
          drawerIcon: ({ size }) => <GradientIcon name="map" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="RawMaterialInventory"
        options={{
          title: "Raw Material Inventory",
          drawerIcon: ({ size }) => <GradientIcon name="package" size={size ?? 24} />,
        }}
      />
            <Drawer.Screen
        name='vehicles-management'
        options={{
          title: 'Vehicles Management',
          drawerIcon: ({ size }) => (
            <GradientIcon
              name='truck'
              size={size}
            />
          ),
        }}
      />

      {/* Custom Signout Button */}
      <Drawer.Screen
        name="signout"
        options={{
          title: "Sign Out",
          drawerItemStyle: { marginTop: "auto" },
          drawerIcon: ({ size }) => <GradientIcon name="log-out" size={size ?? 24} />,
        }}
        listeners={{
          focus: () => {
            // This will be handled by the custom component
          },
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  gradCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FFA000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
