'use client'

import { useState, useTransition, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, CheckCircle2, AlertTriangle, Download } from 'lucide-react'

interface ImportResult {
  imported: number
  failed:   number
  errors:   string[]
}

export default function ImportLeadsModal() {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<ImportResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function handleClose() {
    setOpen(false)
    setResult(null)
    setParseError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setParseError(null)
    setResult(null)

    const file = fileRef.current?.files?.[0]
    if (!file) { setParseError('Please select a CSV file'); return }

    const text = await file.text()
    const lines = text.trim().split('\n').filter(l => l.trim())
    if (lines.length < 2) { setParseError('CSV must have a header row and at least one data row'); return }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''))
    const rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''))
      return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
    })

    startTransition(async () => {
      const res = await fetch('/api/crm/leads/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      })
      const data = await res.json()
      setResult(data)
      if (data.imported > 0) router.refresh()
    })
  }

  function downloadTemplate() {
    const csv = 'name,email,phone,zip,service_type,preferred_language,source,notes\n' +
                'Nguyen Van A,a@gmail.com,(832) 555-0100,77036,residential,vi,referral,High usage customer\n' +
                'Tran Thi B,b@gmail.com,(713) 555-0200,77450,commercial,en,phone,Nail salon owner'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'lead_import_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border border-gray-200 text-gray-600 text-sm px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <Upload size={15} />
        Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Import Leads from CSV</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>

            <div className="p-6">
              {!result ? (
                <>
                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
                    <p className="text-xs font-semibold text-blue-700 mb-1">Required CSV columns:</p>
                    <p className="text-xs text-blue-600 font-mono">name, email, phone, zip, service_type, preferred_language, source, notes</p>
                    <button
                      onClick={downloadTemplate}
                      className="mt-2 flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-medium"
                    >
                      <Download size={11} />
                      Download template
                    </button>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">Select CSV file</label>
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".csv,text/csv"
                        className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-brand-greenDark file:text-white hover:file:bg-brand-green cursor-pointer"
                      />
                    </div>

                    {parseError && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-3">
                        <AlertTriangle size={14} />
                        {parseError}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button type="button" onClick={handleClose}
                        className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors">
                        Cancel
                      </button>
                      <button type="submit" disabled={isPending}
                        className="flex-1 bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green disabled:opacity-50 font-medium">
                        {isPending ? 'Importing...' : 'Import Leads'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                /* Result screen */
                <div className="text-center">
                  {result.imported > 0 ? (
                    <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                  ) : (
                    <AlertTriangle size={40} className="text-amber-500 mx-auto mb-3" />
                  )}
                  <p className="font-semibold text-gray-900 mb-1">Import Complete</p>
                  <p className="text-sm text-green-700 font-medium">{result.imported} leads imported</p>
                  {result.failed > 0 && (
                    <p className="text-sm text-red-600">{result.failed} rows failed</p>
                  )}
                  {result.errors.length > 0 && (
                    <div className="mt-3 text-left bg-red-50 rounded-xl p-3 max-h-32 overflow-y-auto">
                      {result.errors.map((err, i) => (
                        <p key={i} className="text-xs text-red-600">{err}</p>
                      ))}
                    </div>
                  )}
                  <button
                    onClick={handleClose}
                    className="mt-4 w-full bg-brand-greenDark text-white py-2.5 rounded-xl text-sm hover:bg-brand-green font-medium"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
