'use client'

import { useState, useTransition } from 'react'
import {
  ShieldCheck, UserCheck, UserX, Pencil, Trash2,
  Plus, X, Loader2, Check, AlertCircle, Mail, Phone,
  Search, KeyRound,
} from 'lucide-react'
import type { CRMAgent } from '@/lib/supabase/queries'
import {
  updateUserRole, toggleUserActive, inviteUser, deleteUser, resetUserPassword,
} from '@/app/[locale]/crm/users/actions'

interface UsersClientProps {
  agents: CRMAgent[]
  currentEmail: string
}

const roleConfig: Record<string, { label: string; icon: React.ElementType; bg: string; text: string; border: string }> = {
  admin:          { label: 'Administrator',  icon: ShieldCheck, bg: 'bg-amber-50',   text: 'text-amber-700',  border: 'border-amber-200'  },
  office_manager: { label: 'Office Manager', icon: UserCheck,   bg: 'bg-blue-50',    text: 'text-blue-700',   border: 'border-blue-200'   },
  csr:            { label: 'CSR',            icon: UserCheck,   bg: 'bg-purple-50',  text: 'text-purple-700', border: 'border-purple-200' },
  agent:          { label: 'Sales Agent',    icon: UserCheck,   bg: 'bg-[#E8FFF1]',  text: 'text-[#00A846]',  border: 'border-[#A3F0C4]'  },
}

