'use client'

import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, AlertTriangle, Clock, Copy, Check, PhoneCall } from 'lucide-react'
import type { RenewalSummary, RenewalAlert } from '@/app/api/ai/renewals/route'

const urgencyConfig = {
  critical: { badge: 'bg-red-100 text-red-700 border border-red-200',      bar: 'bg-red-400'    },
  high:     { badge: 'bg-amber-100 text-amber-700 border border-amber-200', bar: 'bg-amber-400'  },
  medium:   { badge: 'bg-blue-50 text-blue-600 border border-blue-200',     bar: 'bg-blue-400'   },
}

function RenewalCard({ contract }: { contract: RenewalAlert }) {
  const cfg = urgencyConfig[contract.urgency]
  const [copied, setCopied] = useState(false)
  const [logging, setLogging] = useState(false)
  const [logged, setLogged] = useState(false)

  function copy() {
    navigator.clipboard.writeText(contract.outreach_message).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function logContact() {
    setLogging(true)
    try {
      await fetch('/api/crm/activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'call',
          title: contract.task_title,
          description: `Renewal outreach — ${contract.provider} contract expires in ${contract.days_remaining} days (${contract.end_date}).`,
          due_date: new Date(Date.now() + 86400000).toISOString(), // due tomorrow
        }),
      })
      setLogged(true)
    } catch {
      // silent fail
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="p-4 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-[#0F172A] truncate">{contract.customer_name}</p>
          <p className="text-[11px] text-slate-400">{contract.provider} · {contract.plan_name ?? 'Unknown plan'}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cfg.badge}`}>
            <Clock size={9} />
            {contract.days_remaining}d
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${cfg.badge}`}>
            {contract.urgency}
          </span>
        </div>
      </div>

      {/* Outreach message */}
      <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Outreach</span>
          <button
            onClick={copy}
            className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600"
          >
            {copied ? <Check size={10} className="text-[#00C853]" /> : <Copy size={10} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed">{contract.outreach_message}</p>
      </div>

      {/* Log contact button */}
      <button
        onClick={logContact}
        disabled={logging || logged}
        className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors ${
          logged
            ? 'bg-[#E8FFF1] text-[#00A846] border border-[#A3F0C4]'
            : 'bg-slate-50 hover:bg-[#EBF2FF] text-slate-500 hover:text-[#2979FF] border border-slate-200 hover:border-[#93B4FF]'
        } disabled:opacity-60`}
      >
        {logging
          ? <Loader2 size={11} className="animate-spin" />
          : logged
            ? <Check size={11} />
            : <PhoneCall size={11} />
        }
        {logged ? 'Task logged to Work Queue' : 'Log Contact Task'}
      </button>
    </div>
  )
}

export default function RenewalAlerts() {
  const [data, setData] = useState<RenewalSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/ai/renewals')
      if (!res.ok) throw new Error()
      setData(await res.json())
    } catch {
      setError('Failed to load renewal data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const critical = data?.contracts.filter(c => c.urgency === 'critical') ?? []
  const rest = data?.contracts.filter(c => c.urgency !== 'critical') ?? []

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Renewal Alerts</p>
          {data && (
            <p className="text-xs text-slate-400 mt-0.5">
              {data.contracts.length} contract{data.contracts.length !== 1 ? 's' : ''} expiring
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {critical.length > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full">
              <AlertTriangle size={9} />
              {critical.length} critical
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400 py-4">
            <Loader2 size={15} className="animate-spin" />
            <span className="text-sm">Scanning contracts…</span>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-4">{error}</p>
        ) : data?.contracts.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">No contracts expiring in the next 60 days.</p>
        ) : (
          <>
            {data?.summary && (
              <p className="text-xs text-slate-500 mb-4 bg-slate-50 rounded-lg px-3 py-2.5 leading-relaxed">
                {data.summary}
              </p>
            )}
            <div className="space-y-2.5">
              {[...critical, ...rest].map(contract => (
                <RenewalCard key={contract.id} contract={contract} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
