'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocale } from 'next-intl'
import { Phone, PhoneOff, Mic, MicOff, Zap, Loader2 } from 'lucide-react'
import Vapi from '@vapi-ai/web'
import type { CreateAssistantDTO } from '@vapi-ai/web/dist/api'

type CallStatus = 'idle' | 'connecting' | 'active' | 'ending'

const VAPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? ''
const ASSISTANT_ID = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID

const SYSTEM_PROMPT_VI = `Bạn là nhân viên tư vấn khách hàng (CSR) của Saigon Power — công ty chuyên so sánh và tư vấn gói điện Texas cho cộng đồng người Việt tại Mỹ.

THÔNG TIN CÔNG TY:
- Tên: Saigon Power
- Điện thoại: (832) 937-9999
- Website: giadienre.com
- Chuyên tư vấn gói điện Texas, hỗ trợ tiếng Việt 100%

NHIỆM VỤ:
1. Chào hỏi khách hàng bằng tiếng Việt thân thiện
2. Giúp so sánh các gói điện Texas (fixed rate, variable rate, green energy)
3. Tư vấn gia hạn hợp đồng điện (thường cần gia hạn sau 12-24 tháng)
4. Giải thích hóa đơn điện, mã ZIP, kWh usage
5. Hướng dẫn đăng ký gói mới hoặc chuyển nhà cung cấp (TXU, Reliant, Gexa, Champion, Green Mountain, v.v.)
6. Nhắc khách hàng kiểm tra ngày hết hạn hợp đồng để tránh rate tự động tăng

QUY TẮC:
- Luôn nói tiếng Việt, giọng thân thiện và chuyên nghiệp
- Nếu không biết thông tin cụ thể, mời khách gọi (832) 937-9999 hoặc vào giadienre.com
- Câu trả lời ngắn gọn, rõ ràng (1-3 câu mỗi lần)
- Không hứa hẹn giá cụ thể mà không có dữ liệu thực
- Luôn hỏi mã ZIP để tư vấn chính xác hơn`

const SYSTEM_PROMPT_EN = `You are a customer service representative (CSR) for Saigon Power — a Texas electricity plan comparison and advisory company serving the Vietnamese-American community.

COMPANY INFO:
- Name: Saigon Power
- Phone: (832) 937-9999
- Website: giadienre.com
- Specializes in Texas electricity plan comparisons with Vietnamese-language support

YOUR JOB:
1. Greet customers warmly
2. Help compare Texas electricity plans (fixed rate, variable rate, green energy)
3. Advise on contract renewals (typically every 12-24 months)
4. Explain electricity bills, ZIP codes, kWh usage
5. Guide switching providers (TXU, Reliant, Gexa, Champion, Green Mountain, etc.)
6. Remind customers to check contract expiration to avoid automatic rate increases

RULES:
- Be friendly and professional
- If unsure, direct customers to call (832) 937-9999 or visit giadienre.com
- Keep responses concise (1-3 sentences)
- Never promise specific rates without real-time data
- Always ask for ZIP code for accurate recommendations`

const INLINE_ASSISTANT_VI: CreateAssistantDTO = {
  name: 'Saigon Power CSR',
  firstMessage: 'Xin chào! Tôi là nhân viên tư vấn của Saigon Power. Tôi có thể giúp bạn so sánh gói điện Texas, tư vấn gia hạn hợp đồng, hoặc giải đáp thắc mắc về hóa đơn điện. Bạn cần hỗ trợ gì hôm nay?',
  transcriber: {
    provider: 'deepgram' as const,
    model: 'nova-2',
    language: 'vi',
  },
  model: {
    provider: 'openai' as const,
    model: 'gpt-4o',
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT_VI }],
  },
  voice: {
    provider: 'openai' as const,
    voiceId: 'shimmer',
  },
}

const INLINE_ASSISTANT_EN: CreateAssistantDTO = {
  name: 'Saigon Power CSR',
  firstMessage: "Hi there! I'm Saigon Power's customer service assistant. I can help you compare Texas electricity plans, advise on contract renewals, or answer billing questions. What can I help you with today?",
  transcriber: {
    provider: 'deepgram' as const,
    model: 'nova-2',
    language: 'en',
  },
  model: {
    provider: 'openai' as const,
    model: 'gpt-4o',
    messages: [{ role: 'system' as const, content: SYSTEM_PROMPT_EN }],
  },
  voice: {
    provider: 'openai' as const,
    voiceId: 'shimmer',
  },
}

