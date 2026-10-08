import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://wcjzxpletzyouxrmkcwp.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export function getSupabaseClient(): SupabaseClient {
  if (!supabaseServiceKey) {
    console.warn('[Supabase Warning] SUPABASE_SERVICE_ROLE_KEY is not set in environment variables.');
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
