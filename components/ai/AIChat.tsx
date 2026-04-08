'use client'

import { useRef, useEffect, useState } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'

const SUGGESTED_PROMPTS = [
  'Who needs attention today?',
  'Which contracts expire this month?',
  'Show me stale leads not contacted in 3+ days',
  'Draft a follow-up for my newest lead',
  'Summarize this week\'s pipeline',
]

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} className="font-semibold text-[#0F172A]">{part.slice(2, -2)}</strong>
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i}>{part.slice(1, -1)}</em>
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} className="bg-slate-200 px-1 rounded text-[11px] font-mono">{part.slice(1, -1)}</code>
    return part
  })
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: string[] = []
  let keyIdx = 0

  function flushList() {
    if (listItems.length === 0) return
    elements.push(
      <ul key={`ul-${keyIdx++}`} className="list-disc list-inside space-y-0.5 my-1">
        {listItems.map((item, i) => (
          <li key={i} className="text-[13px] leading-relaxed">{renderInline(item)}</li>
        ))}
      </ul>
    )
    listItems = []
  }

  for (const line of lines) {
    const bullet = line.match(/^[-*•]\s+(.+)/)
    if (bullet) {
      listItems.push(bullet[1])
      continue
    }
    flushList()
    if (line.trim() === '') {
      elements.push(<div key={keyIdx++} className="h-1" />)
    } else if (line.match(/^#{1,3}\s/)) {
      elements.push(
        <p key={keyIdx++} className="text-[13px] font-bold text-[#0F172A] mt-1.5 mb-0.5">
          {renderInline(line.replace(/^#{1,3}\s/, ''))}
        </p>
      )
    } else {
      elements.push(
        <p key={keyIdx++} className="text-[13px] leading-relaxed">
          {renderInline(line)}
        </p>
      )
    }
  }
  flushList()
  return <div className="space-y-0.5">{elements}</div>
}

// ─────────────────────────────────────────────────────────────────────────────

export default function AIChat() {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/ai/chat' }),
  })

  const isStreaming = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function submit(text: string) {
    if (!text.trim() || isStreaming) return
    sendMessage({ text })
    setInput('')
    inputRef.current?.focus()
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-[0_1px_3px_rgba(15,23,42,0.06)] flex flex-col h-[560px]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#00C853] to-[#2979FF] flex items-center justify-center">
          <Bot size={14} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">AI Sales Manager</p>
          <p className="text-[11px] text-slate-400">Ask anything about your CRM</p>
        </div>
        <div className={`ml-auto flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full ${
          isStreaming ? 'bg-[#E8FFF1] text-[#00A846]' : 'bg-slate-100 text-slate-500'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#00C853] animate-pulse' : 'bg-slate-400'}`} />
          {isStreaming ? 'Thinking…' : 'Ready'}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00C853] to-[#2979FF] flex items-center justify-center mb-3">
              <Sparkles size={20} className="text-white" />
            </div>
            <p className="text-sm font-semibold text-[#0F172A] mb-1">AI Sales Manager</p>
            <p className="text-xs text-slate-400 mb-5 max-w-[240px]">
              Ask me about leads, deals, contracts, renewals, or anything in your CRM.
            </p>
            <div className="w-full space-y-1.5">
              {SUGGESTED_PROMPTS.map(p => (
                <button
                  key={p}
                  onClick={() => submit(p)}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:border-[#00C853] hover:text-[#00A846] hover:bg-[#E8FFF1] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map(msg => {
            const text = msg.parts
              .filter(p => p.type === 'text')
              .map(p => (p as { type: 'text'; text: string }).text)
              .join('')

            const isUser = msg.role === 'user'
            return (
              <div key={msg.id} className={`flex gap-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  isUser ? 'bg-[#EBF2FF]' : 'bg-gradient-to-br from-[#00C853] to-[#2979FF]'
                }`}>
                  {isUser
                    ? <User size={12} className="text-[#2979FF]" />
                    : <Bot size={12} className="text-white" />
                  }
                </div>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-xl ${
                  isUser
                    ? 'bg-[#EBF2FF] text-[#0F172A] rounded-tr-sm text-[13px] leading-relaxed'
                    : 'bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100'
                }`}>
                  {isUser
                    ? text
                    : text
                      ? <MarkdownText text={text} />
                      : isStreaming
                        ? <span className="flex items-center gap-1.5 text-slate-400 text-[13px]">
                            <Loader2 size={11} className="animate-spin" /> Thinking…
                          </span>
                        : null
                  }
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 flex-shrink-0">
        {messages.length > 0 && (
          <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1">
            {SUGGESTED_PROMPTS.slice(0, 3).map(p => (
              <button
                key={p}
                onClick={() => submit(p)}
                disabled={isStreaming}
                className="flex-shrink-0 text-[10px] px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:border-[#00C853] hover:text-[#00A846] transition-colors disabled:opacity-40"
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <form
          onSubmit={e => { e.preventDefault(); submit(input) }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={isStreaming}
            placeholder="Ask about leads, deals, renewals…"
            className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00C853]/30 focus:border-[#00C853] transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="w-9 h-9 flex items-center justify-center bg-[#00C853] hover:bg-[#00A846] disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl transition-colors flex-shrink-0"
          >
            {isStreaming
              ? <Loader2 size={14} className="animate-spin" />
              : <Send size={14} />
            }
          </button>
        </form>
      </div>
    </div>
  )
}
