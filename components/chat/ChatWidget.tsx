'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { MessageCircle, X, Send, Zap, Phone, BarChart2, RefreshCw, ChevronDown } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const QUICK_REPLIES_VI = [
  { label: 'So sánh giá điện', icon: BarChart2, href: '/compare' },
  { label: 'Nhận báo giá miễn phí', icon: Zap, href: '/quote' },
  { label: 'Hỏi về gia hạn hợp đồng', icon: RefreshCw, message: 'Hợp đồng điện của tôi sắp hết hạn, tôi cần làm gì?' },
  { label: 'Gọi tư vấn ngay', icon: Phone, tel: '(832) 937-9999' },
]

const QUICK_REPLIES_EN = [
  { label: 'Compare plans', icon: BarChart2, href: '/compare' },
  { label: 'Get a free quote', icon: Zap, href: '/quote' },
  { label: 'Ask about renewal', icon: RefreshCw, message: 'My electricity contract is expiring soon. What should I do?' },
  { label: 'Call us now', icon: Phone, tel: '(832) 937-9999' },
]

const GREETING_VI = 'Xin chào! 👋 Tôi là trợ lý AI của Saigon Power. Tôi có thể giúp bạn so sánh gói điện Texas, tìm hiểu về gia hạn hợp đồng, hoặc kết nối bạn với chuyên gia của chúng tôi. Bạn cần hỗ trợ gì hôm nay?'
const GREETING_EN = 'Hi there! 👋 I\'m Saigon Power\'s AI assistant. I can help you compare Texas electricity plans, learn about contract renewals, or connect you with our team. What can I help you with today?'

function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

function MessageBubble({ msg, isStreaming }: { msg: Message; isStreaming?: boolean }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-brand-greenDark flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
          <Zap size={12} className="text-white" />
        </div>
      )}
      <div
        className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-greenDark text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {msg.content}
        {isStreaming && <span className="inline-block w-1.5 h-4 bg-gray-400 ml-0.5 animate-pulse rounded-sm" />}
      </div>
    </div>
  )
}

export default function ChatWidget() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: isVi ? GREETING_VI : GREETING_EN },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(1)
  const [showScrollDown, setShowScrollDown] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesRef = useRef<HTMLDivElement>(null)

  const quickReplies = isVi ? QUICK_REPLIES_VI : QUICK_REPLIES_EN

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, open])

  const handleScroll = useCallback(() => {
    if (!messagesRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = messagesRef.current
    setShowScrollDown(scrollHeight - scrollTop - clientHeight > 80)
  }, [])

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: Message = { role: 'user', content: trimmed }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Placeholder for streaming assistant message
    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      })

      if (!res.ok || !res.body) throw new Error('Failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        accumulated += decoder.decode(value, { stream: true })
        const finalText = accumulated
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: finalText }
          return updated
        })
      }
    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: isVi
            ? 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại hoặc gọi (832) 937-9999.'
            : 'Sorry, something went wrong. Please try again or call (832) 937-9999.',
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }, [messages, loading, isVi])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="relative w-14 h-14 bg-brand-greenDark hover:bg-brand-green text-white rounded-full shadow-[0_4px_24px_rgba(20,83,45,0.4)] flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            aria-label={isVi ? 'Mở chat hỗ trợ' : 'Open chat support'}
          >
            <MessageCircle size={24} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </button>
        )}

        {/* Chat panel */}
        {open && (
          <div className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
            style={{ height: '520px', maxHeight: 'calc(100vh - 120px)' }}
          >
            {/* Header */}
            <div className="bg-brand-greenDark px-4 py-3.5 flex items-center gap-3 flex-shrink-0">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <Zap size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm">Saigon Power AI</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <p className="text-green-200 text-xs">{isVi ? 'Hoạt động ngay bây giờ' : 'Active now'}</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-green-200 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={messagesRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-1"
            >
              {messages.map((msg, i) => (
                <MessageBubble
                  key={i}
                  msg={msg}
                  isStreaming={loading && i === messages.length - 1 && msg.role === 'assistant'}
                />
              ))}
              {loading && messages[messages.length - 1]?.content === '' && <TypingDots />}
              <div ref={bottomRef} />
            </div>

            {/* Scroll to bottom */}
            {showScrollDown && (
              <button
                onClick={() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="absolute bottom-20 right-6 w-7 h-7 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-500 hover:text-gray-800"
              >
                <ChevronDown size={14} />
              </button>
            )}

            {/* Quick replies — shown only on first message */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2 flex-shrink-0">
                {quickReplies.map(({ label, icon: Icon, href, tel, message }) => {
                  if (href) {
                    return (
                      <Link
                        key={label}
                        href={href}
                        className="flex items-center gap-1.5 text-xs bg-green-50 text-brand-greenDark border border-green-200 px-3 py-1.5 rounded-full font-medium hover:bg-green-100 transition-colors"
                      >
                        <Icon size={12} />
                        {label}
                      </Link>
                    )
                  }
                  if (tel) {
                    return (
                      <a
                        key={label}
                        href={`tel:+18329379999`}
                        className="flex items-center gap-1.5 text-xs bg-green-50 text-brand-greenDark border border-green-200 px-3 py-1.5 rounded-full font-medium hover:bg-green-100 transition-colors"
                      >
                        <Icon size={12} />
                        {label}
                      </a>
                    )
                  }
                  return (
                    <button
                      key={label}
                      onClick={() => sendMessage(message!)}
                      className="flex items-center gap-1.5 text-xs bg-green-50 text-brand-greenDark border border-green-200 px-3 py-1.5 rounded-full font-medium hover:bg-green-100 transition-colors"
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={isVi ? 'Nhập câu hỏi của bạn...' : 'Type your question...'}
                  disabled={loading}
                  className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none min-w-0 disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 bg-brand-greenDark hover:bg-brand-green text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-center text-gray-300 text-xs mt-1.5">
                {isVi ? 'Powered by Claude AI · Saigon Power' : 'Powered by Claude AI · Saigon Power'}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
