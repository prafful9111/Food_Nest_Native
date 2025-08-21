// app/index.tsx
import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { getUser, onAuthChange } from "@/lib/authStore";

export default function Index() {
  const [user, setUser] = useState(getUser());

  useEffect(() => {
    return onAuthChange(() => setUser(getUser()));
  }, []);

  if (!user) return <Redirect href="/(auth)/login" />;

  if (user.role === "superadmin") {
    return <Redirect href="/roles/superadmin/overview" />;
  } else if (user.role === "rider") {
    return <Redirect href="/roles/rider/RiderOverview" />;
  } else if (user.role === "cook") {
    return <Redirect href="/roles/cook/CookOverview" />;
  } else if (user.role === "supervisor") {
    return <Redirect href="/roles/supervisor/SupervisorOverview" />;
  } else {
    return <Redirect href="/roles/refill/RefillCoordinatorOverview" />;
  }
}
