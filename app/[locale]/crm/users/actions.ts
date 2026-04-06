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
  role: 'admin' | 'agent',
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
  role: 'admin' | 'agent'
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
