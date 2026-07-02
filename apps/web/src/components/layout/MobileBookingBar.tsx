'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Phone } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

const COPY = {
  en: {
    book: 'Book now',
    call: 'Call',
  },
  lt: {
    book: 'Rezervuoti',
    call: 'Skambinti',
  },
} as const

export default function MobileBookingBar() {
  const pathname = usePathname()
  const { locale } = useI18n()
  const copy = COPY[locale]

  if (pathname === '/book') return null

  return (
    <div className="fixed inset-x-3 bottom-3 z-40 md:hidden">
      <div className="grid grid-cols-[1fr_auto] gap-2 rounded-2xl border border-luxury-border bg-luxury-surface/95 p-2 shadow-luxury backdrop-blur-xl">
        <Link href="/book" className="btn-gold h-12 px-4 text-sm">
          <CalendarDays size={16} />
          {copy.book}
        </Link>
        <a
          href="tel:+37069150485"
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-luxury-border text-gold-400 transition-colors hover:border-gold-500/40 hover:bg-gold-500/10"
          aria-label={copy.call}
        >
          <Phone size={17} />
        </a>
      </div>
    </div>
  )
}
