/**
 * Client-side auth helpers — thin wrappers around Convex HTTP client.
 * All state lives in localStorage (SESSION_KEY) and is read on mount.
 */
import { convex, getToken, setToken, clearToken, SESSION_KEY } from './convex';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';

export type User = {
  _id: Id<'users'>;
  email: string;
  username?: string;
  role?: 'creator' | 'business';
  state?: string;
  city?: string;
  isPro?: boolean;
  ordersCount?: number;
  rating?: number;
};

/** Send a 6-digit OTP to the given email address */
export async function sendOtp(email: string): Promise<void> {
  const res = await fetch('/api/send-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'failed to send otp');
  }
}

/** Verify OTP — stores session token, returns user + isNewUser flag */
export async function verifyOtp(
  email: string,
  code: string
): Promise<{ user: User; token: string; isNewUser: boolean }> {
  const result = await convex.mutation(api.auth.verifyOtp, { email, code });
  setToken(result.token);
  const user = await convex.query(api.users.getById, { userId: result.userId });
  return { user: user as User, token: result.token, isNewUser: result.isNewUser };
}

/** Get the current signed-in user from stored session token */
export async function getCurrentUser(): Promise<User | null> {
  const token = getToken();
  if (!token) return null;
  const user = await convex.query(api.users.getByToken, { token });
  return user as User | null;
}

/** Sign out — deletes session on server + clears local token */
export async function signOut(): Promise<void> {
  const token = getToken();
  if (token) {
    await convex.mutation(api.auth.signOut, { token });
  }
  clearToken();
}

export { getToken, setToken, clearToken, SESSION_KEY };
