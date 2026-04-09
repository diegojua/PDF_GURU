import 'react-native-url-polyfill/auto';
import Constants from 'expo-constants';
import { createClient } from '@supabase/supabase-js';

const expoExtra = Constants.expoConfig?.extra as {
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
} | undefined;

const SUPABASE_URL = expoExtra?.SUPABASE_URL;
const SUPABASE_ANON_KEY = expoExtra?.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase public keys are not configured. Update mobile_app/.env and restart Expo.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: false,
  },
});
