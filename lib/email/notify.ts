/**
 * Email notifications via Resend API.
 * Set RESEND_API_KEY + NOTIFICATION_EMAIL in Vercel env vars to activate.
 * If key is missing, emails are silently skipped (won't break anything).
 */

const FROM = 'Saigon Power CRM <noreply@giadienre.com>'
const TO   = process.env.NOTIFICATION_EMAIL || 'info@saigonllc.com'

async function send(subject: string, html: string) {
  const key = process.env.RESEND_API_KEY
  if (!key) return // Not configured — skip silently

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM, to: TO, subject, html }),
    })
  } catch {
    // Never block the main flow for email failures
  }
}

export async function notifyNewLead(lead: {
  name: string
  phone: string | null
  email: string | null
  zip: string
  service_type: string
  preferred_language: string
  source?: string | null
  notes?: string | null
}) {
  await send(
    `🆕 New Lead: ${lead.name} (${lead.service_type})`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#14532d;margin-bottom:16px">New Lead Submitted</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;color:#666;width:120px">Name</td><td style="padding:8px;font-weight:600">${lead.name}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">Phone</td><td style="padding:8px"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>
        <tr><td style="padding:8px;color:#666">Email</td><td style="padding:8px"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">ZIP</td><td style="padding:8px">${lead.zip}</td></tr>
        <tr><td style="padding:8px;color:#666">Service</td><td style="padding:8px;text-transform:capitalize">${lead.service_type}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">Language</td><td style="padding:8px;text-transform:uppercase">${lead.preferred_language}</td></tr>
        <tr><td style="padding:8px;color:#666">Source</td><td style="padding:8px">${lead.source || 'website'}</td></tr>
        ${lead.notes ? `<tr style="background:#f9fafb"><td style="padding:8px;color:#666">Notes</td><td style="padding:8px">${lead.notes}</td></tr>` : ''}
      </table>
      <div style="margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://giadienre.com'}/vi/crm/leads"
           style="background:#14532d;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          View in CRM →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Saigon Power CRM · info@saigonllc.com · (832) 937-9999</p>
    </div>
    `
  )
}

export async function notifyNewQuote(quote: {
  name: string
  phone: string
  email: string
  zip: string
  service_type: string
  business_name?: string | null
  monthly_usage_kwh?: number | null
  preferred_language: string
  notes?: string | null
}) {
  await send(
    `📋 New Quote Request: ${quote.name}${quote.business_name ? ` — ${quote.business_name}` : ''}`,
    `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <h2 style="color:#14532d;margin-bottom:16px">New Quote Request</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px;color:#666;width:140px">Name</td><td style="padding:8px;font-weight:600">${quote.name}</td></tr>
        ${quote.business_name ? `<tr style="background:#f9fafb"><td style="padding:8px;color:#666">Business</td><td style="padding:8px">${quote.business_name}</td></tr>` : ''}
        <tr><td style="padding:8px;color:#666">Phone</td><td style="padding:8px"><a href="tel:${quote.phone}">${quote.phone}</a></td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">Email</td><td style="padding:8px"><a href="mailto:${quote.email}">${quote.email}</a></td></tr>
        <tr><td style="padding:8px;color:#666">ZIP</td><td style="padding:8px">${quote.zip}</td></tr>
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">Service</td><td style="padding:8px;text-transform:capitalize">${quote.service_type}</td></tr>
        ${quote.monthly_usage_kwh ? `<tr><td style="padding:8px;color:#666">Usage</td><td style="padding:8px">~${quote.monthly_usage_kwh.toLocaleString()} kWh/mo</td></tr>` : ''}
        <tr style="background:#f9fafb"><td style="padding:8px;color:#666">Language</td><td style="padding:8px;text-transform:uppercase">${quote.preferred_language}</td></tr>
        ${quote.notes ? `<tr><td style="padding:8px;color:#666">Notes</td><td style="padding:8px">${quote.notes}</td></tr>` : ''}
      </table>
      <div style="margin-top:24px">
        <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://giadienre.com'}/vi/crm/quotes"
           style="background:#14532d;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600">
          View in CRM →
        </a>
      </div>
      <p style="color:#9ca3af;font-size:12px;margin-top:24px">Saigon Power CRM · info@saigonllc.com · (832) 937-9999</p>
    </div>
    `
  )
}
