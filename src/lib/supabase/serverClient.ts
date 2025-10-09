// Re-export shim: all imports now point to unified admin.ts
export { admin, supabaseAdmin, getServerClient } from './admin';
export const createServerSupabase = () => {
  const { admin } = require('./admin');
  return admin;
};
export const sbServer = createServerSupabase;
