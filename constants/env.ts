// constants/env.ts
import { Platform } from "react-native";

// Android emulator must use 10.0.2.2 to reach your computer.
export const API_BASE_URL =
  Platform.OS === "android" ? "http://10.0.2.2:1900" : "http://localhost:1900";
// If you test on a physical phone, replace both with: http://<YOUR_PC_LAN_IP>:1900
