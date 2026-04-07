import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export interface SearchResult {
  id: string
  type: 'lead' | 'deal'
  title: string
  subtitle: string
  href: string
}

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.trim()
  if (!q || q.length < 2) return NextResponse.json({ results: [] })

  try {
    const supabase = await createClient()
    const pattern  = `%${q}%`

    const [leadsRes, dealsRes] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('leads') as any)
        .select('id, name, email, phone, status, service_type')
        .or(`name.ilike.${pattern},email.ilike.${pattern},phone.ilike.${pattern}`)
        .limit(6),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (supabase.from('deals') as any)
        .select('id, title, stage, value, provider, service_address')
        .or(`title.ilike.${pattern},provider.ilike.${pattern},service_address.ilike.${pattern}`)
        .limit(6),
    ])

    const results: SearchResult[] = [
      ...(leadsRes.data ?? []).map((l: { id: string; name: string; email: string | null; phone: string | null; status: string; service_type: string }) => ({
        id:       l.id,
        type:     'lead' as const,
        title:    l.name,
        subtitle: [l.email, l.phone, l.status].filter(Boolean).join(' · '),
        href:     `/crm/leads/${l.id}`,
      })),
      ...(dealsRes.data ?? []).map((d: { id: string; title: string; stage: string; value: number; provider: string | null; service_address: string | null }) => ({
        id:       d.id,
        type:     'deal' as const,
        title:    d.title,
        subtitle: [d.provider, `$${d.value}/mo`, d.stage].filter(Boolean).join(' · '),
        href:     `/crm/deals/${d.id}`,
      })),
    ]

    return NextResponse.json({ results })
  } catch {
    return NextResponse.json({ results: [] })
  }
}
