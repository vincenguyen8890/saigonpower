'use client'

import { useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Bot, Send, Loader2, Sparkles, X, ChevronDown } from 'lucide-react'

interface Props {
  dealId: string
}

const STARTER_PROMPTS = [
  'What should I do next to close this deal?',
  'What risks do you see?',
  'What information am I missing?',
  'Write me a follow-up message for this customer',
]

export default function DealCoachPanel({ dealId }: Props) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/ai/deal-coach',
      body: { dealId },
    }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  function submit(text: string) {
    if (!text.trim() || isStreaming) return
    sendMessage({ text })
    setInput('')
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-sm border border-purple-200 text-purple-700 bg-purple-50 px-3 py-2 rounded-xl hover:bg-purple-100 transition-colors font-medium"
      >
        <Sparkles size={14} />
        Coach Me
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden" style={{ maxHeight: '520px' }}>
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 flex-shrink-0">
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
          <Bot size={13} className="text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">Deal Coach</p>
          <p className="text-[10px] text-purple-200">AI-powered deal analysis</p>
        </div>
        <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {messages.length === 0 ? (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 text-center mb-3">Ask me anything about this deal</p>
            {STARTER_PROMPTS.map(p => (
              <button
                key={p}
                onClick={() => submit(p)}
                className="w-full text-left text-[12px] px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        ) : (
          messages.map(msg => {
            const text = msg.parts
              .filter(p => p.type === 'text')
              .map(p => (p as { type: 'text'; text: string }).text)
              .join('')
            const isUser = msg.role === 'user'
            return (
              <div key={msg.id} className={`flex gap-2 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-[12px] leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-purple-600 text-white rounded-tr-sm'
                    : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}>
                  {text || (isStreaming && !isUser ? (
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Loader2 size={10} className="animate-spin" /> Thinking…
                    </span>
                  ) : '')}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input */}
      <div className="px-3 pb-3 flex-shrink-0 border-t border-slate-100 pt-3">
        <form onSubmit={e => { e.preventDefault(); submit(input) }} className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask the coach…"
            className="flex-1 px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-8 h-8 flex items-center justify-center bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors flex-shrink-0"
          >
            {isStreaming ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </form>
      </div>
    </div>
  )
}
