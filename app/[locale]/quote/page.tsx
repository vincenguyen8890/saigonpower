'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { Home, Building2, CheckCircle, Zap, Shield } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { cn } from '@/lib/utils'

const schema = z.object({
  serviceType: z.enum(['residential', 'commercial']),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  zip: z.string().length(5).regex(/^\d{5}$/),
  businessName: z.string().optional(),
  monthlyUsageKwh: z.string().optional(),
  notes: z.string().optional(),
  preferredLanguage: z.enum(['vi', 'en']),
})

type FormData = z.infer<typeof schema>

export default function QuotePage() {
  const t = useTranslations('quote')
  const locale = useLocale()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      serviceType: 'residential',
      preferredLanguage: locale as 'vi' | 'en',
    },
  })

  const serviceType = watch('serviceType')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        router.push('/thank-you')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-light pt-24 pb-16">
      {/* Header */}
      <div className="bg-hero-gradient text-white py-12 -mt-24 pt-36">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 bg-brand-gold rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
          <p className="text-blue-200">{t('subtitle')}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-6">
        <div className="bg-white rounded-2xl shadow-card-hover border border-surface-border overflow-hidden">
          {/* Progress */}
          <div className="flex">
            {[1, 2].map((s) => (
              <div
                key={s}
                className={cn(
                  'flex-1 py-3 text-center text-sm font-medium transition-colors',
                  s <= step ? 'bg-brand-blue text-white' : 'bg-surface-muted text-gray-500'
                )}
              >
                {s === 1 ? t('stepService') : t('stepInfo')}
              </div>
            ))}
          </div>

          <div className="p-8">
            {step === 1 && (
              <div>
                <h2 className="text-xl font-bold text-brand-blue mb-6">{t('serviceType')}</h2>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {(['residential', 'commercial'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setValue('serviceType', type)}
                      className={cn(
                        'p-6 rounded-2xl border-2 text-center transition-all',
                        serviceType === type
                          ? 'border-brand-blue bg-blue-50 shadow-blue'
                          : 'border-surface-border hover:border-brand-blue/50'
                      )}
                    >
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3',
                        type === 'residential' ? 'bg-blue-100' : 'bg-amber-100'
                      )}>
                        {type === 'residential'
                          ? <Home size={22} className="text-brand-blue" />
                          : <Building2 size={22} className="text-amber-600" />
                        }
                      </div>
                      <div className="font-semibold text-gray-900">
                        {type === 'residential' ? t('residential') : t('commercial')}
                      </div>
                    </button>
                  ))}
                </div>
                <Button variant="primary" size="lg" fullWidth onClick={() => setStep(2)}>
                  {t('stepInfo')} →
                </Button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit(onSubmit)}>
                <h2 className="text-xl font-bold text-brand-blue mb-6">{t('stepInfo')}</h2>
                <div className="space-y-4">
                  <Input
                    label={t('nameLabel')}
                    placeholder={t('namePlaceholder')}
                    required
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label={t('emailLabel')}
                      type="email"
                      placeholder={t('emailPlaceholder')}
                      required
                      error={errors.email?.message}
                      {...register('email')}
                    />
                    <Input
                      label={t('phoneLabel')}
                      type="tel"
                      placeholder={t('phonePlaceholder')}
                      required
                      error={errors.phone?.message}
                      {...register('phone')}
                    />
                  </div>
                  <Input
                    label={t('zipLabel')}
                    placeholder={t('zipPlaceholder')}
                    maxLength={5}
                    required
                    error={errors.zip?.message}
                    {...register('zip')}
                  />
                  {serviceType === 'commercial' && (
                    <Input
                      label={t('businessLabel')}
                      placeholder={t('businessPlaceholder')}
                      {...register('businessName')}
                    />
                  )}
                  <Input
                    label={t('usageLabel')}
                    placeholder={t('usagePlaceholder')}
                    {...register('monthlyUsageKwh')}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('notesLabel')}</label>
                    <textarea
                      rows={3}
                      placeholder={t('notesPlaceholder')}
                      className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                      {...register('notes')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('languageLabel')}</label>
                    <div className="flex gap-3">
                      {(['vi', 'en'] as const).map((lang) => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => setValue('preferredLanguage', lang)}
                          className={cn(
                            'flex-1 py-2.5 rounded-xl border-2 text-sm font-medium transition-all',
                            watch('preferredLanguage') === lang
                              ? 'border-brand-blue bg-blue-50 text-brand-blue'
                              : 'border-surface-border text-gray-600 hover:border-gray-300'
                          )}
                        >
                          {lang === 'vi' ? `🇻🇳 ${t('langVI')}` : `🇺🇸 ${t('langEN')}`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <Button type="button" variant="secondary" size="lg" onClick={() => setStep(1)}>
                    ← {t('stepService')}
                  </Button>
                  <Button type="submit" variant="gold" size="lg" loading={loading} className="flex-1">
                    {loading ? t('submitting') : t('submitCTA')}
                  </Button>
                </div>

                <div className="flex items-center gap-2 mt-4 text-xs text-gray-500 justify-center">
                  <Shield size={12} />
                  {t('privacyNote')}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
