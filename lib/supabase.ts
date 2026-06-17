import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'http://127.0.0.1:54321';
const fallbackSupabaseAnonKey = 'missing-supabase-anon-key';

const configuredSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const configuredSupabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(configuredSupabaseUrl && configuredSupabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.'
  );
}

export const supabase = createClient(
  configuredSupabaseUrl || fallbackSupabaseUrl,
  configuredSupabaseAnonKey || fallbackSupabaseAnonKey
);
