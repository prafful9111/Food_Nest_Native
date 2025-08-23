import { Drawer } from "expo-router/drawer";
import { useRouter } from "expo-router";
import { getUser, onAuthChange, signOut } from "@/lib/authStore";
import { useEffect } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function CookLayout() {

const router = useRouter();

useEffect(() => {
  const check = () => {
    const u = getUser();
    if (!u) return router.replace("/(auth)/login");
    if (u.role !== "cook") router.replace("/");
  };
  const un = onAuthChange(check); check(); return un;
}, [router]);

const handleSignOut = () => {
  signOut();
  router.replace("/(auth)/login");
};

  return (
    <Drawer
      screenOptions={{
        headerTitle: "Cook",
      }}
    >
      {/* Map file routes to drawer items with nice titles */}
      <Drawer.Screen 
        name="CookOverview" 
        options={{ 
          title: "Cook Overview",
          drawerIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="MyMenu" 
        options={{ 
          title: "My Menu",
          drawerIcon: ({ color, size }) => (
            <Feather name="book-open" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="FoodPrepStatus" 
        options={{ 
          title: "Food Prep Status",
          drawerIcon: ({ color, size }) => (
            <Feather name="clock" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="RawMaterialRequests" 
        options={{ 
          title: "Raw Material Requests",
          drawerIcon: ({ color, size }) => (
            <Feather name="shopping-cart" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="RiderRequests" 
        options={{ 
          title: "Rider Requests",
          drawerIcon: ({ color, size }) => (
            <Feather name="truck" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="Specials" 
        options={{ 
          title: "Specials",
          drawerIcon: ({ color, size }) => (
            <Feather name="star" size={size} color={color} />
          ),
        }} 
      />
      <Drawer.Screen 
        name="KitchenHelpers" 
        options={{ 
          title: "Kitchen Helpers",
          drawerIcon: ({ color, size }) => (
            <Feather name="users" size={size} color={color} />
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
