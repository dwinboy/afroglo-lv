'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Search, ChevronRight, Clock, RotateCcw, Users } from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { cn, formatPrice, getInitials } from '@/lib/utils'

type Professional = {
  id: string
  specialization?: string | null
  bio?: string | null
  instagramHandle?: string | null
  avgRating: number
  reviewCount: number
  yearsOfExperience: number
  user: { fullName: string; avatarUrl?: string | null; email: string }
  services: { id?: string; name: string; price: number }[]
  portfolio: { imageUrl: string; caption?: string | null }[]
}

const COPY = {
  en: {
    all: 'All',
    heroTitle: ['Our', 'Professionals'],
    heroText: 'Admin-managed Afroglow team members ready for booking.',
    search: 'Search by name or service...',
    found: (count: number) => `${count} professionals found`,
    verified: 'Verified',
    professional: 'Professional',
    newLabel: 'New',
    fallbackBio: (years: number) => `${years}+ years of experience at Afroglow.`,
    activeServices: 'All active services',
    more: (count: number) => `+${count} more`,
    scheduled: 'Admin scheduled',
    from: (price: string) => `from ${price}`,
    pricesByService: 'Prices by service',
    profile: 'Profile',
    book: 'Book',
    noneTitle: 'No professionals found',
    noneText: 'Try adjusting your search or filters.',
    reset: 'Reset filters',
    modalBio: 'Afroglow team professional.',
    services: 'Services',
    portfolio: 'Portfolio',
    bookWith: (name: string) => `Book with ${name}`,
  },
  lt: {
    all: 'Visi',
    heroTitle: ['Mūsų', 'specialistai'],
    heroText: 'Administratoriaus valdomi Afroglow komandos nariai, kuriuos galite rezervuoti internetu.',
    search: 'Ieškoti pagal vardą arba paslaugą...',
    found: (count: number) => `Rasta specialistų: ${count}`,
    verified: 'Patikrinta',
    professional: 'Specialistas',
    newLabel: 'Naujas',
    fallbackBio: (years: number) => `${years}+ metų patirtis Afroglow salone.`,
    activeServices: 'Visos aktyvios paslaugos',
    more: (count: number) => `+${count} daugiau`,
    scheduled: 'Tvarkaraštį valdo administratorius',
    from: (price: string) => `nuo ${price}`,
    pricesByService: 'Kainos pagal paslaugą',
    profile: 'Profilis',
    book: 'Rezervuoti',
    noneTitle: 'Specialistų nerasta',
    noneText: 'Pabandykite pakeisti paiešką arba filtrus.',
    reset: 'Išvalyti filtrus',
    modalBio: 'Afroglow komandos specialistas.',
    services: 'Paslaugos',
    portfolio: 'Darbų galerija',
    bookWith: (name: string) => `Rezervuoti pas ${name}`,
  },
} as const

function ProfessionalCardSkeleton() {
  return (
    <div className="card-luxury overflow-hidden">
      <div className="skeleton-luxury h-64 rounded-none" />
      <div className="space-y-4 p-5">
        <div className="skeleton-luxury h-4 w-2/3" />
        <div className="space-y-2">
          <div className="skeleton-luxury h-3 w-full" />
          <div className="skeleton-luxury h-3 w-4/5" />
        </div>
        <div className="flex gap-2">
          <div className="skeleton-luxury h-6 w-20 rounded-full" />
          <div className="skeleton-luxury h-6 w-24 rounded-full" />
        </div>
        <div className="flex items-center justify-between border-t border-luxury-border pt-4">
          <div className="skeleton-luxury h-8 w-28" />
          <div className="skeleton-luxury h-9 w-24" />
        </div>
      </div>
    </div>
  )
}

