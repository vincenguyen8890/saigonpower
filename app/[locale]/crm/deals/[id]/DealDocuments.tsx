'use client'

import { useState, useRef, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Paperclip, Upload, Trash2, FileText, Loader2 } from 'lucide-react'
import type { DealDocument } from '@/lib/supabase/queries'

interface Props {
  dealId: string
  documents: DealDocument[]
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function DealDocuments({ dealId, documents: initialDocs }: Props) {
  const [docs, setDocs] = useState(initialDocs)
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        const form = new FormData()
        form.append('file', file)
        form.append('dealId', dealId)
        await fetch('/api/crm/deals/documents', { method: 'POST', body: form })
      }
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  function handleDelete(fileName: string) {
    startTransition(async () => {
      await fetch(`/api/crm/deals/documents?dealId=${encodeURIComponent(dealId)}&fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      })
      setDocs(prev => prev.filter(d => d.name !== fileName))
      router.refresh()
    })
  }

  const isLoading = uploading || isPending

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900 flex items-center gap-2">
          <Paperclip size={16} className="text-brand-green" />
          Documents
          {docs.length > 0 && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{docs.length}</span>
          )}
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 text-xs border border-gray-200 text-gray-600 px-2.5 py-1.5 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.xlsx,.csv"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone */}
      <div
        className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center mb-4 hover:border-brand-green transition-colors cursor-pointer"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
      >
        <Upload size={20} className="text-gray-300 mx-auto mb-1" />
        <p className="text-xs text-gray-400">Drop files here or click to browse</p>
        <p className="text-[10px] text-gray-300 mt-0.5">PDF, DOC, PNG, JPG, XLSX</p>
      </div>

      {docs.length === 0 ? (
        <p className="text-xs text-gray-400 text-center py-2">No documents uploaded yet</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.name} className="flex items-center gap-3 p-2.5 border border-gray-100 rounded-xl hover:bg-gray-50 group">
              <FileText size={14} className="text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-gray-900 hover:text-brand-green truncate block"
                >
                  {doc.name}
                </a>
                <p className="text-[10px] text-gray-400">{formatBytes(doc.size)}</p>
              </div>
              <button
                onClick={() => handleDelete(doc.name)}
                disabled={isPending}
                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all disabled:opacity-50"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
