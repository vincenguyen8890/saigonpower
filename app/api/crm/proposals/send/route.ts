import { NextRequest, NextResponse } from 'next/server'
import { updateLead } from '@/lib/supabase/queries'
import { insertActivity } from '@/lib/supabase/queries'

interface Plan {
  name: string
  provider_name: string
  rate_kwh: number
  term_months: number
  monthlyEstimate: number
  annualEstimate: number
  cancellation_fee: number | null
  renewable: boolean
  promo: string | null
}

interface ProposalPayload {
  lead: {
    id: string
    name: string
    email: string
    service_type: string
    zip: string
  }
  plans: Plan[]
  usageKwh: number
  bestPlanName: string
  bestMonthly: number
  bestAnnual: number
}

async function sendProposalEmail(payload: ProposalPayload) {
  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('[proposals] RESEND_API_KEY not set')
    return false
  }

  const { lead, plans, usageKwh, bestPlanName, bestMonthly, bestAnnual } = payload
  const firstName = lead.name.split(' ')[0]

  const plansHtml = plans.map((p, i) => {
    const isBest = p.name === bestPlanName
    return `
      <div style="border:${isBest ? '2px solid #16a34a' : '1px solid #e5e7eb'};border-radius:12px;padding:16px;margin-bottom:12px;background:${isBest ? '#f0fdf4' : '#fff'}">
        ${isBest ? '<div style="background:#16a34a;color:white;font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:8px">⭐ BEST RATE</div>' : `<div style="color:#6b7280;font-size:11px;font-weight:600;margin-bottom:6px">OPTION ${i + 1}</div>`}
        <div style="font-weight:700;font-size:15px;color:#111">${p.name}</div>
        <div style="color:#6b7280;font-size:12px;margin-bottom:10px">${p.provider_name}</div>
        <div style="font-size:26px;font-weight:800;color:${isBest ? '#15803d' : '#111'}">\$${p.monthlyEstimate}<span style="font-size:13px;font-weight:400;color:#9ca3af">/mo</span></div>
        <table style="width:100%;margin-top:10px;font-size:12px;color:#6b7280">
          <tr><td>Rate</td><td style="text-align:right;font-weight:600;color:#374151">${(p.rate_kwh * 100).toFixed(1)}¢/kWh</td></tr>
          <tr><td>Term</td><td style="text-align:right;font-weight:600;color:#374151">${p.term_months === 0 ? 'Prepaid' : `${p.term_months} months`}</td></tr>
          <tr><td>Annual estimate</td><td style="text-align:right;font-weight:600;color:#374151">\$${p.annualEstimate.toLocaleString()}</td></tr>
          <tr><td>Cancellation fee</td><td style="text-align:right;font-weight:600;color:#374151">${p.cancellation_fee ? `\$${p.cancellation_fee}` : 'None'}</td></tr>
          ${p.renewable ? '<tr><td colspan="2" style="color:#16a34a;font-weight:600;padding-top:4px">🌱 100% Renewable</td></tr>' : ''}
          ${p.promo ? `<tr><td colspan="2" style="color:#d97706;font-weight:600;padding-top:4px">🎁 ${p.promo}</td></tr>` : ''}
        </table>
      </div>
    `
  }).join('')

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:600px;margin:0 auto;background:#fff">
      <!-- Header -->
      <div style="background:#14532d;padding:32px 24px;border-radius:16px 16px 0 0">
        <div style="color:#86efac;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Electricity Rate Proposal</div>
        <div style="color:white;font-size:22px;font-weight:800">${lead.name}</div>
        <div style="color:#bbf7d0;font-size:13px;margin-top:4px">${lead.service_type === 'commercial' ? 'Commercial' : 'Residential'} · ZIP ${lead.zip} · ${usageKwh.toLocaleString()} kWh/mo</div>
      </div>

      <!-- Body -->
      <div style="padding:24px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 16px 16px">
        <p style="color:#374151;font-size:15px;margin:0 0 8px">Hi ${firstName},</p>
        <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 20px">
          I've put together a personalized electricity rate comparison for your ${lead.service_type} account, based on your estimated usage of ${usageKwh.toLocaleString()} kWh/month.
        </p>

        ${plansHtml}

        <!-- Recommendation -->
        <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;margin:20px 0">
          <div style="font-weight:700;color:#15803d;font-size:14px">✅ Our Recommendation</div>
          <div style="color:#166534;font-size:13px;margin-top:6px">
            <strong>${bestPlanName}</strong> — lowest monthly bill at <strong>\$${bestMonthly}/mo</strong> (\$${bestAnnual.toLocaleString()}/yr)
          </div>
        </div>

        <p style="color:#6b7280;font-size:13px;line-height:1.6;margin:0 0 20px">
          Ready to lock in this rate? Reply to this email or call us and we can complete your enrollment in minutes — no paperwork, no hassle.
        </p>

        <div style="text-align:center;margin:24px 0">
          <a href="tel:8329379999" style="background:#14532d;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block">
            📞 Call to Enroll: (832) 937-9999
          </a>
        </div>

        <hr style="border:none;border-top:1px solid #f3f4f6;margin:24px 0">
        <p style="color:#9ca3af;font-size:11px;text-align:center;margin:0">
          Saigon Power · info@saigonllc.com · (832) 937-9999<br>
          This proposal was prepared specifically for ${lead.name} · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.RESEND_FROM ?? 'Saigon Power <onboarding@resend.dev>',
      to:   lead.email,
      subject: `⚡ Your electricity rate proposal — ${lead.name}`,
      html,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('[proposals] Resend error:', err)
    return false
  }
  return true
}

export async function POST(req: NextRequest) {
  try {
    const payload: ProposalPayload = await req.json()
    const { lead, plans, usageKwh } = payload

    if (!lead?.email) {
      return NextResponse.json({ error: 'Lead has no email address' }, { status: 400 })
    }
    if (!plans?.length) {
      return NextResponse.json({ error: 'No plans selected' }, { status: 400 })
    }

    // Send the email
    const sent = await sendProposalEmail(payload)
    if (!sent) {
      return NextResponse.json({ error: 'Email failed to send — check RESEND_API_KEY and domain verification' }, { status: 500 })
    }

    // Mark lead as quoted
    await updateLead(lead.id, { status: 'quoted' }).catch(() => {})

    // Log activity
    await insertActivity({
      lead_id:     lead.id,
      type:        'email',
      title:       `Proposal sent — ${plans.length} plan${plans.length > 1 ? 's' : ''} compared`,
      description: `Best rate: ${payload.bestPlanName} at $${payload.bestMonthly}/mo. Usage: ${usageKwh.toLocaleString()} kWh/mo.`,
      due_date:    null,
      completed:   true,
      assigned_to: null,
      created_by:  'agent',
    }).catch(() => {})

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[proposals] error:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