export default function ProfessionalsPage() {
  const { locale } = useI18n()
  const copy = COPY[locale]
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Professional | null>(null)

  useEffect(() => {
    api.get('/professionals?limit=100')
      .then(({ data }) => setProfessionals(data.data ?? data ?? []))
      .finally(() => setLoading(false))
  }, [])

  const specialities = useMemo(() => {
    const values = professionals.map(p => p.specialization).filter(Boolean) as string[]
    return ['All', ...Array.from(new Set(values))]
  }, [professionals])

  const filtered = professionals.filter(p => {
    const name = p.user.fullName.toLowerCase()
    const services = p.services.map(s => s.name.toLowerCase()).join(' ')
    const speciality = (p.specialization ?? '').toLowerCase()
    const query = search.toLowerCase()
    return (filter === 'All' || p.specialization === filter) &&
      (!query || name.includes(query) || services.includes(query) || speciality.includes(query))
  })
  const resetFilters = () => {
    setSearch('')
    setFilter('All')
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-center mb-4"><div className="gold-line" /></div>
            <h1 className="section-title mb-6">{copy.heroTitle[0]} <span className="gold-shimmer">{copy.heroTitle[1]}</span></h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              {copy.heroText}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-luxury-charcoal/30 sticky top-16 z-40 border-b border-luxury-border backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={copy.search}
                className="input-luxury pl-9 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {specialities.map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-xs font-medium transition-all',
                    filter === s
                      ? 'bg-gradient-gold text-luxury-black'
                      : 'border border-luxury-border text-gray-400 hover:border-gold-500/30 hover:text-gold-400',
                  )}
                >
                  {s === 'All' ? copy.all : s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" aria-label="Loading professionals">
              {Array.from({ length: 6 }).map((_, i) => <ProfessionalCardSkeleton key={i} />)}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-8">{copy.found(filtered.length)}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((pro, i) => {
                  const minPrice = pro.services.length ? Math.min(...pro.services.map(s => s.price)) : null
                  const heroImage = pro.user.avatarUrl ?? pro.portfolio[0]?.imageUrl

                  return (
                    <motion.div
                      key={pro.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="card-luxury overflow-hidden group"
                    >
                      <div className="relative h-64 bg-luxury-surface">
                        {heroImage ? (
                          <Image src={heroImage} alt={pro.user.fullName} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                        ) : (
                          <div className="h-full flex items-center justify-center text-5xl font-bold text-luxury-black bg-gradient-gold">
                            {getInitials(pro.user.fullName)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute top-3 right-3 badge-success text-xs">{copy.verified}</div>
                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-serif font-bold text-white text-lg">{pro.user.fullName}</h3>
                              <p className="text-xs text-gold-400">{pro.specialization ?? copy.professional}</p>
                            </div>
                            <div className="flex items-center gap-1 bg-black/50 rounded-lg px-2 py-1">
                              <Star size={12} className="text-gold-400 fill-gold-400" />
                              <span className="text-xs text-white font-semibold">{pro.avgRating || copy.newLabel}</span>
                              {pro.reviewCount > 0 && <span className="text-xs text-gray-400">({pro.reviewCount})</span>}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-5">
                        <p className="text-sm text-gray-400 mb-4 line-clamp-2">{pro.bio || copy.fallbackBio(pro.yearsOfExperience || 0)}</p>

                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {(pro.services.length ? pro.services : [{ name: copy.activeServices, price: 0 }]).slice(0, 3).map(s => (
                            <span key={s.name} className="text-xs px-2 py-1 rounded-full bg-luxury-muted/50 text-gray-300">
                              {s.name}
                            </span>
                          ))}
                          {pro.services.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-luxury-muted/50 text-gold-400">
                              {copy.more(pro.services.length - 3)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-luxury-border">
                          <div className="space-y-0.5">
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock size={11} /> {copy.scheduled}
                            </p>
                            <p className="text-sm font-semibold text-gold-400">{minPrice ? copy.from(formatPrice(minPrice)) : copy.pricesByService}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button onClick={() => setSelected(pro)} className="btn-ghost text-xs py-1.5 px-3">
                              {copy.profile}
                            </button>
                            <Link href={`/book?professional=${pro.id}`} className="btn-gold text-xs py-1.5 px-4">
                              {copy.book}
                            </Link>
                          </div>
                        </div>

                        {pro.portfolio.length > 0 && (
                          <div className="flex gap-2 mt-4">
                            {pro.portfolio.slice(0, 3).map((item, j) => (
                              <div key={j} className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                                <Image src={item.imageUrl} alt="Portfolio" fill className="object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {filtered.length === 0 && (
                <div className="card-luxury mx-auto max-w-xl p-10 text-center">
                  <Users size={34} className="mx-auto mb-4 text-gold-400" />
                  <h3 className="text-xl font-semibold text-white mb-2">{copy.noneTitle}</h3>
                  <p className="text-gray-400 mb-6">{copy.noneText}</p>
                  <button type="button" onClick={resetFilters} className="btn-outline-gold">
                    <RotateCcw size={15} /> {copy.reset}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {selected && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-luxury-surface border border-luxury-border rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-serif font-bold text-2xl text-white">{selected.user.fullName}</h2>
                  <p className="text-gold-400">{selected.specialization ?? copy.professional}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-2xl leading-none text-gray-400 hover:text-white">x</button>
              </div>
              <p className="text-gray-400 mb-6">{selected.bio || copy.modalBio}</p>
              <h4 className="font-semibold text-white mb-3">{copy.services}</h4>
              <div className="flex flex-wrap gap-2 mb-6">
                {(selected.services.length ? selected.services : [{ name: copy.activeServices }]).map(s => (
                  <span key={s.name} className="badge-gold text-xs">{s.name}</span>
                ))}
              </div>
              {selected.portfolio.length > 0 && (
                <>
                  <h4 className="font-semibold text-white mb-3">{copy.portfolio}</h4>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {selected.portfolio.map((item, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                        <Image src={item.imageUrl} alt="Portfolio" fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </>
              )}
              <Link href={`/book?professional=${selected.id}`} className="btn-gold w-full justify-center text-base py-4">
                {copy.bookWith(selected.user.fullName.split(' ')[0])} <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
