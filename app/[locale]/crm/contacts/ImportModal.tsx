'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim().split('\n')
  if (lines.length < 2) return []

  const parseRow = (line: string): string[] => {
    const fields: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      if (line[i] === '"') { inQuotes = !inQuotes; continue }
      if (line[i] === ',' && !inQuotes) { fields.push(current.trim()); current = ''; continue }
      current += line[i]
    }
    fields.push(current.trim())
    return fields
  }

  const headers = parseRow(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'))
  return lines.slice(1)
    .map(line => Object.fromEntries(headers.map((h, i) => [h, parseRow(line)[i] ?? ''])))
    .filter(r => Object.values(r).some(v => v !== ''))
}

export default function ImportModal() {
  const [open, setOpen] = useState(false)
  const [rows, setRows] = useState<Record<string, string>[]>([])
  const [fileName, setFileName] = useState('')
  const [isPending, setIsPending] = useState(false)
  const [result, setResult] = useState<{ imported: number; failed: number; errors: string[] } | null>(null)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleFile(file: File) {
    setResult(null)
    setParseError('')
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = e.target?.result as string
      const parsed = parseCSV(text)
      if (parsed.length === 0) { setParseError('No valid data rows found. Make sure the file has a header row.'); setRows([]); return }
      setRows(parsed)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.csv')) handleFile(file)
  }

  async function handleImport() {
    if (rows.length === 0) return
    setIsPending(true)
    try {
      const res = await fetch('/api/crm/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      if (!res.ok) { setParseError(data.error ?? 'Import failed'); return }
      setResult(data)
      router.refresh()
    } finally {
      setIsPending(false)
    }
  }

  function reset() {
    setRows([]); setFileName(''); setResult(null); setParseError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const previewHeaders = rows[0] ? Object.keys(rows[0]) : []

  return (
    <>
      <button
        onClick={() => { setOpen(true); reset() }}
        className="flex items-center gap-1.5 text-sm border border-gray-200 text-gray-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors bg-white"
      >
        <Upload size={14} />
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">Import Contacts from CSV</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* Drop zone */}
              {!result && (
                <div
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center hover:border-brand-green transition-colors cursor-pointer"
                  onDragOver={e => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <FileText size={32} className="mx-auto mb-3 text-gray-300" />
                  <p className="text-sm font-medium text-gray-600">Drop a CSV file here or click to browse</p>
                  <p className="text-xs text-gray-400 mt-1">Expected columns: name, email, phone, zip, service_address, service_type, source, assigned_to, notes</p>
                  {fileName && <p className="text-xs text-brand-greenDark font-medium mt-2">{fileName} · {rows.length} rows</p>}
                  <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
                </div>
              )}

              {parseError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  {parseError}
                </div>
              )}

              {/* Success result */}
              {result && (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl px-4 py-4">
                    <CheckCircle2 size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-green-800">Import complete</p>
                      <p className="text-sm text-green-700 mt-0.5">{result.imported} contacts imported · {result.failed} skipped</p>
                    </div>
                  </div>
                  {result.errors.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-amber-700 mb-1">Skipped rows:</p>
                      {result.errors.map((e, i) => <p key={i} className="text-xs text-amber-600">{e}</p>)}
                    </div>
                  )}
                  <button onClick={reset} className="text-sm text-brand-greenDark hover:underline">Import another file</button>
                </div>
              )}

              {/* Preview table */}
              {rows.length > 0 && !result && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Preview — first {Math.min(rows.length, 5)} of {rows.length} rows
                  </p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          {previewHeaders.map(h => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-gray-500 capitalize whitespace-nowrap">{h.replace(/_/g, ' ')}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {previewHeaders.map(h => (
                              <td key={h} className="px-3 py-2 text-gray-700 max-w-[150px] truncate">{row[h] || '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => setOpen(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                {result ? 'Close' : 'Cancel'}
              </button>
              {!result && (
                <button
                  onClick={handleImport}
                  disabled={isPending || rows.length === 0}
                  className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium transition-colors"
                >
                  {isPending ? `Importing ${rows.length} rows…` : `Import ${rows.length} contacts`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
