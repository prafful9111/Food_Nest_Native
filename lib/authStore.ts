// lib/authStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

type Role = "superadmin" | "rider" | "cook" | "supervisor" | "refill";
export interface AuthUser { email: string; name?: string; role: Role; }
interface AuthSession { user: AuthUser; token: string; }

const listeners = new Set<() => void>();
let session: AuthSession | null = null;
const KEY_TOKEN = "auth.token";
const KEY_USER  = "auth.user";

function notify() { for (const cb of Array.from(listeners)) try { cb(); } catch {} }

export function onAuthChange(cb: () => void) { listeners.add(cb); return () => { listeners.delete(cb); }; }
export function getUser()  { return session?.user ?? null; }
export function getToken() { return session?.token ?? null; }

export async function bootstrapAuth() {
  const [token, rawUser] = await Promise.all([
    AsyncStorage.getItem(KEY_TOKEN),
    AsyncStorage.getItem(KEY_USER),
  ]);
  if (token && rawUser) {
    try {
      const user = JSON.parse(rawUser) as AuthUser;
      session = { user, token }; notify();
    } catch { await clearAuth(); }
  }
}

export async function signInWithToken(user: AuthUser, token: string) {
  session = { user, token };
  await Promise.all([
    AsyncStorage.setItem(KEY_TOKEN, token),
    AsyncStorage.setItem(KEY_USER, JSON.stringify(user)),
  ]);
  notify();
}

// Legacy superadmin-only local login (kept for compatibility, not used now)
export async function signIn(user: AuthUser) {
  await signInWithToken(user, ""); // no token
}

export async function signOut() {
  await clearAuth(); notify();
}

async function clearAuth() {
  session = null;
  await Promise.all([AsyncStorage.removeItem(KEY_TOKEN), AsyncStorage.removeItem(KEY_USER)]);
}
