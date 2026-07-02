'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import {
  Scissors, Star, Users, Clock, ChevronRight,
  CheckCircle, Award, Zap, Heart, Globe2,
  CalendarDays, Sparkles, TrendingUp, ArrowRight,
} from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'
import { api } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

/* ── helpers ──────────────────────────────────── */
const FadeIn = ({
  children,
  delay = 0,
  className = '',
  direction = 'up',
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  direction?: 'up' | 'left' | 'right' | 'none'
}) => {
  const ref   = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  const variants = {
    up:    { hidden: { y: 30, opacity: 0 }, visible: { y: 0, opacity: 1 } },
    left:  { hidden: { x: -30, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    right: { hidden: { x: 30, opacity: 0 }, visible: { x: 0, opacity: 1 } },
    none:  { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants[direction]}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}

/* ── DATA ──────────────────────────────────────── */
type PublicStats = {
  professionals: number
  bookings: number
  satisfaction: number
}

const DEFAULT_PUBLIC_STATS: PublicStats = {
  professionals: 0,
  bookings: 0,
  satisfaction: 0,
}

const SERVICES = [
  { icon: '✂️',  name: 'Haircut',          desc: 'Precision cuts tailored to your style',          price: 'from €15' },
  { icon: '🪒',  name: 'Beard Trim',        desc: 'Expert beard grooming & shaping',                price: 'from €10' },
  { icon: '🧵',  name: 'Braiding',          desc: 'Intricate African & modern braiding styles',     price: 'from €40' },
  { icon: '🔒',  name: 'Dreadlocks',        desc: 'Professional locs installation & maintenance',   price: 'from €60' },
  { icon: '👑',  name: 'Wig Installation',  desc: 'Flawless wig fitting and styling',               price: 'from €50' },
  { icon: '🎨',  name: 'Hair Coloring',     desc: 'Vibrant color treatments & highlights',          price: 'from €45' },
  { icon: '💫',  name: 'Women Styling',     desc: "Complete women's hair styling",                  price: 'from €30' },
  { icon: '🌟',  name: 'Kids Haircut',      desc: 'Gentle, fun cuts for the little ones',           price: 'from €12' },
]

const HAIRCUT_GALLERY = [
  {
    src: '/images/haircuts/black-hair-barber-1.jpg',
    title: 'Chair Service',
    caption: 'Professional barber care in a clean studio setting',
  },
  {
    src: '/images/haircuts/beard-fade.jpg',
    title: 'Skin Fade & Beard',
    caption: 'Smooth blend, shaped beard, polished profile',
  },
  {
    src: '/images/haircuts/design-beard.jpg',
    title: 'Cut Design',
    caption: 'Detailed line work and beard grooming',
  },
  {
    src: '/images/haircuts/crisp-lineup.jpeg',
    title: 'Crisp Line Up',
    caption: 'Sharp edges for a fresh daily look',
  },
]

const PROFESSIONALS = [
  {
    name: 'Marcus Johnson',
    role: 'Master Barber',
    rating: 4.9,
    reviews: 312,
    image: '/images/haircuts/beard-fade.jpg',
    speciality: 'Fades & Tapers',
    price: 'from €20',
  },
  {
    name: 'Ama Osei',
    role: 'Hair Braider',
    rating: 5.0,
    reviews: 284,
    image: '/images/haircuts/high-top-fade-chair.avif',
    speciality: 'Box Braids & Twists',
    price: 'from €45',
  },
  {
    name: 'James Okafor',
    role: 'Loctician',
    rating: 4.8,
    reviews: 196,
    image: '/images/haircuts/design-beard.jpg',
    speciality: 'Dreadlocks Specialist',
    price: 'from €60',
  },
  {
    name: 'Zara Williams',
    role: 'Stylist & Colorist',
    rating: 4.9,
    reviews: 421,
    image: '/images/haircuts/crisp-lineup.jpeg',
    speciality: 'Color & Treatment',
    price: 'from €45',
  },
]

const TESTIMONIALS = [
  {
    name: 'Aisha Kamara',
    rating: 5,
    text: "Absolutely the best salon experience I've had in Vilnius. The professionals here are world-class, and the atmosphere is luxurious yet welcoming.",
    service: 'Box Braids',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=80&h=80&fit=crop',
  },
  {
    name: 'Tomas Petravičius',
    rating: 5,
    text: "I was hesitant at first but Marcus gave me the cleanest fade I've ever had. The booking process was seamless, and the studio is absolutely stunning.",
    service: 'Haircut & Fade',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop',
  },
  {
    name: 'Elena Šimkutė',
    rating: 5,
    text: "Zara transformed my hair completely. I walked in with damaged color and walked out with gorgeous highlights. Worth every euro!",
    service: 'Hair Coloring',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop',
  },
]

const FAQS = [
  {
    q: 'How do I book an appointment?',
    a: 'Simply browse our professionals, select the service and time that suits you, and confirm your booking. You\'ll receive an instant email confirmation.',
  },
  {
    q: 'Can I cancel or reschedule my booking?',
    a: 'Yes, you can cancel or reschedule up to 24 hours before your appointment for free. Cancellations within 24 hours may incur a small fee.',
  },
  {
    q: 'How does the spot rental work?',
    a: 'Beauty professionals can apply to rent a working spot at Afroglow. After approval, you get your own station with full access to the salon facilities during your booked hours.',
  },
  {
    q: 'Are all professionals certified?',
    a: 'Yes, every professional at Afroglow is verified and holds the appropriate certifications. We review all applications and portfolios before approval.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, Bank Transfer, Apple Pay, and Google Pay. Payment is processed securely at the time of booking.',
  },
  {
    q: 'Do you offer gift cards?',
    a: 'Yes! Afroglow gift cards are available in any amount and make the perfect gift for any occasion.',
  },
]

const RENTAL_BENEFITS = [
  { icon: Clock,    title: 'Flexible Hours',       desc: 'Choose your own schedule. Work when you want.' },
  { icon: Users,    title: 'Built-in Clients',      desc: 'Access our growing customer base from day one.' },
  { icon: Zap,      title: 'Premium Equipment',     desc: 'State-of-the-art salon tools included.' },
  { icon: Heart,    title: 'Supportive Community',  desc: 'Grow alongside fellow beauty professionals.' },
  { icon: Globe2,   title: 'Free Marketing',        desc: 'Your profile promoted across our platforms.' },
  { icon: Award,    title: 'Ongoing Training',      desc: 'Access to workshops and masterclasses.' },
]

/* ────────────────────────────────────────────────
   Homepage Component
──────────────────────────────────────────────── */
export default function HomePage() {
  const { t, locale } = useI18n()
  const [publicStats, setPublicStats] = useState<PublicStats>(DEFAULT_PUBLIC_STATS)
  const services = useMemo(() => [
    { icon: '✂️',  name: t.services.haircut.name,          desc: t.services.haircut.desc,          price: locale === 'lt' ? 'nuo €15' : 'from €15' },
    { icon: '🪒',  name: t.services.beardTrim.name,        desc: t.services.beardTrim.desc,        price: locale === 'lt' ? 'nuo €10' : 'from €10' },
    { icon: '🧵',  name: t.services.braiding.name,         desc: t.services.braiding.desc,         price: locale === 'lt' ? 'nuo €40' : 'from €40' },
    { icon: '🔒',  name: t.services.dreadlocks.name,       desc: t.services.dreadlocks.desc,       price: locale === 'lt' ? 'nuo €60' : 'from €60' },
    { icon: '👑',  name: t.services.wigInstallation.name,  desc: t.services.wigInstallation.desc,  price: locale === 'lt' ? 'nuo €50' : 'from €50' },
    { icon: '🎨',  name: t.services.hairColoring.name,     desc: t.services.hairColoring.desc,     price: locale === 'lt' ? 'nuo €45' : 'from €45' },
    { icon: '💫',  name: t.services.womenStyling.name,     desc: t.services.womenStyling.desc,     price: locale === 'lt' ? 'nuo €30' : 'from €30' },
    { icon: '🌟',  name: t.services.kidsHaircut.name,      desc: t.services.kidsHaircut.desc,      price: locale === 'lt' ? 'nuo €12' : 'from €12' },
  ], [locale, t])

  const gallery = useMemo(() => locale === 'lt' ? [
    { src: '/images/haircuts/black-hair-barber-1.jpg', title: 'Darbas kėdėje', caption: 'Profesionali priežiūra švarioje salono aplinkoje' },
    { src: '/images/haircuts/beard-fade.jpg', title: 'Skin fade ir barzda', caption: 'Tolygus perėjimas, suformuota barzda ir tvarkingas profilis' },
    { src: '/images/haircuts/design-beard.jpg', title: 'Kirpimo dizainas', caption: 'Tikslus linijų darbas ir barzdos formavimas' },
    { src: '/images/haircuts/crisp-lineup.jpeg', title: 'Ryški kontūro linija', caption: 'Aštrūs kontūrai gaiviam kasdieniam įvaizdžiui' },
  ] : HAIRCUT_GALLERY, [locale])

  const faqs = useMemo(() => locale === 'lt' ? [
    { q: 'Kaip rezervuoti vizitą?', a: 'Pasirinkite paslaugą, specialistą, jums tinkamą laiką ir patvirtinkite rezervaciją. Patvirtinimą matys administratorius.' },
    { q: 'Ar galiu atšaukti arba pakeisti rezervaciją?', a: 'Taip, rezervaciją galite pakeisti arba atšaukti iki vizito likus 24 valandoms.' },
    { q: 'Kaip veikia darbo vietos nuoma?', a: 'Grožio specialistai pateikia paraišką, o po patvirtinimo gali naudotis darbo vieta, įranga ir salono infrastruktūra pasirinktu laikotarpiu.' },
    { q: 'Ar specialistai yra patikrinti?', a: 'Taip, kiekvienas Afroglow specialistas yra peržiūrimas administratoriaus, o jo paslaugos, kainos ir galerija valdomos sistemoje.' },
    { q: 'Kokius mokėjimo būdus priimate?', a: 'Priimame pagrindines banko korteles, bankinius pavedimus ir skaitmeninius mokėjimus, kai jie įjungti sistemoje.' },
    { q: 'Ar galima įsigyti dovanų kuponą?', a: 'Taip, dėl dovanų kuponų galite susisiekti su Afroglow komanda.' },
  ] : FAQS, [locale])

  const rentalBenefits = useMemo(() => [
    { icon: Clock,    title: t.rental.benefits.flexible.title,   desc: t.rental.benefits.flexible.desc },
    { icon: Users,    title: t.rental.benefits.clientBase.title, desc: t.rental.benefits.clientBase.desc },
    { icon: Zap,      title: t.rental.benefits.equipment.title,  desc: t.rental.benefits.equipment.desc },
    { icon: Heart,    title: t.rental.benefits.community.title,  desc: t.rental.benefits.community.desc },
    { icon: Globe2,   title: t.rental.benefits.marketing.title,  desc: t.rental.benefits.marketing.desc },
    { icon: Award,    title: t.rental.benefits.training.title,   desc: t.rental.benefits.training.desc },
  ], [t])

  const pageCopy = locale === 'lt' ? {
    scroll: 'Slinkti',
    viewServices: 'Peržiūrėti visas paslaugas',
    meetProfessionals: 'Visi specialistai',
    popular: 'Populiaru',
    plans: [
      { plan: 'Diena', price: '€35', period: '/diena', features: ['8 val. prieiga', 'Visa įranga', 'Wi-Fi'] },
      { plan: 'Savaitė', price: '€180', period: '/savaitė', features: ['40 val. prieiga', 'Visa įranga', 'Wi-Fi', 'Rinkodaros palaikymas'], popular: true },
      { plan: 'Mėnuo', price: '€600', period: '/mėnuo', features: ['Pilna prieiga', 'Visa įranga', 'Wi-Fi', 'Rinkodara', 'Prekės ženklo palaikymas'] },
    ],
    galleryTitle: 'Naujausi darbai',
    gallerySubtitle: 'Tikri kirpimų pavyzdžiai, parodantys kokybės lygį',
    mapTitle: 'Kur mus rasti',
    mapSubtitle: 'Aplankykite mus Vilniaus širdyje',
    finalTitle: 'Pasiruošę Afroglow patirčiai?',
    finalText: 'Prisijunkite prie klientų ir specialistų, kurie Afroglow renkasi kaip savo grožio erdvę.',
    finalBook: 'Rezervuoti vizitą',
    finalBrowse: 'Peržiūrėti specialistus',
  } : {
    scroll: 'Scroll',
    viewServices: 'View All Services',
    meetProfessionals: 'Meet All Professionals',
    popular: 'Popular',
    plans: [
      { plan: 'Daily',   price: '€35',  period: '/day',  features: ['8h access', 'All equipment', 'Wi-Fi'] },
      { plan: 'Weekly',  price: '€180', period: '/week', features: ['40h access', 'All equipment', 'Wi-Fi', 'Marketing support'], popular: true },
      { plan: 'Monthly', price: '€600', period: '/month', features: ['Full access', 'All equipment', 'Wi-Fi', 'Marketing', 'Branding package'] },
    ],
    galleryTitle: 'Fresh From the Chair',
    gallerySubtitle: 'Real haircut references that show the quality clients can expect',
    mapTitle: 'Find Us',
    mapSubtitle: 'Visit us in the heart of Vilnius, Lithuania',
    finalTitle: 'Ready to Experience Afroglow?',
    finalText: 'Join thousands of satisfied clients and professionals who call Afroglow home.',
    finalBook: 'Book an Appointment',
    finalBrowse: 'Browse Professionals',
  }

  useEffect(() => {
    let mounted = true

    api.get<Partial<PublicStats>>('/stats/public')
      .then(({ data }) => {
        if (!mounted) return
        setPublicStats({
          professionals: Number(data.professionals ?? 0),
          bookings:      Number(data.bookings ?? 0),
          satisfaction:  Number(data.satisfaction ?? 0),
        })
      })
      .catch(() => {
        if (mounted) setPublicStats(DEFAULT_PUBLIC_STATS)
      })

    return () => {
      mounted = false
    }
  }, [])

  const stats = useMemo(() => [
    { value: publicStats.professionals.toLocaleString(), label: t.hero.stats.professionals },
    { value: publicStats.bookings.toLocaleString(),      label: t.hero.stats.dailyBookings },
    { value: `${publicStats.satisfaction}%`,             label: t.hero.stats.satisfaction },
    { value: '5+',                                       label: t.hero.stats.yearsExperience },
  ], [publicStats, t])

  return (
    <div className="min-h-screen bg-luxury-black overflow-x-hidden">

      {/* ══════════ HERO ══════════ */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Background */}
        <Image
          src="/images/haircuts/black-hair-barber-1.jpg"
          alt="Afroglow barber preparing a client in the chair"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-luxury-black/70 via-luxury-black/60 to-luxury-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,10,10,0.62)_70%)]" />
        <div className="absolute inset-0 bg-noise opacity-30" />

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full
                         bg-gold-500/10 border border-gold-500/30 mb-8"
            >
              <Sparkles size={14} className="text-gold-400" />
              <span className="text-xs font-semibold tracking-widest text-gold-400 uppercase">
                {t.hero.badge}
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-bold leading-tight mb-6"
            >
              <span className="text-white">{t.hero.title} </span>
              <span className="gold-shimmer">{t.hero.titleGold}</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10"
            >
              {t.hero.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/book" className="btn-gold text-base px-8 py-4">
                <CalendarDays size={18} />
                {t.hero.bookBarber}
              </Link>
              <Link href="/rent-a-spot" className="btn-outline-gold text-base px-8 py-4">
                <Scissors size={18} />
                {t.hero.rentSpot}
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-16 pt-10 border-t border-white/10"
            >
              {stats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-gradient-gold">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gray-500 uppercase tracking-widest">{pageCopy.scroll}</span>
          <div className="w-px h-8 bg-gradient-to-b from-gold-500 to-transparent" />
        </motion.div>
      </section>

      {/* ══════════ SERVICES ══════════ */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{t.services.title}</h2>
            <p className="section-subtitle mx-auto">{t.services.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, i) => (
              <FadeIn key={service.name} delay={i * 0.07} direction="up">
                <Link href="/services" className="card-luxury p-6 block group cursor-pointer">
                  <div className="text-4xl mb-4">{service.icon}</div>
                  <h3 className="font-semibold text-white group-hover:text-gold-400 transition-colors mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.desc}</p>
                  <span className="text-xs font-semibold text-gold-400">{service.price}</span>
                </Link>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <Link href="/services" className="btn-outline-gold">
              {pageCopy.viewServices} <ChevronRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ PROFESSIONALS ══════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{t.professionals.title}</h2>
            <p className="section-subtitle mx-auto">{t.professionals.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {PROFESSIONALS.map((pro, i) => (
              <FadeIn key={pro.name} delay={i * 0.1} direction="up">
                <div className="card-luxury overflow-hidden group">
                  {/* Image */}
                  <div className="relative h-56 overflow-hidden">
                    <Image
                      src={pro.image}
                      alt={pro.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3">
                      <span className="badge-gold text-xs">{pro.speciality}</span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-white">{pro.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">{pro.role}</p>

                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-1">
                        <Star size={13} className="text-gold-400 fill-gold-400" />
                        <span className="text-sm font-semibold text-white">{pro.rating}</span>
                        <span className="text-xs text-gray-400">({pro.reviews})</span>
                      </div>
                      <span className="text-xs font-semibold text-gold-400">{pro.price}</span>
                    </div>

                    <Link
                      href={`/book?professional=${encodeURIComponent(pro.name)}`}
                      className="btn-gold w-full justify-center text-sm py-2.5"
                    >
                      {t.professionals.bookNow}
                    </Link>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn className="text-center mt-12">
            <Link href="/professionals" className="btn-outline-gold">
              {pageCopy.meetProfessionals} <ChevronRight size={16} />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ SPOT RENTAL CTA ══════════ */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <FadeIn direction="left">
              <div className="flex justify-start mb-3">
                <div className="gold-line" />
              </div>
              <h2 className="section-title mb-6">{t.rental.title}</h2>
              <p className="text-gray-400 text-lg mb-8">{t.rental.subtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {rentalBenefits.map((b, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20
                                    flex items-center justify-center flex-shrink-0 mt-0.5">
                      <b.icon size={16} className="text-gold-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{b.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/rent-a-spot" className="btn-gold text-base px-8 py-4">
                {t.rental.apply} <ArrowRight size={18} />
              </Link>
            </FadeIn>

            {/* Right: Pricing Cards */}
            <FadeIn direction="right">
              <div className="grid gap-6">
                {pageCopy.plans.map(tier => (
                  <div
                    key={tier.plan}
                    className={cn(
                      'card-luxury p-6 flex items-center justify-between',
                      tier.popular && 'border-gold-500/50 shadow-gold',
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-white">{tier.plan}</h4>
                        {tier.popular && <span className="badge-gold text-xs">{pageCopy.popular}</span>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {tier.features.map(f => (
                          <span key={f} className="text-xs text-gray-400 flex items-center gap-1">
                            <CheckCircle size={11} className="text-gold-400" /> {f}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className="text-2xl font-bold text-gradient-gold">{tier.price}</span>
                      <span className="text-xs text-gray-400 block">{tier.period}</span>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ══════════ GALLERY ══════════ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{pageCopy.galleryTitle}</h2>
            <p className="section-subtitle mx-auto">{pageCopy.gallerySubtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {gallery.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.05}>
                <div className={cn(
                  'relative overflow-hidden rounded-lg group border border-luxury-border bg-luxury-charcoal',
                  i === 0 ? 'sm:col-span-2 lg:col-span-2' : '',
                )}>
                  <Image
                    src={item.src}
                    alt={item.title}
                    width={720}
                    height={720}
                    className={cn(
                      'w-full object-cover group-hover:scale-105 transition-transform duration-500',
                      i === 0 ? 'h-80' : 'h-64',
                    )}
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5">
                    <h3 className="text-white font-semibold">{item.title}</h3>
                    <p className="text-xs text-gray-300 mt-1">{item.caption}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{t.testimonials.title}</h2>
            <p className="section-subtitle mx-auto">{t.testimonials.subtitle}</p>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((review, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card-luxury p-6">
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: review.rating }).map((_, j) => (
                      <Star key={j} size={14} className="text-gold-400 fill-gold-400" />
                    ))}
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">"{review.text}"</p>
                  <div className="flex items-center gap-3">
                    <Image
                      src={review.avatar}
                      alt={review.name}
                      width={40}
                      height={40}
                      className="rounded-full avatar-gold"
                    />
                    <div>
                      <p className="text-sm font-semibold text-white">{review.name}</p>
                      <p className="text-xs text-gray-400">{review.service}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ FAQ ══════════ */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-16">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{t.faq.title}</h2>
            <p className="section-subtitle mx-auto">{t.faq.subtitle}</p>
          </FadeIn>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <FAQItem question={faq.q} answer={faq.a} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ MAP ══════════ */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn className="text-center mb-12">
            <div className="flex justify-center mb-3">
              <div className="gold-line" />
            </div>
            <h2 className="section-title">{pageCopy.mapTitle}</h2>
            <p className="section-subtitle mx-auto">{pageCopy.mapSubtitle}</p>
          </FadeIn>
          <FadeIn>
            <div className="rounded-2xl overflow-hidden border border-luxury-border shadow-luxury h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2306.5!2d25.2!3d54.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTTCsDQyJzAwLjAiTiAyNcKwMTInMDAuMCJF!5e0!3m2!1sen!2s!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Afroglow Location"
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══════════ FINAL CTA ══════════ */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black via-luxury-charcoal to-luxury-black" />
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(212,175,55,0.3) 0%, transparent 70%)' }} />

        <FadeIn className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Sparkles size={40} className="text-gold-400 mx-auto mb-6 animate-pulse" />
          <h2 className="section-title mb-6">{pageCopy.finalTitle}</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {pageCopy.finalText}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book" className="btn-gold text-base px-10 py-4">
              <CalendarDays size={18} /> {pageCopy.finalBook}
            </Link>
            <Link href="/professionals" className="btn-outline-gold text-base px-10 py-4">
              <TrendingUp size={18} /> {pageCopy.finalBrowse}
            </Link>
          </div>
        </FadeIn>
      </section>

    </div>
  )
}

/* ── FAQ Accordion ─────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className={cn(
        'card-luxury overflow-hidden transition-all duration-300',
        open && 'border-gold-500/30',
      )}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className={cn('font-semibold text-sm', open ? 'text-gold-400' : 'text-white')}>
          {question}
        </span>
        <ChevronRight
          size={16}
          className={cn(
            'text-gold-400 flex-shrink-0 transition-transform duration-200',
            open && 'rotate-90',
          )}
        />
      </button>
      <AnimatePresenceWrapper open={open}>
        <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">{answer}</div>
      </AnimatePresenceWrapper>
    </div>
  )
}

function AnimatePresenceWrapper({ open, children }: { open: boolean; children: React.ReactNode }) {
  return (
    <div
      className="overflow-hidden transition-all duration-300"
      style={{ maxHeight: open ? '300px' : '0px' }}
    >
      {children}
    </div>
  )
}
