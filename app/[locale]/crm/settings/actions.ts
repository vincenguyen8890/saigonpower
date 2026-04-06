'use server'

import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'

export interface SettingsPayload {
  section: string
  data: Record<string, string | boolean>
}

export async function saveSettings(payload: SettingsPayload): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return { ok: false, error: 'Unauthorized' }
  }

  try {
    // In mock / no-DB mode just return success so the UI stays functional
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
    if (supabaseUrl.includes('placeholder') || !supabaseUrl) {
      // Simulate a short save delay in dev
      await new Promise(r => setTimeout(r, 400))
      return { ok: true }
    }

    // With a live Supabase project, upsert into a settings table keyed by section
    const db = createAdminClient()
    const { error } = await db.from('crm_settings').upsert(
      { section: payload.section, data: payload.data, updated_by: session.email, updated_at: new Date().toISOString() },
      { onConflict: 'section' },
    )
    if (error) throw error
    return { ok: true }
  } catch (err) {
    console.error('saveSettings error:', err)
    return { ok: false, error: 'Failed to save. Please try again.' }
  }
}
