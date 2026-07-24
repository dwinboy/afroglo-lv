'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import WhatsAppBookingButton from '@/components/booking/WhatsAppBookingButton'

const COPY = {
  en: {
    book: 'Book now',
  },
  lt: {
    book: 'Rezervuoti',
  },
} as const

export default function MobileBookingBar() {
  const pathname = usePathname()
  const { locale } = useI18n()
  const copy = COPY[locale]

  if (pathname === '/book') return null

  return (
    <div
      className="fixed inset-x-3 z-40 md:hidden"
      /* Clears the iOS home indicator instead of sitting under it */
      style={{ bottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
    >
      <div className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl border border-luxury-border bg-luxury-surface/95 p-2 shadow-luxury backdrop-blur-xl">
        <Link href="/book" className="btn-gold h-12 px-4 text-sm" aria-label={copy.book}>
          <CalendarDays size={16} />
          {copy.book}
        </Link>
        <WhatsAppBookingButton iconOnly />
      </div>
    </div>
  )
}
