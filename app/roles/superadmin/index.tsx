import { useEffect } from "react";
import { router } from "expo-router";

export default function SuperAdminIndex() {
  useEffect(() => {
    router.replace("/roles/superadmin/overview");
  }, []);
  return null;
}
