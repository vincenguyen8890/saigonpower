import { Zap, CheckCircle2, AlertCircle } from 'lucide-react'

const TDSP_MAP: { prefix: string; name: string; area: string; url: string }[] = [
  { prefix: '10089', name: 'Oncor',              area: 'North/West Texas (Dallas-Fort Worth)',  url: 'https://www.oncor.com' },
  { prefix: '10443', name: 'CenterPoint Energy', area: 'Greater Houston Area',                 url: 'https://www.centerpointenergy.com' },
  { prefix: '10795', name: 'AEP Texas Central',  area: 'South/Central Texas (Corpus Christi)', url: 'https://www.aeptexas.com' },
  { prefix: '10790', name: 'AEP Texas North',    area: 'Northwest Texas (Abilene, Lubbock)',   url: 'https://www.aeptexas.com' },
  { prefix: '10774', name: 'TNMP',               area: 'Texas New Mexico Power (Rio Grande)',  url: 'https://www.tnmp.com' },
]

function lookupTdsp(esid: string) {
  const clean = esid.replace(/\D/g, '')
  return TDSP_MAP.find(t => clean.startsWith(t.prefix)) ?? null
}

function validateEsid(esid: string): { valid: boolean; reason?: string } {
  const clean = esid.replace(/\D/g, '')
  if (clean.length === 0)  return { valid: false }
  if (clean.length !== 17) return { valid: false, reason: `Must be 17 digits (got ${clean.length})` }
  if (!clean.startsWith('1')) return { valid: false, reason: 'Texas ESIDs start with 1' }
  return { valid: true }
}

interface Props {
  esid: string | null | undefined
  className?: string
}

export default function EsidInfo({ esid, className = '' }: Props) {
  if (!esid) return null

  const { valid, reason } = validateEsid(esid)
  const tdsp = valid ? lookupTdsp(esid) : null

  return (
    <div className={`rounded-xl border px-3 py-2.5 text-xs ${valid ? 'bg-blue-50/40 border-blue-100' : 'bg-red-50/40 border-red-100'} ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <Zap size={12} className={valid ? 'text-blue-500' : 'text-red-400'} />
        <span className="font-mono text-gray-700 tracking-wider">{esid}</span>
        {valid
          ? <CheckCircle2 size={12} className="text-green-500 ml-auto" />
          : <AlertCircle size={12} className="text-red-400 ml-auto" />
        }
      </div>
      {valid && tdsp && (
        <div className="mt-1 pl-5">
          <p className="font-semibold text-gray-800">{tdsp.name}</p>
          <p className="text-gray-500">{tdsp.area}</p>
        </div>
      )}
      {valid && !tdsp && (
        <p className="pl-5 text-gray-400">TDSP not recognized — verify with ERCOT</p>
      )}
      {!valid && reason && (
        <p className="pl-5 text-red-500">{reason}</p>
      )}
    </div>
  )
}
