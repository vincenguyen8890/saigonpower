'use client'

import { useState, useTransition } from 'react'
import { UserPlus, X, Loader2, Shield, UserCheck, Phone, Mail, Pencil, Trash2, ToggleLeft, ToggleRight, TrendingUp, Users, CheckCircle2, Briefcase, DollarSign } from 'lucide-react'
import { saveAgentAction, toggleAgentAction, deleteAgentAction } from './actions'
import type { CRMAgent } from '@/lib/supabase/queries'

interface AgentStats {
  email: string
  leads: number
  deals: number
  enrolled: number
}

interface Props {
  agents: CRMAgent[]
  stats: AgentStats[]
}

const AGENT_TYPES = [
  { value: 'inside_agent',    label: 'Inside Agent' },
  { value: 'outside_agent',   label: 'Outside Agent' },
  { value: 'realtor',         label: 'Realtor' },
  { value: 'loan_officer',    label: 'Loan Officer' },
  { value: 'insurance_agent', label: 'Insurance Agent' },
]

const REFERRAL_FEE: Record<string, number> = {
  inside_agent: 5,
}
const DEFAULT_REFERRAL_FEE = 20

function getReferralFee(agentType: string) {
  return agentType ? (REFERRAL_FEE[agentType] ?? DEFAULT_REFERRAL_FEE) : null
}

const AVATAR_COLORS = [
  'bg-blue-500','bg-purple-500','bg-emerald-500','bg-amber-500',
  'bg-pink-500','bg-indigo-500','bg-teal-500','bg-orange-500',
]

