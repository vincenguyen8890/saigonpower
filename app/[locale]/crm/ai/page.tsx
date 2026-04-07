import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { Bot, Sparkles } from 'lucide-react'
import TodayPriorities from '@/components/ai/TodayPriorities'
import AIInsights from '@/components/ai/AIInsights'
import AIChat from '@/components/ai/AIChat'
import DraftActions from '@/components/ai/DraftActions'
import RenewalAlerts from '@/components/ai/RenewalAlerts'
import RateRecommender from '@/components/ai/RateRecommender'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function AIManagerPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session) redirect(`/${locale}/auth/login`)

  const hasAI = !!process.env.OPENAI_API_KEY

  return (
    <div className="space-y-5 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00C853] to-[#2979FF] flex items-center justify-center shadow-sm">
            <Bot size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[#0F172A]">AI Sales Manager</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Intelligent analysis and recommendations for your CRM
            </p>
          </div>
        </div>

        <div className={`hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border ${
          hasAI
            ? 'bg-[#E8FFF1] text-[#00A846] border-[#A3F0C4]'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <Sparkles size={12} />
          {hasAI ? 'AI Active' : 'Rule-based mode (no API key)'}
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left column: Chat (takes 2/3 on xl) */}
        <div className="xl:col-span-2">
          <AIChat />
        </div>

        {/* Right column: Priorities + Insights */}
        <div className="space-y-5">
          <TodayPriorities />
          <AIInsights />
        </div>
      </div>

      {/* Bottom row: Renewals + Drafts + Rate Recommender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <RenewalAlerts />
        <DraftActions />
        <RateRecommender />
      </div>
    </div>
  )
}
