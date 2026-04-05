'use client'

import { Phone, Mail, CheckSquare, TrendingUp, CheckCircle2, RefreshCw, Activity } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  call:       <Phone     size={16} className="text-blue-500" />,
  email:      <Mail      size={16} className="text-purple-500" />,
  task:       <CheckSquare size={16} className="text-amber-500" />,
  enrollment: <CheckCircle2 size={16} className="text-green-600" />,
  won:        <TrendingUp size={16} className="text-green-600" />,
  recovery:   <RefreshCw size={16} className="text-gray-400" />,
}

interface Props {
  icon: string
  name: string
  description: string
  trigger: string
  action: string
  active: boolean
  lastRun: string
  runsTotal: number
}

export default function AutomationRuleCard({
  icon, name, description, trigger, action, active, lastRun, runsTotal,
}: Props) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all ${
      active ? 'border-gray-100' : 'border-gray-100 opacity-60'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
            active ? 'bg-green-50' : 'bg-gray-50'
          }`}>
            {iconMap[icon] ?? <Activity size={16} className="text-gray-400" />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 text-sm">{name}</p>
            <p className="text-xs text-gray-400">{runsTotal} total runs</p>
          </div>
        </div>
        {/* Toggle indicator */}
        <div className={`w-9 h-5 rounded-full flex-shrink-0 cursor-pointer transition-colors relative ${
          active ? 'bg-brand-greenDark' : 'bg-gray-200'
        }`}>
          <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-all ${
            active ? 'left-4.5 translate-x-0.5' : 'left-0.5'
          }`} style={{ left: active ? '18px' : '2px' }} />
        </div>
      </div>

      <p className="text-xs text-gray-500 mb-3">{description}</p>

      <div className="space-y-1.5 text-xs">
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-12 flex-shrink-0">Trigger</span>
          <span className="text-blue-600 font-medium bg-blue-50 px-1.5 py-0.5 rounded">{trigger}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-12 flex-shrink-0">Action</span>
          <span className="text-green-700 font-medium bg-green-50 px-1.5 py-0.5 rounded">{action}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-gray-400 w-12 flex-shrink-0">Last run</span>
          <span className="text-gray-500">{lastRun}</span>
        </div>
      </div>
    </div>
  )
}
