import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const expoExtra = Constants.expoConfig?.extra as
  | {
      SUPABASE_URL?: string;
      SUPABASE_ANON_KEY?: string;
    }
  | undefined;

const SUPABASE_URL = expoExtra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = expoExtra?.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.error(
    '[SUPABASE] Missing SUPABASE_URL or SUPABASE_ANON_KEY in Expo extra config. Mobile features that depend on Supabase will be unavailable.',
  );
}

export const supabase = createClient(
  SUPABASE_URL ?? 'https://example.supabase.co',
  SUPABASE_ANON_KEY ?? 'missing-anon-key',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  },
);
