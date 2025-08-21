// lib/usersStore.ts
import * as Crypto from "expo-crypto";
import { loadJSON, saveJSON } from "./storage";

export type Role = "superadmin" | "rider" | "cook" | "supervisor" | "refill";
export interface AppUser {
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
}

const USERS_KEY = "app.users.v1";
const SALT = "local-dev-salt-01"; // dev only

export async function hashPassword(pw: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pw + SALT);
}

export async function getAllUsers(): Promise<AppUser[]> {
  return loadJSON<AppUser[]>(USERS_KEY, []);
}

export async function createUser(u: Omit<AppUser, "passwordHash"> & { password: string }) {
  const users = await getAllUsers();
  if (users.some(x => x.email.toLowerCase() === u.email.toLowerCase())) {
    throw new Error("Email already exists.");
  }
  const passwordHash = await hashPassword(u.password);
  users.push({ email: u.email, name: u.name, role: u.role, passwordHash });
  await saveJSON(USERS_KEY, users);
}

export async function verifyCredentials(email: string, password: string) {
  const users = await getAllUsers();
  const u = users.find(x => x.email.toLowerCase() === email.toLowerCase());
  if (!u) return null;
  const h = await hashPassword(password);
  return h === u.passwordHash ? u : null;
}
