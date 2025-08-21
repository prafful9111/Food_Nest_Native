import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { bootstrapAuth, getUser, onAuthChange } from "@/lib/authStore";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    (async () => {
      await bootstrapAuth();
      setUser(getUser());
      setReady(true);
    })();
    return onAuthChange(() => setUser(getUser()));
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!user) return <Redirect href="/(auth)/login" />;

  switch (user.role) {
    case "superadmin": return <Redirect href="/roles/superadmin/overview" />;
    case "rider":      return <Redirect href="/roles/rider/RiderOverview" />;
    case "cook":       return <Redirect href="/roles/cook/CookOverview" />;
    case "supervisor": return <Redirect href="/roles/supervisor/SupervisorOverview" />;
    default:           return <Redirect href="/roles/refill/RefillCoordinatorOverview" />;
  }
}
