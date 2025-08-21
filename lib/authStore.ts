// lib/authStore.ts
type Role = "superadmin" | "rider" | "cook" | "supervisor" | "refill";

export interface AuthUser {
  email: string;
  name?: string;
  role: Role;
}

let currentUser: AuthUser | null = null;

// Tiny cross-platform pub/sub (works on Hermes)
const listeners = new Set<() => void>();
function notify() {
  for (const l of Array.from(listeners)) {
    try { l(); } catch {}
  }
}

export function getUser() {
  return currentUser;
}

export function onAuthChange(cb: () => void) {
  listeners.add(cb);
  // IMPORTANT: return void, not boolean
  return () => { listeners.delete(cb); };
}

export function signIn(user: AuthUser) {
  currentUser = user;
  notify();
}

export function signOut() {
  currentUser = null;
  notify();
}