export default function VapiVoiceWidget() {
  const locale = useLocale()
  const isVi = locale === 'vi'

  const [status, setStatus] = useState<CallStatus>('idle')
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const vapiRef = useRef<Vapi | null>(null)

  // Initialise Vapi once
  useEffect(() => {
    if (!VAPI_PUBLIC_KEY) return
    vapiRef.current = new Vapi(VAPI_PUBLIC_KEY)
    const vapi = vapiRef.current

    vapi.on('call-start', () => setStatus('active'))
    vapi.on('call-end', () => {
      setStatus('idle')
      setMuted(false)
      setVolume(0)
    })
    vapi.on('volume-level', (v: number) => setVolume(v))
    vapi.on('error', (e: Error) => {
      console.error('[Vapi]', e)
      setError(isVi ? 'Có lỗi xảy ra. Vui lòng thử lại.' : 'Something went wrong. Please try again.')
      setStatus('idle')
    })

    return () => {
      vapi.stop()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startCall = useCallback(async () => {
    if (!vapiRef.current || !VAPI_PUBLIC_KEY) {
      setError(
        isVi
          ? 'Chưa cấu hình VAPI_PUBLIC_KEY.'
          : 'VAPI_PUBLIC_KEY is not configured.'
      )
      return
    }
    setError(null)
    setStatus('connecting')

    try {
      if (ASSISTANT_ID) {
        await vapiRef.current.start(ASSISTANT_ID)
      } else {
        await vapiRef.current.start(isVi ? INLINE_ASSISTANT_VI : INLINE_ASSISTANT_EN)
      }
    } catch (e) {
      console.error('[Vapi start]', e)
      setError(isVi ? 'Không thể kết nối. Vui lòng thử lại.' : 'Could not connect. Please try again.')
      setStatus('idle')
    }
  }, [isVi])

  const endCall = useCallback(() => {
    setStatus('ending')
    vapiRef.current?.stop()
  }, [])

  const toggleMute = useCallback(() => {
    if (!vapiRef.current) return
    const next = !muted
    vapiRef.current.setMuted(next)
    setMuted(next)
  }, [muted])

  // Clear error after 4s
  useEffect(() => {
    if (!error) return
    const t = setTimeout(() => setError(null), 4000)
    return () => clearTimeout(t)
  }, [error])

  if (!VAPI_PUBLIC_KEY) return null

  const isActive = status === 'active'
  const isConnecting = status === 'connecting' || status === 'ending'

  // Volume ring: scale 1 → 1.35 based on assistant volume
  const ringScale = 1 + volume * 0.35

  return (
    <div className="fixed bottom-20 left-4 sm:bottom-6 z-50 flex flex-col items-center gap-2">
      {/* Error toast */}
      {error && (
        <div className="bg-red-500 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg max-w-[200px] text-center">
          {error}
        </div>
      )}

      {/* Status label when active */}
      {isActive && (
        <div className="bg-white border border-gray-200 shadow-md rounded-xl px-3 py-2 text-xs text-center min-w-[140px]">
          <div className="flex items-center justify-center gap-1.5 text-brand-greenDark font-semibold mb-1">
            <Zap size={11} />
            Saigon Power CSR
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-gray-500">{isVi ? 'Đang kết nối...' : 'Connected'}</span>
          </div>
        </div>
      )}

      {/* Mute button — visible during active call */}
      {isActive && (
        <button
          onClick={toggleMute}
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
            muted
              ? 'bg-red-50 border-red-300 text-red-500 hover:bg-red-100'
              : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
          aria-label={muted ? (isVi ? 'Bật mic' : 'Unmute') : (isVi ? 'Tắt mic' : 'Mute')}
        >
          {muted ? <MicOff size={16} /> : <Mic size={16} />}
        </button>
      )}

      {/* Main call button */}
      <div className="relative">
        {/* Volume pulse ring */}
        {isActive && volume > 0.05 && (
          <span
            className="absolute inset-0 rounded-full bg-brand-greenDark opacity-20 pointer-events-none transition-transform duration-75"
            style={{ transform: `scale(${ringScale})` }}
          />
        )}

        <button
          onClick={isActive ? endCall : startCall}
          disabled={isConnecting}
          className={`relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
            isActive
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200'
              : isConnecting
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-brand-greenDark hover:bg-brand-green text-white shadow-[0_4px_24px_rgba(20,83,45,0.4)] hover:scale-105'
          }`}
          aria-label={
            isActive
              ? (isVi ? 'Kết thúc cuộc gọi' : 'End call')
              : (isVi ? 'Gọi tư vấn AI tiếng Việt' : 'Start AI voice call')
          }
        >
          {isConnecting ? (
            <Loader2 size={22} className="animate-spin" />
          ) : isActive ? (
            <PhoneOff size={22} />
          ) : (
            <Phone size={22} />
          )}
        </button>
      </div>

      {/* Tooltip on idle */}
      {status === 'idle' && (
        <span className="text-[10px] text-gray-400 text-center leading-tight max-w-[60px]">
          CALL US
        </span>
      )}
    </div>
  )
}
