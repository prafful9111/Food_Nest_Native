import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useMemo, useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function RefillCoordinatorLayout() {
  const router = useRouter();

  const [rcName, setRcName] = useState<string>("");
  const [rcEmail, setRcEmail] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const parsed = JSON.parse(raw);
          setRcName(parsed?.name || parsed?.email || "");
          setRcEmail(parsed?.email || "");
        }
      } catch {
        setRcName("");
        setRcEmail("");
      }
    })();
  }, []);

  const initials = useMemo(() => {
    const base = (rcName || rcEmail || "User").trim();
    const parts = base.split(/\s+/);
    const a = parts[0]?.[0] || "U";
    const b = parts[1]?.[0] || "";
    return (a + b).toUpperCase();
  }, [rcName, rcEmail]);

  const HeaderTitle = () => (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Pressable
        onPress={() => router.push("/roles/refill/profile")}
        style={{ marginRight: 10 }}
        accessibilityLabel="Open profile"
      >
        <LinearGradient
          colors={["#FFC107", "#FFA000"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.avatar}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </LinearGradient>
      </Pressable>

      <Text style={styles.headerTitleText}>
        {rcName ? `Welcome ${rcName}` : "Welcome Refill Coordinator"}
      </Text>
    </View>
  );

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  return (
    <Drawer
      screenOptions={{
        headerTitle: () => <HeaderTitle />,
        headerTitleAlign: "left",
        drawerActiveTintColor: "#7A4F01",
        drawerActiveBackgroundColor: "rgba(255,193,7,0.12)",
      }}
    >
      {/* NEW: Profile item */}
      <Drawer.Screen
        name="profile"
        options={{
          title: "Profile",
          drawerIcon: ({ size }) => <GradientIcon name="user" size={size ?? 24} />,
        }}
      />

      {/* Map file routes to drawer items */}
      <Drawer.Screen
        name="RefillCoordinatorOverview"
        options={{
          title: "Refill Coordinator Overview",
          drawerIcon: ({ size }) => <GradientIcon name="home" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="RefillRequests"
        options={{
          title: "Refill Requests",
          drawerIcon: ({ size }) => <GradientIcon name="refresh-cw" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="InventoryStatus"
        options={{
          title: "Inventory Status",
          drawerIcon: ({ size }) => <GradientIcon name="bar-chart-2" size={size ?? 24} />,
        }}
      />
      <Drawer.Screen
        name="CookCoordination"
        options={{
          title: "Cook Coordination",
          drawerIcon: ({ size }) => <GradientIcon name="users" size={size ?? 24} />,
        }}
      />

      {/* Sign Out (optional if Profile includes it) */}
      <Drawer.Screen
        name="signout"
        options={{
          title: "Sign Out",
          drawerItemStyle: { marginTop: "auto" },
          drawerIcon: ({ size }) => <GradientIcon name="log-out" size={size ?? 24} />,
        }}
        listeners={{
          focus: handleSignOut,
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
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  avatarText: {
    color: "#fff",
    fontWeight: "700",
  },
  headerTitleText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1f2937",
  },
});
