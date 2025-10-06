import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase env (server): SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// Main source of truth: server-only admin client (constant singleton)
export const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

// Legacy compatibility - export as function for backward compat
export const supabaseAdmin = () => admin;
export const getServerClient = () => admin;
export default admin;
