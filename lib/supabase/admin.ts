import { createClient } from '@supabase/supabase-js'

/**
 * Server-only admin client using the service role key.
 * Bypasses RLS — use only in server actions and API routes.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!key || key === 'your_service_role_key_here') {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
