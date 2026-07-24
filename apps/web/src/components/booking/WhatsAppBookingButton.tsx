'use client'

import { useEffect, useMemo, useState } from 'react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { api } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { useI18n } from '@/contexts/I18nContext'

type BranchSettings = {
  whatsappNumber?: string | null
  phone?: string | null
}

type WhatsAppBookingButtonProps = {
  className?: string
  iconOnly?: boolean
  message?: string
}

const COPY = {
  en: {
    label: 'Book on WhatsApp',
    defaultMessage: 'Hello Afroglow, I would like to book an appointment.',
  },
  lt: {
    label: 'Rezervuoti per WhatsApp',
    defaultMessage: 'Sveiki, Afroglow, noreciau rezervuoti vizita.',
  },
} as const

function toWhatsAppUrl(phone: string, message: string) {
  const normalized = phone.replace(/[^\d]/g, '')
  if (!normalized) return null
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`
}

export default function WhatsAppBookingButton({ className, iconOnly = false, message }: WhatsAppBookingButtonProps) {
  const { locale } = useI18n()
  const copy = COPY[locale]
  const [settings, setSettings] = useState<BranchSettings | null>(null)

  useEffect(() => {
    let mounted = true
    api.get('/settings/branch')
      .then(({ data }) => {
        if (mounted) setSettings(data)
      })
      .catch(() => {
        if (mounted) setSettings({ whatsappNumber: '+37069150485' })
      })

    return () => {
      mounted = false
    }
  }, [])

  const href = useMemo(() => {
    const number = settings?.whatsappNumber || settings?.phone
    return number ? toWhatsAppUrl(number, message || copy.defaultMessage) : null
  }, [copy.defaultMessage, message, settings])

  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-green-500/40 bg-green-500/10 px-6 py-3 text-sm font-semibold text-green-400 transition-all duration-200 hover:border-green-500/70 hover:bg-green-500/15 hover:text-green-300',
        iconOnly && 'h-12 w-12 px-0 py-0 rounded-xl',
        className,
      )}
      aria-label={copy.label}
    >
      <WhatsAppIcon size={iconOnly ? 22 : 17} />
      {!iconOnly && copy.label}
    </a>
  )
}
