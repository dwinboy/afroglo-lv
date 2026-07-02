'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, ChevronRight, Scissors } from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'

interface Service {
  id: string; name: string; category: string; price: number
  duration: number; icon: string | null; description: string | null; isPopular: boolean
}

const SERVICE_VISUALS = [
  {
    keywords: ['beard', 'trim', 'shave'],
    src: '/images/haircuts/beard-fade.jpg',
    alt: 'Fresh beard shape and skin fade',
  },
  {
    keywords: ['design', 'line', 'fade'],
    src: '/images/haircuts/design-beard.jpg',
    alt: 'Haircut with detailed line design',
  },
  {
    keywords: ['haircut', 'kids', 'cut'],
    src: '/images/haircuts/crisp-lineup.jpeg',
    alt: 'Crisp haircut line up',
  },
]

const COPY = {
  en: {
    all: 'All',
    heroTitle: ['Our', 'Services'],
    heroText: 'Premium hair & beauty services delivered by verified experts. All services include a complimentary consultation.',
    popular: 'Popular',
    book: 'Book',
    min: 'min',
    empty: 'No services available yet.',
    fallback: (name: string) => `Book a ${name} with one of our professionals.`,
    ctaTitle: "Can't Find What You Need?",
    ctaText: "Contact us and we'll connect you with the perfect professional for your specific needs.",
    consultation: 'Book a Consultation',
    browse: 'Browse Professionals',
    emptyCta: 'Explore professionals',
  },
  lt: {
    all: 'Visos',
    heroTitle: ['Mūsų', 'paslaugos'],
    heroText: 'Aukštos kokybės plaukų ir grožio paslaugos, kurias teikia patikrinti specialistai. Kiekviena paslauga apima trumpą konsultaciją.',
    popular: 'Populiaru',
    book: 'Rezervuoti',
    min: 'min.',
    empty: 'Paslaugų kol kas nėra.',
    fallback: (name: string) => `Rezervuokite paslaugą „${name}“ pas vieną iš mūsų specialistų.`,
    ctaTitle: 'Neradote tinkamos paslaugos?',
    ctaText: 'Susisiekite su mumis ir padėsime rasti tinkamiausią specialistą jūsų poreikiams.',
    consultation: 'Rezervuoti konsultaciją',
    browse: 'Peržiūrėti specialistus',
    emptyCta: 'Peržiūrėti specialistus',
  },
} as const

function getServiceVisual(service: Service) {
  const haystack = `${service.name} ${service.category} ${service.description ?? ''}`.toLowerCase()
  return SERVICE_VISUALS.find(visual => visual.keywords.some(keyword => haystack.includes(keyword)))
}

function ServiceCardSkeleton() {
  return (
    <div className="card-luxury overflow-hidden">
      <div className="skeleton-luxury h-44 rounded-none" />
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <div className="skeleton-luxury h-10 w-10 rounded-xl" />
          <div className="skeleton-luxury h-6 w-16" />
        </div>
        <div className="skeleton-luxury h-5 w-2/3" />
        <div className="space-y-2">
          <div className="skeleton-luxury h-3 w-full" />
          <div className="skeleton-luxury h-3 w-4/5" />
        </div>
        <div className="flex items-center justify-between border-t border-luxury-border pt-4">
          <div className="skeleton-luxury h-4 w-20" />
          <div className="skeleton-luxury h-8 w-20" />
        </div>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { locale } = useI18n()
  const copy = COPY[locale]
  const [services,       setServices]       = useState<Service[]>([])
  const [loading,        setLoading]        = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    api.get('/services').then(({ data }) => {
      setServices(Array.isArray(data) ? data : [])
    }).catch(() => setServices([])).finally(() => setLoading(false))
  }, [])

  // Build category tabs dynamically from loaded services
  const categories = ['All', ...Array.from(new Set(services.map(s => s.category))).sort()]

  const filtered = activeCategory === 'All'
    ? services
    : services.filter(s => s.category === activeCategory)

  return (
    <div className="min-h-screen bg-luxury-black pt-20">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="flex justify-center mb-4"><div className="gold-line" /></div>
            <h1 className="section-title mb-6">{copy.heroTitle[0]} <span className="gold-shimmer">{copy.heroTitle[1]}</span></h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {copy.heroText}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Category filter */}
      {!loading && categories.length > 1 && (
        <section className="py-12 bg-luxury-charcoal/30 sticky top-16 z-40 border-b border-luxury-border backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={cn('px-5 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                    activeCategory === cat
                      ? 'bg-gradient-gold text-luxury-black shadow-gold'
                      : 'border border-luxury-border text-gray-400 hover:border-gold-500/30 hover:text-gold-400')}>
                  {cat === 'All' ? copy.all : cat}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services grid */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" aria-label="Loading services">
              {Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card-luxury mx-auto max-w-xl p-10 text-center">
              <Scissors size={34} className="mx-auto mb-4 text-gold-400" />
              <h2 className="font-serif text-2xl font-bold text-white mb-2">{copy.empty}</h2>
              <p className="text-sm text-gray-400 mb-6">{copy.ctaText}</p>
              <Link href="/professionals" className="btn-outline-gold">
                {copy.emptyCta} <ChevronRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((service, i) => {
                const visual = getServiceVisual(service)

                return (
                  <motion.div key={service.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="card-luxury overflow-hidden flex flex-col">
                    {visual ? (
                      <div className="relative h-44 border-b border-luxury-border overflow-hidden">
                        <Image
                          src={visual.src}
                          alt={visual.alt}
                          fill
                          className="object-cover transition-transform duration-500 hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 25vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      </div>
                    ) : null}
                    <div className="p-6 flex flex-1 flex-col">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-3xl">{service.icon ?? '✂️'}</span>
                        <div className="flex flex-col items-end gap-1">
                          {service.isPopular && <span className="badge-gold text-xs">{copy.popular}</span>}
                          <span className="text-lg font-bold text-gradient-gold">€{service.price}</span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-white mb-2">{service.name}</h3>
                      <p className="text-sm text-gray-400 leading-relaxed flex-1 mb-4">
                        {service.description ?? copy.fallback(service.name)}
                      </p>
                      <div className="flex items-center gap-4 pt-4 border-t border-luxury-border">
                        <div className="flex items-center gap-1.5 text-xs text-gray-400">
                          <Clock size={13} className="text-gold-400" />
                          {service.duration} {copy.min}
                        </div>
                        <Link href={`/book?service=${service.id}`}
                          className="ml-auto btn-gold text-xs py-1.5 px-4">
                          {copy.book} <ChevronRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-luxury-charcoal/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-6">{copy.ctaTitle}</h2>
          <p className="text-gray-400 mb-8">
            {copy.ctaText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-gold text-base px-8 py-4">{copy.consultation}</Link>
            <Link href="/professionals" className="btn-outline-gold text-base px-8 py-4">{copy.browse}</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