function UserRow({
  agent,
  isSelf,
  onRoleChange,
  onToggleActive,
  onDelete,
}: {
  agent: CRMAgent
  isSelf: boolean
  onRoleChange: (id: string, role: CRMAgent['role']) => Promise<void>
  onToggleActive: (id: string, active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<'saved' | 'error' | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [pwFeedback, setPwFeedback] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const rc = roleConfig[agent.role]
  const RoleIcon = rc.icon

  function act(fn: () => Promise<void>) {
    startTransition(async () => {
      await fn()
      setFeedback('saved')
      setTimeout(() => setFeedback(null), 2000)
    })
  }

  return (
    <>
    <tr className={`border-b border-slate-50 transition-colors ${agent.active ? 'hover:bg-slate-50' : 'bg-slate-50/60 opacity-60'}`}>
      {/* User info */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
            agent.role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-[#E8FFF1] text-[#00A846]'
          }`}>
            {(agent.name || agent.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0F172A]">
              {agent.name}
              {isSelf && (
                <span className="ml-2 text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full font-medium">you</span>
              )}
            </p>
            <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
              <Mail size={9} /> {agent.email}
            </p>
            {agent.phone && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <Phone size={9} /> {agent.phone}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <select
          value={agent.role}
          disabled={isSelf || isPending}
          onChange={e => act(() => onRoleChange(agent.id, e.target.value as CRMAgent['role']))}
          className={`text-[12px] font-semibold px-2.5 py-1.5 rounded-lg border appearance-none cursor-pointer transition-all disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 ${rc.bg} ${rc.text} ${rc.border}`}
        >
          <option value="admin">Administrator</option>
          <option value="office_manager">Office Manager</option>
          <option value="csr">CSR</option>
          <option value="agent">Sales Agent</option>
        </select>
      </td>

      {/* Type */}
      <td className="px-6 py-4 hidden md:table-cell">
        <span className="text-[12px] text-slate-500 capitalize">
          {agent.agent_type?.replace(/_/g, ' ') ?? '—'}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <button
          disabled={isSelf || isPending}
          onClick={() => act(() => onToggleActive(agent.id, !agent.active))}
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all disabled:cursor-not-allowed ${
            agent.active
              ? 'bg-[#E8FFF1] text-[#00A846] border-[#A3F0C4] hover:bg-red-50 hover:text-red-600 hover:border-red-200'
              : 'bg-red-50 text-red-600 border-red-200 hover:bg-[#E8FFF1] hover:text-[#00A846] hover:border-[#A3F0C4]'
          }`}
        >
          {agent.active ? <Check size={10} /> : <UserX size={10} />}
          {agent.active ? 'Active' : 'Inactive'}
        </button>
      </td>

      {/* Joined */}
      <td className="px-6 py-4 hidden lg:table-cell">
        <p className="text-[11px] text-slate-400">
          {new Date(agent.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end gap-2">
          {isPending && <Loader2 size={13} className="animate-spin text-slate-400" />}
          {feedback === 'saved' && <Check size={13} className="text-[#00C853]" />}
          {feedback === 'error' && <AlertCircle size={13} className="text-red-500" />}

          {!isSelf && (
            <>
              <button
                onClick={() => { setShowPasswordReset(v => !v); setNewPassword(''); setPwFeedback('idle') }}
                className="text-slate-300 hover:text-blue-500 transition-colors p-1 rounded"
                title="Reset password"
              >
                <KeyRound size={13} />
              </button>
              {showDeleteConfirm ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-500">Delete?</span>
                  <button
                    onClick={() => act(async () => { await onDelete(agent.id); setShowDeleteConfirm(false) })}
                    className="text-[11px] font-bold text-red-600 hover:text-red-700"
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-slate-300 hover:text-red-500 transition-colors p-1 rounded"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
    {showPasswordReset && (
      <tr className="bg-blue-50/40 border-b border-slate-50">
        <td colSpan={6} className="px-6 py-3">
          <div className="flex items-center gap-3">
            <KeyRound size={13} className="text-blue-500 flex-shrink-0" />
            <span className="text-[12px] font-medium text-slate-600 flex-shrink-0">New password for {agent.name}:</span>
            <input
              type="text"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="flex-1 max-w-[200px] px-2.5 py-1.5 text-[12px] bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button
              disabled={!newPassword || pwFeedback === 'saving'}
              onClick={() => {
                setPwFeedback('saving')
                resetUserPassword(agent.id, newPassword).then(r => {
                  setPwFeedback(r.ok ? 'saved' : 'error')
                  if (r.ok) { setTimeout(() => { setShowPasswordReset(false); setPwFeedback('idle') }, 1500) }
                })
              }}
              className="text-[12px] font-semibold bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {pwFeedback === 'saving' ? 'Saving…' : pwFeedback === 'saved' ? '✓ Saved' : 'Save'}
            </button>
            {pwFeedback === 'error' && <span className="text-[11px] text-red-500">Failed</span>}
            <button onClick={() => setShowPasswordReset(false)} className="text-slate-400 hover:text-slate-600 ml-auto">
              <X size={13} />
            </button>
          </div>
        </td>
      </tr>
    )}
  </>
  )
}

function InviteModal({ onClose, onInvited }: { onClose: () => void; onInvited: () => void }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'agent' as CRMAgent['role'], agent_type: 'electricity_broker' })
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await inviteUser(form)
      if (result.ok) {
        onInvited()
        onClose()
      } else {
        setError(result.error ?? 'Failed to invite user')
      }
    })
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-sm font-bold text-[#0F172A]">Invite Team Member</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
              <AlertCircle size={13} /> {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
              <input
                required
                type="text"
                placeholder="John Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email</label>
              <input
                required
                type="email"
                placeholder="john@saigonllc.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                type="tel"
                placeholder="(832) 000-0000"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as CRMAgent['role'] }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              >
                <option value="agent">Sales Agent</option>
                <option value="csr">CSR</option>
                <option value="office_manager">Office Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Agent Type</label>
              <select
                value={form.agent_type}
                onChange={e => setForm(f => ({ ...f, agent_type: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              >
                <option value="electricity_broker">Electricity Broker</option>
                <option value="realtor">Realtor</option>
                <option value="insurance_agent">Insurance Agent</option>
                <option value="independent">Independent</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#00C853] hover:bg-[#00A846] rounded-lg transition-colors disabled:opacity-60 shadow-sm"
            >
              {isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              {isPending ? 'Inviting…' : 'Add User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersClient({ agents: initial, currentEmail }: UsersClientProps) {
  const [agents, setAgents] = useState(initial)
  const [search, setSearch] = useState('')
  const [showInvite, setShowInvite] = useState(false)
  const [filterRole, setFilterRole] = useState<'all' | CRMAgent['role']>('all')

  const filtered = agents.filter(a => {
    const matchesSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = filterRole === 'all' || a.role === filterRole
    return matchesSearch && matchesRole
  })

  const adminCount = agents.filter(a => a.role === 'admin').length
  const agentCount = agents.filter(a => a.role === 'agent').length
  const activeCount = agents.filter(a => a.active).length

  async function handleRoleChange(id: string, role: CRMAgent['role']) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, role } : a))
    await updateUserRole(id, role)
  }

  async function handleToggleActive(id: string, active: boolean) {
    setAgents(prev => prev.map(a => a.id === id ? { ...a, active } : a))
    await toggleUserActive(id, active)
  }

  async function handleDelete(id: string) {
    setAgents(prev => prev.filter(a => a.id !== id))
    await deleteUser(id)
  }

  return (
    <>
      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={() => {
            // Optimistic: server will revalidate; refresh is handled via revalidatePath
            window.location.reload()
          }}
        />
      )}

      <div className="space-y-5 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Team Members</h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Manage CRM users, roles, and access
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="flex items-center gap-1.5 text-sm font-semibold bg-[#00C853] hover:bg-[#00A846] text-white px-4 py-2 rounded-lg transition-colors shadow-sm shadow-[#00C853]/20"
          >
            <Plus size={15} /> Invite User
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Users', value: agents.length, bg: 'bg-white', text: 'text-[#0F172A]' },
            { label: 'Admins',      value: adminCount,    bg: 'bg-amber-50', text: 'text-amber-700' },
            { label: 'Agents',      value: agentCount,    bg: 'bg-[#E8FFF1]', text: 'text-[#00A846]' },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-xl border border-slate-100 p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)]`}>
              <p className={`text-2xl font-bold tabular-nums ${s.text}`}>{s.value}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search users…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all"
              />
            </div>
            <div className="flex bg-slate-50 rounded-lg p-0.5 gap-0.5">
              {(['all', 'admin', 'office_manager', 'csr', 'agent'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => setFilterRole(r)}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-md transition-all ${
                    filterRole === r ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {r === 'all' ? 'All' : roleConfig[r].label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 ml-auto">{activeCount} active</p>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-50">
                {['User', 'Role', 'Type', 'Status', 'Joined', ''].map((h, i) => (
                  <th
                    key={i}
                    className={`text-left text-[10px] font-bold text-slate-400 uppercase tracking-wider px-6 py-3 ${
                      i === 2 ? 'hidden md:table-cell' : ''
                    } ${i === 4 ? 'hidden lg:table-cell' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-sm text-slate-500 font-medium">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map(agent => (
                  <UserRow
                    key={agent.id}
                    agent={agent}
                    isSelf={agent.email === currentEmail}
                    onRoleChange={handleRoleChange}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
