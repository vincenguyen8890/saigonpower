import React from 'react'
import { setRequestLocale } from 'next-intl/server'
import { getSession } from '@/lib/auth/session'
import { redirect } from 'next/navigation'
import { Settings, Users, Bell, Shield, Database, Zap, ShieldCheck } from 'lucide-react'
import SettingsSection from '@/components/crm/settings/SettingsSection'
import type { SettingsField } from '@/components/crm/settings/SettingsSection'

interface Props {
  params: Promise<{ locale: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getSession()
  if (!session || session.role !== 'admin') redirect(`/${locale}/crm`)

  const isMock =
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

  const sections: {
    sectionKey: string
    icon: React.ReactNode
    title: string
    description: string
    fields: SettingsField[]
  }[] = [
    {
      sectionKey: 'team',
      icon: <Users size={15} className="text-slate-500" />,
      title: 'Team & Agents',
      description: 'Manage agent accounts, roles, and assignments.',
      fields: [
        {
          key: 'agent_email',
          label: 'Default Agent Email',
          description: 'New leads are assigned here if no agent is specified.',
          value: 'agent@saigonllc.com',
          type: 'email',
        },
        {
          key: 'admin_email',
          label: 'Admin Email',
          description: 'Receives system-level alerts and summaries.',
          value: 'admin@saigonllc.com',
          type: 'email',
        },
        {
          key: 'auto_assign',
          label: 'Auto-assign new leads',
          description: 'Automatically assign incoming leads to the default agent.',
          value: true,
          type: 'toggle',
        },
      ],
    },
    {
      sectionKey: 'notifications',
      icon: <Bell size={15} className="text-slate-500" />,
      title: 'Notifications',
      description: 'Configure when and how alerts are sent.',
      fields: [
        {
          key: 'renewal_alert_days',
          label: 'Renewal Alert (days before expiry)',
          description: 'Comma-separated values, e.g. 60, 30, 7',
          value: '60, 30, 7',
          type: 'text',
        },
        {
          key: 'new_lead_alert_email',
          label: 'New Lead Alert Email',
          description: 'Receive an email whenever a new lead is created.',
          value: 'admin@saigonllc.com',
          type: 'email',
        },
        {
          key: 'notify_on_deal_close',
          label: 'Notify on deal closed',
          description: 'Send an alert when a deal is marked as Won.',
          value: true,
          type: 'toggle',
        },
        {
          key: 'daily_summary',
          label: 'Daily summary email',
          description: 'Send a morning recap of leads, tasks, and pipeline.',
          value: false,
          type: 'toggle',
        },
      ],
    },
    {
      sectionKey: 'automation',
      icon: <Zap size={15} className="text-slate-500" />,
      title: 'Automation',
      description: 'Global toggles for workflow automation rules.',
      fields: [
        {
          key: 'auto_followup_on_status',
          label: 'Auto-create follow-up on lead status change',
          value: true,
          type: 'toggle',
        },
        {
          key: 'auto_task_on_deal_stage',
          label: 'Auto-create task on deal stage change',
          value: true,
          type: 'toggle',
        },
        {
          key: 'renewal_cron',
          label: 'Renewal check cron (daily 9 AM UTC)',
          value: true,
          type: 'toggle',
        },
        {
          key: 'auto_close_lost_days',
          label: 'Auto-close stale deals after (days)',
          description: 'Deals with no activity are marked Lost. Set 0 to disable.',
          value: '30',
          type: 'text',
        },
      ],
    },
    {
      sectionKey: 'security',
      icon: <Shield size={15} className="text-slate-500" />,
      title: 'Security',
      description: 'Auth and access control configuration.',
      fields: [
        {
          key: 'session_timeout_hours',
          label: 'Session timeout (hours)',
          value: '8',
          type: 'text',
        },
        {
          key: 'require_2fa',
          label: 'Require 2FA for all users',
          value: false,
          type: 'toggle',
        },
        {
          key: 'admin_ip_allowlist',
          label: 'Admin IP allowlist',
          description: 'Comma-separated IPs. Leave blank to allow all.',
          value: '',
          type: 'text',
        },
      ],
    },
    {
      sectionKey: 'integrations',
      icon: <Database size={15} className="text-slate-500" />,
      title: 'Data & Integrations',
      description: 'Connection status for third-party services.',
      fields: [
        {
          key: 'supabase_status',
          label: 'Supabase Project',
          value: isMock ? 'Not connected (mock mode)' : 'Connected',
          type: 'readonly',
        },
        {
          key: 'openai_status',
          label: 'OpenAI (Proposals / Chat)',
          value: process.env.OPENAI_API_KEY ? 'Connected' : 'Not set',
          type: 'readonly',
        },
        {
          key: 'cron_secret',
          label: 'CRON_SECRET',
          value: process.env.CRON_SECRET ? '••••••••' : 'Not set',
          type: 'readonly',
        },
        {
          key: 'webhook_url',
          label: 'Webhook URL (outbound)',
          description: 'POST events here on deal close, new lead, etc.',
          value: '',
          type: 'text',
        },
      ],
    },
  ]

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-amber-700" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A]">Settings</h1>
            <p className="text-sm text-slate-400 mt-0.5">Admin-only configuration</p>
          </div>
        </div>

        {/* Admin badge */}
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-lg">
          <ShieldCheck size={13} />
          Edit access · Admin
        </div>
      </div>

      {/* Sections */}
      {sections.map(s => (
        <SettingsSection
          key={s.sectionKey}
          sectionKey={s.sectionKey}
          icon={s.icon}
          title={s.title}
          description={s.description}
          fields={s.fields}
        />
      ))}

      <p className="text-xs text-slate-400 text-center pb-4">
        Changes are saved per section. Persistent storage requires a live Supabase connection.
      </p>
    </div>
  )
}
