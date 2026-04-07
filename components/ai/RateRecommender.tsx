'use client'

import { useState } from 'react'
import { Zap, Loader2, Star, Copy, Check, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react'
import type { RateRecommendation, RatePlan } from '@/app/api/ai/rate-recommend/route'

function PlanCard({ plan, isBest }: { plan: RatePlan; isBest: boolean }) {
  const [expanded, setExpanded] = useState(isBest)
  const [copied, setCopied] = useState(false)

  const shareText = `${plan.provider} — ${plan.plan_name}\n${(plan.rate_kwh * 100).toFixed(4)}¢/kWh · ${plan.term_months}mo ${plan.product_type}\nEst. $${plan.monthly_cost}/mo`

  function copy() {
    navigator.clipboard.writeText(shareText).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`rounded-xl border p-4 transition-all ${
      isBest ? 'border-[#00C853] bg-[#E8FFF1]' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isBest && <Star size={13} className="text-[#00C853] flex-shrink-0 fill-[#00C853]" />}
          <div className="min-w-0">
            <p className="text-[13px] font-bold text-[#0F172A] truncate">{plan.plan_name}</p>
            <p className="text-[11px] text-slate-500">{plan.provider}</p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-base font-bold text-[#0F172A]">${plan.monthly_cost}<span className="text-[11px] font-normal text-slate-400">/mo</span></p>
          <p className="text-[11px] text-slate-500">{(plan.rate_kwh * 100).toFixed(4)}¢/kWh</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-2.5">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
          {plan.term_months}mo
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
          {plan.product_type}
        </span>
        {plan.annual_savings > 0 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
            <TrendingDown size={9} /> Save ${plan.annual_savings.toLocaleString()}/yr
          </span>
        )}
      </div>

      {expanded && (
        <p className="mt-2.5 text-[12px] text-slate-600 leading-relaxed">{plan.why}</p>
      )}

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
        >
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          {expanded ? 'Less' : 'Why this?'}
        </button>
        <button
          onClick={copy}
          className="ml-auto flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600"
        >
          {copied ? <Check size={11} className="text-[#00C853]" /> : <Copy size={11} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

export default function RateRecommender() {
  const [usage, setUsage] = useState('')
  const [zip, setZip]   = useState('')
  const [type, setType] = useState<'residential' | 'commercial'>('residential')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<RateRecommendation | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const kWh = Number(usage)
    if (!kWh || kWh < 100) { setError('Enter a valid monthly usage (min 100 kWh)'); return }
    setError('')
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/ai/rate-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usage_kwh: kWh, zip: zip || '77001', service_type: type }),
      })
      if (!res.ok) throw new Error()
      setResult(await res.json())
    } catch {
      setError('Could not generate recommendations. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)]">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center">
          <Zap size={14} className="text-amber-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Rate Recommender</p>
          <p className="text-[11px] text-slate-400">Find the best plan for a customer</p>
        </div>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">Monthly Usage (kWh)</label>
              <input
                type="number"
                value={usage}
                onChange={e => setUsage(e.target.value)}
                placeholder="e.g. 1200"
                min="100"
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 block mb-1">ZIP Code</label>
              <input
                value={zip}
                onChange={e => setZip(e.target.value)}
                placeholder="e.g. 77001"
                maxLength={5}
                className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853]"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">Service Type</label>
            <div className="flex gap-2">
              {(['residential', 'commercial'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-sm rounded-lg border font-medium transition-colors capitalize ${
                    type === t
                      ? 'bg-[#00C853] border-[#00C853] text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading || !usage}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#00C853] hover:bg-[#00A846] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-lg text-sm font-semibold transition-colors"
          >
            {loading ? <><Loader2 size={14} className="animate-spin" /> Analyzing plans…</> : 'Find Best Plans'}
          </button>
        </form>

        {result && (
          <div className="mt-5 space-y-3">
            <div className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
              <p className="text-[12px] text-slate-600 leading-relaxed">{result.summary}</p>
            </div>
            {result.recommendations.map(plan => (
              <PlanCard
                key={`${plan.provider}-${plan.plan_name}`}
                plan={plan}
                isBest={plan.plan_name === result.best_pick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
