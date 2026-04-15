import 'server-only'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

/**
 * Client privilegiado (service_role). Bypassa RLS.
 *
 * ⚠️ SOMENTE importar em:
 *   - Route Handlers admin (após validar auth.getUser)
 *   - Cron endpoints (após validar CRON_SECRET)
 *
 * NUNCA importar em arquivo com `'use client'`.
 */
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
)
