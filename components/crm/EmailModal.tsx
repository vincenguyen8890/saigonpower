'use client'

import { useState } from 'react'
import { Mail, X, Copy, ExternalLink, CheckCircle2 } from 'lucide-react'

interface TemplateData {
  customerName: string
  email: string
  provider?: string
  planName?: string
  rateKwh?: number | null
  contractEndDate?: string | null
  agentName?: string
  dealTitle?: string
}

type TemplateKey = 'renewal' | 'proposal' | 'followup' | 'welcome' | 'general'

function buildTemplates(d: TemplateData): Record<TemplateKey, { label: string; subject: string; body: string }> {
  const rate = d.rateKwh ? `${(d.rateKwh * 100).toFixed(1)}¢/kWh` : 'a competitive rate'
  const agent = d.agentName ?? 'Your Energy Advisor'
  const firstName = d.customerName.split(' ')[0]

  return {
    renewal: {
      label: 'Renewal Reminder',
      subject: `Your energy contract is expiring soon — ${firstName}`,
      body: `Hi ${firstName},

I wanted to reach out because your current energy contract${d.provider ? ` with ${d.provider}` : ''}${d.contractEndDate ? ` expires on ${d.contractEndDate}` : ' is coming up for renewal'}.

Now is a great time to review your options and lock in a new rate before your contract ends. I have some great plans available that could save you money.

Would you be available for a quick call this week? I'd love to walk you through your options.

Best regards,
${agent}
Saigon Power`,
    },
    proposal: {
      label: 'Send Proposal',
      subject: `Your personalized energy rate proposal — ${firstName}`,
      body: `Hi ${firstName},

Thank you for the opportunity to help with your energy needs. I'm pleased to share a proposal based on our conversation.

${d.provider && d.planName ? `I'm recommending the ${d.planName} plan from ${d.provider}` : 'Here is my recommended plan'}${d.rateKwh ? ` at ${rate}` : ''}.

Key benefits:
• Fixed rate — no surprises on your bill
• ${d.planName ?? 'Competitive pricing'} with a trusted supplier
• Full enrollment support from start to finish

Please review and let me know if you have any questions. I'm happy to walk you through it.

Best regards,
${agent}
Saigon Power`,
    },
    followup: {
      label: 'Follow-Up',
      subject: `Following up — ${firstName}`,
      body: `Hi ${firstName},

I'm following up on our recent conversation about your energy plan${d.dealTitle ? ` (${d.dealTitle})` : ''}.

I wanted to make sure you had all the information you need and answer any questions that may have come up.

Is there anything I can clarify or help with? Feel free to reply to this email or call me directly.

Best regards,
${agent}
Saigon Power`,
    },
    welcome: {
      label: 'Welcome / Enrollment Confirmation',
      subject: `Welcome to ${d.provider ?? 'your new energy plan'} — ${firstName}`,
      body: `Hi ${firstName},

Congratulations! Your enrollment has been processed successfully.

Here's a summary of your new plan:
• Provider: ${d.provider ?? 'Your new supplier'}
• Plan: ${d.planName ?? 'Your selected plan'}
• Rate: ${rate}

Your new service should begin within 1-2 billing cycles. You'll receive a welcome letter from your supplier with full account details.

Thank you for choosing Saigon Power. Don't hesitate to reach out if you need anything!

Best regards,
${agent}
Saigon Power`,
    },
    general: {
      label: 'General Outreach',
      subject: `Checking in — ${firstName}`,
      body: `Hi ${firstName},

I hope this message finds you well! I'm reaching out to see if there's anything I can help you with regarding your energy needs.

Whether it's reviewing your current plan, exploring new options, or just answering questions — I'm here to help.

Best regards,
${agent}
Saigon Power`,
    },
  }
}

interface Props {
  data: TemplateData
  trigger?: React.ReactNode
}

export default function EmailModal({ data, trigger }: Props) {
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState<TemplateKey>('followup')
  const [copied, setCopied] = useState(false)

  const templates = buildTemplates(data)
  const tpl = templates[selected]

  const mailtoLink = `mailto:${encodeURIComponent(data.email)}?subject=${encodeURIComponent(tpl.subject)}&body=${encodeURIComponent(tpl.body)}`

  async function copyBody() {
    await navigator.clipboard.writeText(tpl.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!data.email) return null

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
        >
          <Mail size={14} />
          Email
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Mail size={16} className="text-brand-greenDark" />
                Email {data.customerName}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Template selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Template</label>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(templates) as TemplateKey[]).map(key => (
                    <button
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                        selected === key
                          ? 'border-brand-greenDark text-brand-greenDark bg-green-50'
                          : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                    >
                      {templates[key].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* To */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2">{data.email}</p>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
                <p className="text-sm text-gray-800 bg-gray-50 rounded-xl px-3 py-2">{tpl.subject}</p>
              </div>

              {/* Body */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Body</label>
                <pre className="text-sm text-gray-700 bg-gray-50 rounded-xl px-3 py-3 whitespace-pre-wrap font-sans leading-relaxed max-h-52 overflow-y-auto">
                  {tpl.body}
                </pre>
              </div>
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={copyBody}
                className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {copied ? <CheckCircle2 size={14} className="text-green-600" /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy body'}
              </button>
              <a
                href={mailtoLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-brand-greenDark text-white py-2 rounded-xl text-sm hover:bg-brand-green transition-colors font-medium"
              >
                <ExternalLink size={14} />
                Open in email client
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
