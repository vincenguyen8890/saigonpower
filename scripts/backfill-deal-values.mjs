/**
 * Recalculate deal value = round(rate_kwh × usage_kwh) for all deals
 * that have both fields set. Skips deals already calculated correctly (within $2).
 */
import { createClient } from '@supabase/supabase-js'

const sb = createClient(
  'https://wtlftywoavdzoshvkzdw.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0bGZ0eXdvYXZkem9zaHZremR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTM5MTY5MiwiZXhwIjoyMDkwOTY3NjkyfQ.kiSgEymbc_1mDQrby7yyLBJw76RS8QFxODY0RCXgRZM'
)

async function main() {
  console.log('📊 Fetching deals with rate + usage...')
  let all = [], from = 0
  while (true) {
    const { data } = await sb.from('deals')
      .select('id,value,rate_kwh,usage_kwh,adder_kwh')
      .not('rate_kwh', 'is', null)
      .not('usage_kwh', 'is', null)
      .range(from, from + 999)
    all = all.concat(data ?? [])
    if (!data || data.length < 1000) break
    from += 1000
  }
  console.log(`   Found ${all.length} deals with rate+usage`)

  let updated = 0, skipped = 0
  for (const d of all) {
    const calculated = Math.round((d.rate_kwh + (d.adder_kwh ?? 0)) * d.usage_kwh)
    if (Math.abs(calculated - d.value) <= 2) { skipped++; continue }
    const { error } = await sb.from('deals').update({ value: calculated }).eq('id', d.id)
    if (!error) updated++
    if ((updated + skipped) % 200 === 0) console.log(`  ... ${updated} updated, ${skipped} skipped`)
  }

  console.log(`\n✅ Done: ${updated} values updated, ${skipped} already correct`)
}

main().catch(console.error)
