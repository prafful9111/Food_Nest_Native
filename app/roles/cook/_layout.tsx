import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { getUser, onAuthChange, signOut } from "@/lib/authStore";
import { useEffect } from "react";
import { StyleSheet, View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

// Small gradient icon wrapper (yellow food theme) — same vibe as SuperAdmin
function GradientIcon({
  name,
  size = 24,
}: {
  name: React.ComponentProps<typeof Feather>["name"];
  size?: number;
}) {
  const box = size + 12; // padding around the icon circle
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

export default function CookLayout() {
  const router = useRouter();

  // Keep your original auth guard & role check (cook only)
  useEffect(() => {
    const check = () => {
      const u = getUser();
      if (!u) return router.replace("/(auth)/login");
      if (u.role !== "cook") router.replace("/");
    };
    const un = onAuthChange(check);
    check();
    return un;
  }, [router]);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
      screenOptions={{
        headerTitle: "Cook",
        drawerActiveTintColor: "#7A4F01",
        drawerActiveBackgroundColor: "rgba(255,193,7,0.12)",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen
        name="CookOverview"
        options={{
          title: "Cook Overview",
          drawerIcon: ({ size }) => <GradientIcon name="home" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="MyMenu"
        options={{
          title: "My Menu",
          drawerIcon: ({ size }) => <GradientIcon name="book-open" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="FoodPrepStatus"
        options={{
          title: "Food Prep Status",
          drawerIcon: ({ size }) => <GradientIcon name="clock" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="RawMaterialRequests"
        options={{
          title: "Raw Material Requests",
          drawerIcon: ({ size }) => <GradientIcon name="shopping-cart" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="RiderRequests"
        options={{
          title: "Rider Requests",
          drawerIcon: ({ size }) => <GradientIcon name="truck" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="Specials"
        options={{
          title: "Specials",
          drawerIcon: ({ size }) => <GradientIcon name="star" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="KitchenHelpers"
        options={{
          title: "Kitchen Helpers",
          drawerIcon: ({ size }) => <GradientIcon name="users" size={size ?? 24} />,
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
            // handled by handleSignOut if you wire it on a screen; keeping placeholder here
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
  // Reusable container for icon + badges if you add counts later
  iconContainer: {
    position: "relative",
  },
  countBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#ef4444",
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  countText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
});
