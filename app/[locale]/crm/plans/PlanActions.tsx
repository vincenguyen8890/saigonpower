'use client'

import { useState } from 'react'
import { PlusCircle, Pencil } from 'lucide-react'
import PlanModal from './PlanModal'
import DeletePlanButton from './DeletePlanButton'
import type { Plan } from '@/data/mock-crm'

interface Props {
  plan?: Plan    // row-level edit
  inline?: boolean  // render as row buttons vs page-level "Add" button
}

export default function PlanActions({ plan, inline }: Props) {
  const [open, setOpen] = useState(false)

  if (inline && plan) {
    return (
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setOpen(true)}
          title="Edit plan"
          className="p-1.5 text-gray-400 hover:text-brand-greenDark hover:bg-green-50 rounded-lg transition-colors"
        >
          <Pencil size={14} />
        </button>
        <DeletePlanButton planId={plan.id} planName={plan.name} />
        {open && <PlanModal plan={plan} onClose={() => setOpen(false)} />}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2 rounded-xl hover:bg-brand-green transition-colors"
      >
        <PlusCircle size={15} />
        Add Plan
      </button>
      {open && <PlanModal onClose={() => setOpen(false)} />}
    </>
  )
}
