'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Leaf, Tag, FileText, Send, CheckCircle2, Loader2, Printer } from 'lucide-react'
import type { Lead, Plan } from '@/data/mock-crm'

interface PlanWithCost extends Plan {
  monthlyEstimate: number
  annualEstimate: number
  commission: number
}

interface Props {
  locale: string
  leads: Lead[]
  selectedLead: Lead | null
  plans: PlanWithCost[]
  usageKwh: number
}

export default function ProposalGenerator({ locale, leads, selectedLead, plans, usageKwh }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [selectedPlans, setSelectedPlans] = useState<string[]>([])
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`
      <html><head><title>Proposal – ${selectedLead?.name}</title>
      <style>
        body { font-family: system-ui, sans-serif; padding: 32px; color: #111; }
        h1 { font-size: 20px; margin-bottom: 4px; }
        .sub { font-size: 13px; color: #555; margin-bottom: 24px; }
        .grid { display: grid; grid-template-columns: repeat(${chosenPlans.length}, 1fr); gap: 16px; }
        .plan { border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
        .plan.best { border-color: #16a34a; background: #f0fdf4; }
        .price { font-size: 26px; font-weight: 700; margin: 8px 0 4px; }
        .detail { font-size: 12px; color: #666; margin: 2px 0; }
        .badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 20px; background: #16a34a; color: #fff; margin-bottom: 6px; }
        .rec { margin-top: 20px; padding: 12px 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; font-size: 13px; }
        .footer { margin-top: 32px; font-size: 11px; color: #888; }
      </style></head><body>
      <h1>Electricity Rate Proposal for ${selectedLead?.name}</h1>
      <p class="sub">${selectedLead?.service_type === 'commercial' ? 'Commercial' : 'Residential'} · ZIP ${selectedLead?.zip} · ${usageKwh.toLocaleString()} kWh/mo · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
      <div class="grid">
        ${chosenPlans.map(p => `
          <div class="plan${bestPlan?.id === p.id ? ' best' : ''}">
            ${bestPlan?.id === p.id ? '<div class="badge">Best Rate</div><br>' : ''}
            <div style="font-size:12px;color:#555">${p.provider_name}</div>
            <div style="font-weight:600">${p.name}</div>
            <div class="price">$${p.monthlyEstimate}<span style="font-size:14px;font-weight:400">/mo</span></div>
            <div class="detail">${(p.rate_kwh * 100).toFixed(1)}¢/kWh</div>
            <div class="detail">${p.term_months === 0 ? 'Prepaid — no contract' : `${p.term_months}-month term`}</div>
            <div class="detail">Annual est: $${p.annualEstimate.toLocaleString()}</div>
            ${p.renewable ? '<div class="detail" style="color:#16a34a">✓ 100% Renewable</div>' : ''}
          </div>
        `).join('')}
      </div>
      ${bestPlan ? `<div class="rec">Recommendation: <strong>${bestPlan.name}</strong> — lowest monthly bill at $${bestPlan.monthlyEstimate}/mo ($${bestPlan.annualEstimate.toLocaleString()}/yr).</div>` : ''}
      <div class="footer">Prepared by Saigon Power · saigonpower.com</div>
      </body></html>
    `)
    win.document.close()
    win.focus()
    win.print()
  }

  function handleLeadChange(leadId: string) {
    startTransition(() => {
      router.push(`/${locale}/crm/proposals?leadId=${leadId}&usage=${usageKwh}`)
    })
    setSelectedPlans([])
    setSent(false)
    setPreviewOpen(false)
  }

  function handleUsageChange(val: string) {
    if (!selectedLead) return
    const u = parseInt(val) || 1200
    startTransition(() => {
      router.push(`/${locale}/crm/proposals?leadId=${selectedLead.id}&usage=${u}`)
    })
  }

  function togglePlan(planId: string) {
    setSelectedPlans(prev =>
      prev.includes(planId) ? prev.filter(p => p !== planId) : [...prev, planId]
    )
  }

  const chosenPlans = plans.filter(p => selectedPlans.includes(p.id))
  const bestPlan = chosenPlans.length > 0
    ? chosenPlans.reduce((a, b) => a.monthlyEstimate < b.monthlyEstimate ? a : b)
    : null

  async function handleSend() {
    if (!selectedLead || chosenPlans.length === 0) return
    setSending(true)
    try {
      const res = await fetch('/api/crm/proposals/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: selectedLead,
          plans: chosenPlans,
          usageKwh,
          bestPlanName: bestPlan?.name,
          bestMonthly: bestPlan?.monthlyEstimate,
          bestAnnual: bestPlan?.annualEstimate,
        }),
      })
      if (!res.ok) {
        const err = await res.json()
        alert(err.error || 'Failed to send proposal')
        return
      }
      setSent(true)
    } catch {
      alert('Network error — please try again')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* ── Left panel: lead + usage selector ── */}
      <div className="lg:col-span-2 space-y-5">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">1. Select Lead</h2>
          <select
            value={selectedLead?.id ?? ''}
            onChange={e => handleLeadChange(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-green"
          >
            <option value="">— Choose a lead —</option>
            {leads.map(l => (
              <option key={l.id} value={l.id}>
                {l.name} ({l.service_type === 'commercial' ? 'Comm.' : 'Res.'} · {l.zip})
              </option>
            ))}
          </select>

          {selectedLead && (
            <div className="mt-4 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-1">
              <p><span className="font-medium">Email:</span> {selectedLead.email || '—'}</p>
              <p><span className="font-medium">Phone:</span> {selectedLead.phone || '—'}</p>
              <p><span className="font-medium">ZIP:</span> {selectedLead.zip}</p>
              <p><span className="font-medium">Type:</span> <span className="capitalize">{selectedLead.service_type}</span></p>
              <p><span className="font-medium">Status:</span> <span className="capitalize">{selectedLead.status}</span></p>
            </div>
          )}
        </div>

        {selectedLead && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">2. Monthly Usage</h2>
            <div className="flex items-center gap-2">
              <input
                type="number"
                defaultValue={usageKwh}
                min={100}
                max={50000}
                step={100}
                onBlur={e => handleUsageChange(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <span className="text-sm text-gray-500 font-medium">kWh/mo</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {selectedLead.service_type === 'commercial'
                ? 'Typical commercial: 2,000–10,000 kWh/mo'
                : 'Typical residential: 800–2,000 kWh/mo'}
            </p>
          </div>
        )}

        {selectedLead && plans.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-1">3. Select Plans to Compare</h2>
            <p className="text-xs text-gray-400 mb-3">Choose up to 4 plans</p>
            <div className="space-y-2">
              {plans.map(plan => {
                const checked = selectedPlans.includes(plan.id)
                const isBest = plans[0]?.id === plan.id
                return (
                  <label
                    key={plan.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      checked
                        ? 'border-brand-greenDark bg-green-50/40'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!checked && selectedPlans.length >= 4}
                      onChange={() => togglePlan(plan.id)}
                      className="mt-0.5 accent-green-700"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-sm font-medium text-gray-900">{plan.name}</span>
                        {isBest && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Lowest</span>}
                        {plan.renewable && <Leaf size={11} className="text-green-500" />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-500">{(plan.rate_kwh * 100).toFixed(1)}¢/kWh</span>
                        <span className="text-xs text-gray-300">·</span>
                        <span className="text-xs text-gray-500">{plan.term_months === 0 ? 'Prepaid' : `${plan.term_months} mo`}</span>
                        {plan.promo && (
                          <>
                            <span className="text-xs text-gray-300">·</span>
                            <span className="text-xs text-amber-600 flex items-center gap-0.5">
                              <Tag size={9} /> {plan.promo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-bold text-gray-800 flex-shrink-0">${plan.monthlyEstimate}/mo</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Right panel: proposal preview ── */}
      <div className="lg:col-span-3">
        {!selectedLead ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <FileText size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Select a lead to start</p>
            </div>
          </div>
        ) : chosenPlans.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex items-center justify-center h-64">
            <div className="text-center text-gray-400">
              <Zap size={36} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">Choose plans to compare</p>
              <p className="text-xs mt-1">Select 2–4 plans from the left panel</p>
            </div>
          </div>
        ) : (
          <div ref={printRef} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Proposal header */}
            <div className="bg-brand-greenDark px-6 py-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-300 text-xs font-medium uppercase tracking-wide">Electricity Rate Proposal</p>
                  <p className="text-white text-lg font-bold mt-0.5">{selectedLead.name}</p>
                  <p className="text-green-200 text-sm mt-0.5">{selectedLead.service_type === 'commercial' ? 'Commercial' : 'Residential'} · ZIP {selectedLead.zip} · {usageKwh.toLocaleString()} kWh/mo</p>
                </div>
                <div className="text-right">
                  <p className="text-green-300 text-xs">Saigon Power</p>
                  <p className="text-green-200 text-xs mt-0.5">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            </div>

            {/* Plan comparison */}
            <div className="p-6">
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${chosenPlans.length}, 1fr)` }}>
                {chosenPlans.map((plan, i) => {
                  const isBest = bestPlan?.id === plan.id
                  const savings = bestPlan && !isBest ? plan.monthlyEstimate - bestPlan.monthlyEstimate : 0
                  return (
                    <div
                      key={plan.id}
                      className={`rounded-xl border p-4 relative ${
                        isBest
                          ? 'border-green-400 bg-green-50/40 ring-1 ring-green-300'
                          : 'border-gray-200'
                      }`}
                    >
                      {isBest && (
                        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium">Best Rate</span>
                        </div>
                      )}
                      <p className="text-xs font-medium text-gray-500 truncate">{plan.provider_name}</p>
                      <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-tight">{plan.name}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-3">
                        ${plan.monthlyEstimate}
                        <span className="text-sm font-normal text-gray-400">/mo</span>
                      </p>
                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        <p>{(plan.rate_kwh * 100).toFixed(1)}¢/kWh</p>
                        <p>{plan.term_months === 0 ? 'Prepaid — no contract' : `${plan.term_months}-month term`}</p>
                        <p>Annual est: ${plan.annualEstimate.toLocaleString()}</p>
                        {plan.cancellation_fee != null && <p>Cancel fee: ${plan.cancellation_fee}</p>}
                        {plan.renewable && <p className="text-green-600 flex items-center gap-1"><Leaf size={10} /> 100% Renewable</p>}
                        {plan.promo && <p className="text-amber-600 flex items-center gap-1"><Tag size={10} /> {plan.promo}</p>}
                      </div>
                      {savings > 0 && (
                        <p className="mt-3 text-xs text-red-500 font-medium">+${savings}/mo vs best</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400">Agent commission</p>
                        <p className="text-sm font-semibold text-green-700">${plan.commission}/mo</p>
                      </div>
                    </div>
                  )
                })}
              </div>

              {bestPlan && (
                <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-200">
                  <p className="text-sm text-green-800 font-medium">
                    Recommendation: <span className="font-bold">{bestPlan.name}</span>
                    {' '}— lowest monthly bill at ${bestPlan.monthlyEstimate}/mo (${bestPlan.annualEstimate.toLocaleString()}/yr).
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 mt-5">
                {sent ? (
                  <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
                    <CheckCircle2 size={16} />
                    Proposal sent — lead marked as Quoted
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleSend}
                      disabled={sending || isPending}
                      className="flex items-center gap-2 bg-brand-greenDark text-white text-sm px-4 py-2.5 rounded-xl hover:bg-brand-green transition-colors disabled:opacity-60"
                    >
                      {sending
                        ? <><Loader2 size={14} className="animate-spin" /> Sending…</>
                        : <><Send size={14} /> Send to {selectedLead.email || 'Client'}</>
                      }
                    </button>
                    <button
                      onClick={() => setPreviewOpen(v => !v)}
                      className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <FileText size={14} />
                      {previewOpen ? 'Hide Preview' : 'Email Preview'}
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <Printer size={14} />
                      Print / PDF
                    </button>
                  </>
                )}
              </div>

              {/* Email preview */}
              {previewOpen && !sent && (
                <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-gray-50 text-sm text-gray-700">
                  <p className="font-medium text-gray-500 text-xs uppercase mb-2">Email Preview</p>
                  <p><strong>To:</strong> {selectedLead.email || '(no email)'}</p>
                  <p><strong>Subject:</strong> ⚡ Your electricity quote is ready — {selectedLead.name}</p>
                  <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 text-sm leading-relaxed">
                    <p>Hi {selectedLead.name.split(' ')[0]},</p>
                    <p className="mt-2">I&apos;ve put together a personalized rate comparison for your {selectedLead.service_type} account at ZIP {selectedLead.zip}, based on {usageKwh.toLocaleString()} kWh/month usage.</p>
                    <p className="mt-2">Our top recommendation is <strong>{bestPlan?.name}</strong> at ${bestPlan?.monthlyEstimate}/month — saving you money vs your current plan.</p>
                    <p className="mt-2">I&apos;ve included {chosenPlans.length} options in this comparison so you can choose the plan that fits your needs best.</p>
                    <p className="mt-3">Ready to lock in this rate? Reply to this email or call us and we can complete enrollment in minutes.</p>
                    <p className="mt-3">— Saigon Power Team</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
