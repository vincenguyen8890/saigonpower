'use server'

import { insertProvider, updateProvider, deleteProvider } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'
import type { Provider } from '@/data/mock-crm'

function bust() { revalidatePath('/', 'layout') }

export async function saveProviderAction(provider: Provider) {
  if (provider.id.startsWith('prv-') && provider.id.length > 10) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...rest } = provider
    const saved = await insertProvider(rest)
    bust()
    return saved
  } else {
    const { id, ...rest } = provider
    await updateProvider(id, rest)
    bust()
    return provider
  }
}

export async function deleteProviderAction(id: string) {
  await deleteProvider(id)
  bust()
}
