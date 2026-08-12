import { ConvexHttpClient } from 'convex/browser';

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL!;

// Singleton HTTP client for use in client components
export const convex = new ConvexHttpClient(convexUrl);

// Session token key in localStorage
export const SESSION_KEY = 'mpy_session_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(SESSION_KEY);
}

export function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_KEY, token);
}

export function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_KEY);
}
