'use server'

import { insertProvider, updateProvider, deleteProvider } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import type { Provider } from '@/data/mock-crm'

function bust() { revalidatePath('/', 'layout') }

export async function saveProviderAction(provider: Provider): Promise<{ data?: Provider; error?: string }> {
  try {
    if (provider.id.startsWith('prv-') && provider.id.length > 10) {
      // New provider — insert
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, ...rest } = provider
      const saved = await insertProvider(rest)
      bust()
      return { data: saved ?? provider }
    } else {
      // Existing provider — update
      const { id, ...rest } = provider
      await updateProvider(id, rest)
      // Don't revalidate on update — optimistic UI is already correct
      return { data: provider }
    }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Save failed' }
  }
}

export async function deleteProviderAction(id: string) {
  await deleteProvider(id)
  bust()
}
