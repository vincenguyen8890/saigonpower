'use client'

import { useState } from 'react'
import { Loader2, MessageSquare, Mail, ChevronDown, ChevronUp, Check, RefreshCw } from 'lucide-react'
import type { FollowUpDraft } from '@/app/api/ai/followup/route'
import { getLeads } from '@/lib/supabase/queries'

interface DraftItem {
  id: string
  name: string
  type: 'lead' | 'renewal'
  status: string
  service_type?: string
  draft: FollowUpDraft | null
  loading: boolean
  expanded: boolean
  approved: boolean
}

// We fetch leads client-side to populate the draft list
export default function DraftActions() {
  const [items, setItems] = useState<DraftItem[]>([])
  const [fetching, setFetching] = useState(false)
  const [loaded, setLoaded] = useState(false)

  async function loadDrafts() {
    setFetching(true)
    try {
      const res = await fetch('/api/crm/leads/export?status=new&service=all')
      // Use the /api/ai/daily-summary to get lead names we should draft for
      const summaryRes = await fetch('/api/ai/daily-summary')
      const summary = await summaryRes.json()

      const leadPriorities = (summary.priorities ?? [])
        .filter((p: { type: string }) => p.type === 'lead')
        .slice(0, 4)

      const draftItems: DraftItem[] = leadPriorities.map((p: { id: string; title: string; type: string }) => ({
        id: p.id,
        name: p.title.replace('New lead: ', '').split('—')[0].trim(),
        type: 'lead' as const,
        status: 'new',
        draft: null,
        loading: false,
        expanded: false,
        approved: false,
      }))

      setItems(draftItems)
      setLoaded(true)
      void res // suppress unused var
    } catch {
      setLoaded(true)
    } finally {
      setFetching(false)
    }
  }

  async function generateDraft(index: number) {
    const item = items[index]
    setItems(prev => prev.map((it, i) => i === index ? { ...it, loading: true } : it))

    try {
      const res = await fetch('/api/ai/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: item.type,
          name: item.name,
          status: item.status,
          service_type: item.service_type ?? 'residential',
        }),
      })
      const draft: FollowUpDraft = await res.json()
      setItems(prev => prev.map((it, i) => i === index ? { ...it, draft, loading: false, expanded: true } : it))
    } catch {
      setItems(prev => prev.map((it, i) => i === index ? { ...it, loading: false } : it))
    }
  }

  function toggleExpand(index: number) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, expanded: !it.expanded } : it))
  }

  function approve(index: number) {
    setItems(prev => prev.map((it, i) => i === index ? { ...it, approved: true } : it))
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).catch(() => {})
  }

  if (!loaded) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
        <div className="px-5 py-3.5 border-b border-slate-100">
          <p className="text-sm font-semibold text-[#0F172A]">Draft Actions</p>
          <p className="text-xs text-slate-400 mt-0.5">AI-generated follow-up messages</p>
        </div>
        <div className="p-5 text-center">
          <button
            onClick={loadDrafts}
            disabled={fetching}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#00C853] hover:bg-[#00A846] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60"
          >
            {fetching ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Load priority leads
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Draft Actions</p>
          <p className="text-xs text-slate-400 mt-0.5">{items.length} leads needing outreach</p>
        </div>
        <button
          onClick={loadDrafts}
          disabled={fetching}
          className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={14} className={fetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">No leads need outreach right now.</p>
      ) : (
        <div className="divide-y divide-slate-50">
          {items.map((item, i) => (
            <div key={item.id} className="p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-full bg-[#EBF2FF] flex items-center justify-center flex-shrink-0">
                    <span className="text-[11px] font-bold text-[#2979FF]">
                      {item.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#0F172A] truncate">{item.name}</p>
                    <p className="text-[11px] text-slate-400 capitalize">{item.type} · {item.status}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {item.approved && (
                    <span className="flex items-center gap-1 text-[10px] text-[#00A846] font-bold bg-[#E8FFF1] px-2 py-0.5 rounded-full border border-[#A3F0C4]">
                      <Check size={10} /> Approved
                    </span>
                  )}
                  {!item.draft ? (
                    <button
                      onClick={() => generateDraft(i)}
                      disabled={item.loading}
                      className="flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1.5 bg-[#EBF2FF] text-[#2979FF] hover:bg-[#2979FF] hover:text-white rounded-lg transition-colors disabled:opacity-60"
                    >
                      {item.loading ? <Loader2 size={11} className="animate-spin" /> : <MessageSquare size={11} />}
                      Generate
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleExpand(i)}
                      className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      {item.expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                      {item.expanded ? 'Hide' : 'View'}
                    </button>
                  )}
                </div>
              </div>

              {item.draft && item.expanded && (
                <div className="mt-3 space-y-3">
                  {/* SMS */}
                  <div className="bg-[#E8FFF1] border border-[#A3F0C4] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <MessageSquare size={11} className="text-[#00A846]" />
                        <span className="text-[10px] font-bold text-[#00A846] uppercase tracking-wide">SMS Draft</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(item.draft!.sms)}
                        className="text-[10px] text-[#00A846] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[12px] text-slate-700 leading-relaxed">{item.draft.sms}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{item.draft.sms.length}/160 chars</p>
                  </div>

                  {/* Email */}
                  <div className="bg-[#EBF2FF] border border-[#93B4FF] rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} className="text-[#2979FF]" />
                        <span className="text-[10px] font-bold text-[#2979FF] uppercase tracking-wide">Email Draft</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`Subject: ${item.draft!.email_subject}\n\n${item.draft!.email_body}`)}
                        className="text-[10px] text-[#2979FF] hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                    <p className="text-[11px] font-semibold text-slate-700 mb-1">Subject: {item.draft.email_subject}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed whitespace-pre-line">{item.draft.email_body}</p>
                  </div>

                  {/* Next action */}
                  <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex-shrink-0 mt-0.5">Next:</span>
                    <p className="text-[11px] text-amber-800">{item.draft.next_action}</p>
                  </div>

                  {!item.approved && (
                    <button
                      onClick={() => approve(i)}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-[#00C853] hover:bg-[#00A846] text-white text-[12px] font-semibold rounded-lg transition-colors"
                    >
                      <Check size={13} />
                      Approve & Mark for Sending
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
