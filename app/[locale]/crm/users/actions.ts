'use server'

import { getSession } from '@/lib/auth/session'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

function adminDb() {
  return createAdminClient()
}

function useMock() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder')
}

export async function updateUserRole(
  id: string,
  role: 'admin' | 'office_manager' | 'csr' | 'agent',
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const { error } = await adminDb().from('crm_agents').update({ role }).eq('id', id)
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to update role' }
  }
}

export async function toggleUserActive(
  id: string,
  active: boolean,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const { error } = await adminDb().from('crm_agents').update({ active }).eq('id', id)
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to update status' }
  }
}

export async function inviteUser(data: {
  name: string
  email: string
  phone: string
  role: 'admin' | 'office_manager' | 'csr' | 'agent'
  agent_type: string
}): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const { error } = await adminDb().from('crm_agents').insert({
      ...data,
      active: true,
      notes: null,
    })
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to invite user' }
  }
}

export async function deleteUser(id: string): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const { error } = await adminDb().from('crm_agents').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to delete user' }
  }
}

/** Returns the plaintext env-var password for a given email, if one exists. */
function getEnvPasswordForEmail(email: string): string | null {
  const lower = email.toLowerCase().trim()
  if (process.env.ADMIN_EMAIL?.toLowerCase().trim() === lower)          return process.env.ADMIN_PASSWORD ?? null
  if (process.env.AGENT_EMAIL?.toLowerCase().trim() === lower)          return process.env.AGENT_PASSWORD ?? null
  if (process.env.OFFICE_MANAGER_EMAIL?.toLowerCase().trim() === lower) return process.env.OFFICE_MANAGER_PASSWORD ?? null
  if (process.env.CSR_EMAIL?.toLowerCase().trim() === lower)            return process.env.CSR_PASSWORD ?? null
  if (process.env.CRM_USERS) {
    try {
      const users = JSON.parse(process.env.CRM_USERS) as Array<{ email: string; password: string }>
      const match = users.find(u => u.email.toLowerCase().trim() === lower)
      if (match) return match.password
    } catch { /* ignore */ }
  }
  return null
}

export async function updateUser(
  id: string,
  data: {
    name?: string
    email?: string
    phone?: string
    role?: 'admin' | 'office_manager' | 'csr' | 'agent'
    agent_type?: string
  },
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const db = adminDb()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = { ...data }

    // When email changes, migrate env-var password → crm_agents.password so
    // the user can log in with their new email using the same password.
    if (data.email) {
      const { data: current } = await db.from('crm_agents').select('email').eq('id', id).single()
      if (current?.email && current.email.toLowerCase() !== data.email.toLowerCase()) {
        const envPw = getEnvPasswordForEmail(current.email)
        if (envPw) updateData.password = envPw
      }
    }

    const { error } = await db.from('crm_agents').update(updateData).eq('id', id)
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to update user' }
  }
}

export async function resetUserPassword(
  id: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const session = await getSession()
  if (!session || session.role !== 'admin') return { ok: false, error: 'Unauthorized' }

  if (useMock()) return { ok: true }

  try {
    const { error } = await adminDb()
      .from('crm_agents')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .update({ password: newPassword } as any)
      .eq('id', id)
    if (error) throw error
    revalidatePath('/crm/users')
    return { ok: true }
  } catch (e) {
    console.error(e)
    return { ok: false, error: 'Failed to reset password' }
  }
}