function getAvatarColor(email: string) {
  let h = 0
  for (let i = 0; i < email.length; i++) h = email.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  const p = name.trim().split(/\s+/)
  return p.length >= 2 ? (p[0][0] + p[p.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

function AgentModal({ agent, onClose }: { agent?: CRMAgent; onClose: () => void }) {
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState({
    name:       agent?.name       ?? '',
    email:      agent?.email      ?? '',
    role:       agent?.role       ?? 'agent' as 'admin' | 'agent',
    agent_type: agent?.agent_type ?? '',
    phone:      agent?.phone      ?? '',
    notes:      agent?.notes      ?? '',
    active:     agent?.active     ?? true,
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await saveAgentAction({
        id:         agent?.id,
        name:       form.name,
        email:      form.email,
        role:       form.role,
        agent_type: form.agent_type || null,
        phone:      form.phone || null,
        notes:      form.notes || null,
        active:     form.active,
      })
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold text-gray-900 text-lg">{agent ? 'Edit Agent' : 'Add Agent'}</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Full Name *</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-600 block mb-1">Email *</label>
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Agent Type</label>
              <select value={form.agent_type} onChange={e => setForm(f => ({ ...f, agent_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green">
                <option value="">— select type —</option>
                {AGENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Referral Fee</label>
              <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-700 flex items-center gap-1.5">
                <DollarSign size={13} className="text-green-600" />
                {form.agent_type
                  ? <span className="font-medium text-green-700">${getReferralFee(form.agent_type)} <span className="font-normal text-gray-400">per customer</span></span>
                  : <span className="text-gray-400">Select type first</span>
                }
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 block mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">Notes</label>
            <textarea rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green resize-none" />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={isPending} className="flex-1 bg-brand-greenDark text-white rounded-xl py-2.5 text-sm hover:bg-brand-green disabled:opacity-50 flex items-center justify-center gap-1.5 font-medium">
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              {agent ? 'Save Changes' : 'Add Agent'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AgentCard({ agent, agentStats }: { agent: CRMAgent; agentStats: AgentStats | undefined }) {
  const [isPending, startTransition] = useTransition()
  const [editing, setEditing] = useState(false)

  const avatarBg = getAvatarColor(agent.email)
  const initials  = getInitials(agent.name)
  const s = agentStats ?? { leads: 0, deals: 0, enrolled: 0 }

  function handleToggle() {
    startTransition(() => toggleAgentAction(agent.id, !agent.active))
  }

  function handleDelete() {
    if (!confirm(`Remove ${agent.name} from the team?`)) return
    startTransition(() => deleteAgentAction(agent.id))
  }

  return (
    <>
      <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${agent.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl ${avatarBg} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
              {initials}
            </div>
            <div>
              <p className="font-semibold text-gray-900">{agent.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                  agent.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                }`}>
                  {agent.role === 'admin' ? <Shield size={10} /> : <UserCheck size={10} />}
                  {agent.role === 'admin' ? 'Admin' : 'Agent'}
                </span>
                {!agent.active && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={handleDelete} disabled={isPending} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Agent type + referral fee */}
        {agent.agent_type && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Briefcase size={12} className="text-gray-400 flex-shrink-0" />
              <span className="text-xs text-gray-500 capitalize">{AGENT_TYPES.find(t => t.value === agent.agent_type)?.label ?? agent.agent_type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-green-700">
              <DollarSign size={11} />
              <span>${getReferralFee(agent.agent_type)}/customer</span>
            </div>
          </div>
        )}

        {/* Contact info */}
        <div className="space-y-1.5 mb-4">
          <a href={`mailto:${agent.email}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
            <Mail size={12} className="flex-shrink-0" />
            <span className="truncate">{agent.email}</span>
          </a>
          {agent.phone && (
            <a href={`tel:${agent.phone}`} className="flex items-center gap-2 text-xs text-gray-500 hover:text-brand-greenDark transition-colors">
              <Phone size={12} className="flex-shrink-0" />
              {agent.phone}
            </a>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center bg-blue-50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Users size={11} className="text-blue-500" />
              <p className="text-base font-bold text-blue-700">{s.leads}</p>
            </div>
            <p className="text-xs text-gray-500">Leads</p>
          </div>
          <div className="text-center bg-purple-50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <TrendingUp size={11} className="text-purple-500" />
              <p className="text-base font-bold text-purple-700">{s.deals}</p>
            </div>
            <p className="text-xs text-gray-500">Deals</p>
          </div>
          <div className="text-center bg-green-50 rounded-xl p-2">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 size={11} className="text-green-500" />
              <p className="text-base font-bold text-green-700">{s.enrolled}</p>
            </div>
            <p className="text-xs text-gray-500">Enrolled</p>
          </div>
        </div>

        {/* Active toggle */}
        <button
          onClick={handleToggle}
          disabled={isPending}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 transition-colors w-full disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : agent.active ? (
            <ToggleRight size={18} className="text-green-500" />
          ) : (
            <ToggleLeft size={18} className="text-gray-400" />
          )}
          {agent.active ? 'Active — click to deactivate' : 'Inactive — click to activate'}
        </button>
      </div>

      {editing && <AgentModal agent={agent} onClose={() => setEditing(false)} />}
    </>
  )
}

export default function AgentsClient({ agents, stats }: Props) {
  const [showModal, setShowModal] = useState(false)

  const activeCount   = agents.filter(a => a.active).length
  const totalLeads    = stats.reduce((s, a) => s + a.leads, 0)
  const totalDeals    = stats.reduce((s, a) => s + a.deals, 0)
  const totalEnrolled = stats.reduce((s, a) => s + a.enrolled, 0)

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Agents</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active · {agents.length} total
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green transition-colors font-medium"
        >
          <UserPlus size={15} />
          Add Agent
        </button>
      </div>

      {/* Team summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Leads Assigned', value: totalLeads,    color: 'text-blue-700',   bg: 'bg-blue-50'   },
          { label: 'Active Deals',         value: totalDeals,    color: 'text-purple-700', bg: 'bg-purple-50' },
          { label: 'Total Enrolled',       value: totalEnrolled, color: 'text-green-700',  bg: 'bg-green-50'  },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Agent cards */}
      {agents.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center text-gray-400">
          <UserPlus size={40} className="mx-auto mb-3 opacity-30" />
          <p>No agents yet</p>
          <button onClick={() => setShowModal(true)} className="mt-2 text-sm text-brand-green hover:underline">
            Add your first agent →
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {agents.map(agent => (
            <AgentCard
              key={agent.id}
              agent={agent}
              agentStats={stats.find(s => s.email === agent.email)}
            />
          ))}
        </div>
      )}

      {showModal && <AgentModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
