// lib/requestsStore.ts
import { loadJSON, saveJSON } from "./storage";
import { Role, createUser } from "./usersStore";

export interface RegistrationRequest {
  id: string;
  email: string;
  name: string;
  role: Role;
  password: string; // dev only; we'll hash on approve
  createdAt: number;
}

const REQ_KEY = "app.registration.requests.v1";

export async function listRequests(): Promise<RegistrationRequest[]> {
  return loadJSON<RegistrationRequest[]>(REQ_KEY, []);
}

export async function addRequest(r: Omit<RegistrationRequest, "id" | "createdAt">) {
  const items = await listRequests();
  const id = String(Date.now());
  items.unshift({ ...r, id, createdAt: Date.now() });
  await saveJSON(REQ_KEY, items);
}

export async function removeRequest(id: string) {
  const items = await listRequests();
  await saveJSON(REQ_KEY, items.filter(x => x.id !== id));
}

export async function approveRequest(id: string) {
  const items = await listRequests();
  const req = items.find(x => x.id === id);
  if (!req) throw new Error("Request not found.");
  // create the user using same creds
  await createUser({ email: req.email, name: req.name, role: req.role, password: req.password });
  await removeRequest(id);
}

export async function declineRequest(id: string) {
  await removeRequest(id);
}
