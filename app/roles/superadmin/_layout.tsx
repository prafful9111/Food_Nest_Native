import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { signOut } from "@/lib/authStore";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { api } from "@/lib/api";

export default function SuperAdminLayout() {
  const router = useRouter();
  const [pendingRequests, setPendingRequests] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/login");
  };

  // Function to refresh pending requests count
  const refreshPendingCount = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching pending requests count...');
      const data = await api.get<{ count: number }>('/api/admin/requests/count');
      console.log('Received data:', data);
      setPendingRequests(data.count);
    } catch (error) {
      console.error('Error fetching pending requests count:', error);
      // Keep the previous count on error, but set to 0 if this is the first call
      if (pendingRequests === 0) {
        setPendingRequests(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch pending registration requests count
  useEffect(() => {
    refreshPendingCount();
    // Refresh every 30 seconds
    const interval = setInterval(refreshPendingCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Drawer
      screenOptions={{
        headerTitle: "SuperAdmin",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen 
        name="overview" 
        options={{ 
          title: "Overview",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }} 
      />
      
      {/* Custom User Management with notification dot */}
      <Drawer.Screen
        name="user-management"
        options={{
          title: `User Management${pendingRequests > 0 ? ` (${pendingRequests} pending)` : ''}`,
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Feather name="users" size={size} color={color} />
              {pendingRequests > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{pendingRequests}</Text>
                </View>
              )}
            </View>
          ),
        }}
        listeners={{
          focus: () => {
            // Refresh pending requests count when screen is focused
            refreshPendingCount();
          },
        }}
      />
      
      <Drawer.Screen 
        name="food-items" 
        options={{ 
          title: "Food Items",
          drawerIcon: ({ color, size }) => (
            <Feather name="coffee" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="inventory" 
        options={{ 
          title: "Inventory",
          drawerIcon: ({ color, size }) => (
            <Feather name="package" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="routes-management" 
        options={{ 
          title: "Routes Management",
          drawerIcon: ({ color, size }) => (
            <Feather name="map" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="team-management" 
        options={{ 
          title: "Team Management",
          drawerIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="combos-management" 
        options={{ 
          title: "Combos Management",
          drawerIcon: ({ color, size }) => (
            <Feather name="layers" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="vehicles-management" 
        options={{ 
          title: "Vehicles Management",
          drawerIcon: ({ color, size }) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="analytics" 
        options={{ 
          title: "Analytics",
          drawerIcon: ({ color, size }) => (
            <Feather name="bar-chart-2" size={size} color={color} />
          ),
        }} 
      />

      {/* Custom Signout Button */}
      <Drawer.Screen
        name="signout"
        options={{
          title: "Sign Out",
          drawerItemStyle: { marginTop: 'auto' },
          drawerIcon: ({ color, size }) => (
            <Feather name="log-out" size={size} color={color} />
          ),
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
  iconContainer: {
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    borderWidth: 1,
    borderColor: '#fff',
  },
  countBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
