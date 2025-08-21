// lib/api.ts
import { API_BASE_URL } from "@/constants/env";
import { getToken } from "./authStore";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...opts, headers });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

export const api = {
  get:  <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: any) => request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
};
