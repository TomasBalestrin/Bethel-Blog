import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

/**
 * Client privilegiado (service_role). Bypassa RLS.
 *
 * ⚠️ SOMENTE importar em:
 *   - Route Handlers admin (após validar auth.getUser)
 *   - Cron endpoints (após validar CRON_SECRET)
 *
 * NUNCA importar em arquivo com `'use client'`.
 *
 * Inicialização lazy via Proxy — o client real só é construído no
 * primeiro uso de propriedade. Isso evita crash na fase "Collecting
 * page data" do Next build quando as env vars não estão presentes
 * (ex: primeiro deploy, ambiente de preview sem secrets).
 */
let instance: SupabaseClient<Database> | null = null

function getInstance(): SupabaseClient<Database> {
  if (instance) return instance

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL ausente no ambiente')
  if (!serviceKey)
    throw new Error('SUPABASE_SERVICE_ROLE_KEY ausente no ambiente')

  instance = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
  return instance
}

export const supabaseAdmin = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    const client = getInstance()
    const value = Reflect.get(client, prop, client)
    return typeof value === 'function' ? value.bind(client) : value
  },
})
