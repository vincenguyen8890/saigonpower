import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { Settings, Users, Bell, Shield, Database, Zap } from 'lucide-react'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session || session.role !== 'admin') redirect(`/${locale}/crm`)

  const sections = [
    {
      icon: Users,
      title: 'Team & Agents',
      description: 'Manage agent accounts, roles, and assignments.',
      fields: [
        { label: 'Agent Email', value: 'agent@saigonllc.com', type: 'text' },
        { label: 'Admin Email', value: 'admin@saigonllc.com', type: 'text' },
      ],
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Configure when and how alerts are sent.',
      fields: [
        { label: 'Renewal Alert (days out)', value: '60, 30, 7', type: 'text' },
        { label: 'New Lead Alert Email', value: 'admin@saigonllc.com', type: 'text' },
      ],
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Global toggles for workflow automation.',
      fields: [
        { label: 'Auto-create follow-up on lead status change', value: 'Enabled', type: 'toggle' },
        { label: 'Auto-create task on deal stage change', value: 'Enabled', type: 'toggle' },
        { label: 'Renewal cron (daily 9AM UTC)', value: 'Enabled', type: 'toggle' },
      ],
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Auth and access control settings.',
      fields: [
        { label: 'Session timeout', value: '8 hours', type: 'text' },
        { label: 'Require 2FA', value: 'Disabled', type: 'toggle' },
      ],
    },
    {
      icon: Database,
      title: 'Data & Integrations',
      description: 'Supabase connection, CSV import defaults, API keys.',
      fields: [
        { label: 'Supabase Project', value: 'Not connected (mock mode)', type: 'readonly' },
        { label: 'OpenAI (Proposals)', value: process.env.OPENAI_API_KEY ? 'Connected' : 'Not set', type: 'readonly' },
        { label: 'CRON_SECRET', value: process.env.CRON_SECRET ? '••••••••' : 'Not set', type: 'readonly' },
      ],
    },
  ]

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center">
          <Settings size={18} className="text-amber-700" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 text-sm mt-0.5">Admin-only configuration</p>
        </div>
      </div>

      <div className="space-y-5">
        {sections.map(({ icon: Icon, title, description, fields }) => (
          <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/40">
              <Icon size={16} className="text-gray-500" />
              <div>
                <p className="text-sm font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-400">{description}</p>
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {fields.map(field => (
                <div key={field.label} className="flex items-center justify-between px-6 py-4">
                  <label className="text-sm text-gray-600">{field.label}</label>
                  {field.type === 'toggle' ? (
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        field.value === 'Enabled'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        {field.value}
                      </span>
                      <span className="text-xs text-gray-400">(managed via Automation page)</span>
                    </div>
                  ) : field.type === 'readonly' ? (
                    <span className={`text-sm font-medium ${
                      field.value.includes('Not') ? 'text-amber-600' : 'text-green-700'
                    }`}>
                      {field.value}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-700 font-medium">{field.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        Full settings editing will be available once Supabase is connected.
      </p>
    </div>
  )
}
