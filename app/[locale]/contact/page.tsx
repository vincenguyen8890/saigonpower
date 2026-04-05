'use client'

import { useState, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Phone, Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'

export default function ContactPage() {
  const t = useTranslations('contact')
  const locale = useLocale()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const form = e.currentTarget
    const name    = (form.elements.namedItem('name')    as HTMLInputElement).value
    const email   = (form.elements.namedItem('email')   as HTMLInputElement).value
    const phone   = (form.elements.namedItem('phone')   as HTMLInputElement).value
    const subject = (form.elements.namedItem('subject') as HTMLInputElement).value
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          zip: '00000',           // Contact form doesn't collect ZIP
          serviceType: 'residential',
          preferredLanguage: locale,
          source: 'contact_form',
          notes: `Subject: ${subject}\n\n${message}`,
        }),
      })
    } catch {
      // Always show success to user — don't block on network errors
    }

    setSubmitted(true)
    setLoading(false)
  }

  const contactItems = [
    { icon: Phone, label: t('phone'), value: '(832) 937-9999', href: 'tel:+18329379999' },
    { icon: Mail, label: t('email'), value: 'info@saigonllc.com', href: 'mailto:info@saigonllc.com' },
    { icon: MapPin, label: t('officeTitle'), value: 'Houston, Texas', href: null },
    { icon: Clock, label: t('hours'), value: t('hoursDetail'), href: null },
  ]

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <section className="bg-hero-gradient text-white pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
          <p className="text-blue-200 text-lg">{t('subtitle')}</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-10">
          {/* Contact info */}
          <div className="lg:col-span-2 space-y-4">
            {contactItems.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="bg-white rounded-2xl p-5 shadow-card border border-surface-border flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-brand-blue" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-0.5">{label}</div>
                  {href ? (
                    <a href={href} className="font-semibold text-brand-blue hover:underline">{value}</a>
                  ) : (
                    <div className="font-semibold text-gray-800">{value}</div>
                  )}
                </div>
              </div>
            ))}

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-card border border-surface-border h-48 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <MapPin size={32} className="mx-auto mb-2 text-brand-blue" />
                <p className="text-sm">Houston, TX</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-card border border-surface-border p-8">
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-brand-blue mb-2">{t('successMsg')}</h3>
                  <p className="text-gray-600">
                    {locale === 'vi' ? 'Chúng tôi sẽ phản hồi trong vòng 24 giờ.' : "We'll respond within 24 hours."}
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-bold text-brand-blue mb-6">{t('formTitle')}</h2>
                  <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input name="name" label={t('nameLabel')} placeholder="Nguyễn Văn A" required />
                      <Input name="email" label={t('emailLabel')} type="email" placeholder="email@example.com" required />
                    </div>
                    <Input name="phone" label={t('phoneLabel')} type="tel" placeholder="(832) 555-0100" />
                    <Input name="subject" label={t('subjectLabel')} placeholder={locale === 'vi' ? 'Tôi cần tư vấn gói điện' : 'I need electricity advice'} />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('messageLabel')}</label>
                      <textarea
                        name="message"
                        rows={4}
                        placeholder={t('messagePlaceholder')}
                        className="w-full border border-surface-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue resize-none"
                        required
                      />
                    </div>
                    <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
                      <Send size={16} /> {t('submitCTA')}
                    </Button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
