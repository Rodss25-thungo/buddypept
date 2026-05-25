import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client (uses the secret service-role key).
 *
 * ⚠️ NEVER import this into a client component. The service-role key has full
 * database access and must stay server-side: API routes / server code only.
 *
 * Environment variables are read INSIDE the function (not at module load) so
 * the production build succeeds even before the keys are configured. Only an
 * actual runtime call requires them.
 */
export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your environment.'
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
