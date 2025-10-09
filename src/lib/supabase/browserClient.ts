// Re-export shim: all imports now point to unified client.ts
export { client, supabase, getBrowserSupabase } from './client';
export { client as browserSupabase } from './client';