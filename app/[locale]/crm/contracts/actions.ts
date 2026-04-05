'use server'

import { insertContract, updateContract, deleteContract, type Contract } from '@/lib/supabase/queries'
import { revalidatePath } from 'next/cache'

function bust() { revalidatePath('/', 'layout') }

export async function saveContractAction(contract: Contract) {
  if (contract.id.startsWith('ctr-') && contract.id.length > 10) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, created_at: _c, updated_at: _u, ...rest } = contract
    await insertContract(rest)
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, created_at: _c, updated_at: _u, ...rest } = contract
    await updateContract(id, rest)
  }
  bust()
}

export async function deleteContractAction(id: string) {
  await deleteContract(id)
  bust()
}
