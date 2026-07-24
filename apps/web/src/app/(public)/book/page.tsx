'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import {
  CheckCircle, Calendar, Clock, User,
  Scissors, ChevronLeft, ChevronRight, Star, Loader, ImageIcon, X,
} from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { api } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import WhatsAppBookingButton from '@/components/booking/WhatsAppBookingButton'
import { ServiceGlyph } from '@/components/icons/ServiceIcons'

const STEPS = ['Service', 'Professional', 'Date & Time', 'Details', 'Confirm']
const LT_STEPS = ['Paslauga', 'Specialistas', 'Data ir laikas', 'Duomenys', 'Patvirtinimas']

interface ApiService {
  id: string; name: string; category: string; price: number
  duration: number; icon: string | null; description: string | null; isPopular: boolean
}

interface ApiProfessional {
  id: string
  user: { fullName: string; avatarUrl: string | null }
  specialization: string | null
  bio?: string | null
  yearsOfExperience?: number
  avgRating: number
  reviewCount?: number
  services: { id: string; name: string; price?: number; duration?: number }[]
  portfolio: { imageUrl: string; caption?: string | null; serviceType?: string | null }[]
}

type DayHours = { open: string; close: string; closed?: boolean }
type BranchSettings = {
  id: string
  openingHours: Record<string, DayHours>
}

const detailsSchema = z.object({
  fullName: z.string().min(2, 'Name required'),
  email:    z.string().email('Valid email required'),
  phone:    z.string().min(8, 'Phone required'),
  notes:    z.string().optional(),
})
type DetailsForm = z.infer<typeof detailsSchema>

function getDaysInMonth(year: number, month: number) { return new Date(year, month + 1, 0).getDate() }
function getFirstDayOfMonth(year: number, month: number) { return new Date(year, month, 1).getDay() }
const MONTH_NAMES = ['January','February','March','April','May','June',
  'July','August','September','October','November','December']
const MONTH_NAMES_LT = ['Sausis','Vasaris','Kovas','Balandis','Gegužė','Birželis',
  'Liepa','Rugpjūtis','Rugsėjis','Spalis','Lapkritis','Gruodis']
const WEEKDAYS = {
  en: ['Mo','Tu','We','Th','Fr','Sa','Su'],
  lt: ['Pr','An','Tr','Kt','Pn','Št','Sk'],
}

const COPY = {
  en: {
    steps: STEPS,
    title: ['Book an', 'Appointment'],
    serviceTitle: 'Choose a Service',
    serviceText: "Select the service you'd like to book",
    professionalTitle: 'Choose a Professional',
    proText: 'Pick your preferred expert',
    proFallbackText: 'Showing all available professionals',
    noServices: 'No services available yet.',
    noProsTitle: 'Let us arrange this one personally',
    noProsText: 'No specialist is bookable online for this service right now. Message us on WhatsApp and we will confirm your appointment within minutes.',
    profileHint: 'View profile to see services and work gallery',
    popular: 'Popular',
    professional: 'Professional',
    profile: 'Profile',
    select: 'Select',
    dateTitle: 'Select Date & Time',
    dateText: 'Choose your preferred appointment slot',
    availableFor: (date: Date) => `Available slots for ${date.toLocaleDateString('en', { weekday:'long', month:'short', day:'numeric' })}`,
    selectDateFirst: 'Select a date first',
    closed: 'The salon is closed on this date',
    pickDate: 'Pick a date to see available times',
    detailsTitle: 'Your Details',
    detailsText: 'Tell us how to reach you',
    fullName: 'Full Name *',
    email: 'Email *',
    phone: 'Phone *',
    notes: 'Special Requests',
    notesPlaceholder: 'Any notes for your professional...',
    confirmTitle: 'Confirm Your Booking',
    confirmText: 'Review the details before confirming',
    summary: ['Service','Professional','Date','Time','Duration','Price','Name','Email','Phone'],
    min: 'min',
    cancellation: 'Free cancellation up to 24h before your appointment.',
    successTitle: 'Booking Confirmed!',
    reference: 'Reference:',
    successText: 'A confirmation has been sent to your email.',
    another: 'Book Another Appointment',
    back: 'Back',
    continue: 'Continue',
    processing: 'Processing...',
    confirmBooking: 'Confirm Booking',
    toastSuccess: 'Booking confirmed!',
    toastError: 'Booking failed. Please try again.',
    modal: {
      professional: 'Afroglow Professional',
      profile: 'Profile',
      fallbackBio: (name: string) => `${name} is part of the Afroglow team and is available for selected beauty services.`,
      experience: 'Experience',
      years: 'yrs',
      rating: 'Rating',
      newLabel: 'New',
      canDo: 'What they can do',
      gallery: 'Work Gallery',
      emptyGallery: 'No portfolio photos uploaded yet.',
      close: 'Close',
      bookWith: (name: string) => `Book with ${name}`,
    },
  },
  lt: {
    steps: LT_STEPS,
    title: ['Rezervuoti', 'vizitą'],
    serviceTitle: 'Pasirinkite paslaugą',
    serviceText: 'Pasirinkite paslaugą, kurią norite rezervuoti',
    professionalTitle: 'Pasirinkite specialistą',
    proText: 'Pasirinkite norimą specialistą',
    proFallbackText: 'Rodomi visi galimi specialistai',
    noServices: 'Paslaugų kol kas nėra.',
    noProsTitle: 'Suderinkime vizitą asmeniškai',
    noProsText: 'Šiai paslaugai internetu kol kas nėra laisvo specialisto. Parašykite mums per WhatsApp ir patvirtinsime vizitą per kelias minutes.',
    profileHint: 'Atidarykite profilį, kad pamatytumėte paslaugas ir darbų galeriją',
    popular: 'Populiaru',
    professional: 'Specialistas',
    profile: 'Profilis',
    select: 'Pasirinkti',
    dateTitle: 'Pasirinkite datą ir laiką',
    dateText: 'Pasirinkite jums patogų vizito laiką',
    availableFor: (date: Date) => `Laisvi laikai: ${date.toLocaleDateString('lt-LT', { weekday:'long', month:'short', day:'numeric' })}`,
    selectDateFirst: 'Pirmiausia pasirinkite datą',
    closed: 'Šią dieną salonas nedirba',
    pickDate: 'Pasirinkite datą, kad matytumėte laisvus laikus',
    detailsTitle: 'Jūsų duomenys',
    detailsText: 'Nurodykite, kaip galime su jumis susisiekti',
    fullName: 'Vardas ir pavardė *',
    email: 'El. paštas *',
    phone: 'Telefonas *',
    notes: 'Papildomi pageidavimai',
    notesPlaceholder: 'Pastabos specialistui...',
    confirmTitle: 'Patvirtinkite rezervaciją',
    confirmText: 'Peržiūrėkite informaciją prieš patvirtindami',
    summary: ['Paslauga','Specialistas','Data','Laikas','Trukmė','Kaina','Vardas','El. paštas','Telefonas'],
    min: 'min.',
    cancellation: 'Nemokamas atšaukimas iki vizito likus 24 valandoms.',
    successTitle: 'Rezervacija patvirtinta!',
    reference: 'Numeris:',
    successText: 'Rezervacija matoma administratoriaus skydelyje.',
    another: 'Rezervuoti kitą vizitą',
    back: 'Atgal',
    continue: 'Tęsti',
    processing: 'Apdorojama...',
    confirmBooking: 'Patvirtinti rezervaciją',
    toastSuccess: 'Rezervacija patvirtinta!',
    toastError: 'Rezervacijos sukurti nepavyko. Bandykite dar kartą.',
    modal: {
      professional: 'Afroglow specialistas',
      profile: 'Profilis',
      fallbackBio: (name: string) => `${name} yra Afroglow komandos specialistas ir teikia pasirinktas grožio paslaugas.`,
      experience: 'Patirtis',
      years: 'm.',
      rating: 'Įvertinimas',
      newLabel: 'Naujas',
      canDo: 'Kokias paslaugas teikia',
      gallery: 'Darbų galerija',
      emptyGallery: 'Darbų nuotraukų kol kas nėra.',
      close: 'Uždaryti',
      bookWith: (name: string) => `Rezervuoti pas ${name}`,
    },
  },
} as const

type ModalCopy = {
  professional: string
  profile: string
  fallbackBio: (name: string) => string
  experience: string
  years: string
  rating: string
  newLabel: string
  canDo: string
  gallery: string
  emptyGallery: string
  close: string
  bookWith: (name: string) => string
}

export default function BookingPage() {
  const { locale } = useI18n()
  const copy = COPY[locale]
  const [step, setStep] = useState(0)

  // Live data
  const [services,     setServices]     = useState<ApiService[]>([])
  const [professionals,setProfessionals] = useState<ApiProfessional[]>([])
  const [branch,       setBranch]        = useState<BranchSettings | null>(null)
  const [dataLoading,  setDataLoading]  = useState(true)

  // Selections
  const [selectedService,      setSelectedService]      = useState<ApiService | null>(null)
  const [selectedProfessional, setSelectedProfessional] = useState<ApiProfessional | null>(null)
  const [profileOpen,          setProfileOpen]          = useState<ApiProfessional | null>(null)
  const [selectedDate,         setSelectedDate]         = useState<Date | null>(null)
  const [selectedTime,         setSelectedTime]         = useState<string | null>(null)
  const [bookingId,            setBookingId]            = useState<string | null>(null)

  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const { register, handleSubmit, formState: { errors, isSubmitting }, getValues } =
    useForm<DetailsForm>({ resolver: zodResolver(detailsSchema) })

  useEffect(() => {
    Promise.all([
      api.get('/services'),
      api.get('/professionals'),
      api.get('/settings/branch'),
    ]).then(([servicesRes, prosRes, branchRes]) => {
      const serviceRows: ApiService[] = servicesRes.data ?? []
      const proRows: ApiProfessional[] = prosRes.data?.data ?? prosRes.data ?? []
      setServices(serviceRows)
      setProfessionals(proRows)
      setBranch(branchRes.data)

      const params = new URLSearchParams(window.location.search)
      const serviceId = params.get('service')
      const professionalId = params.get('professional')
      const initialService = serviceRows.find(s => s.id === serviceId)
      const initialPro = proRows.find(p => p.id === professionalId)
      if (initialService) setSelectedService(initialService)
      if (initialPro) setSelectedProfessional(initialPro)
      if (initialService && initialPro) setStep(2)
      else if (initialPro) setStep(0)
    }).catch(() => {}).finally(() => setDataLoading(false))
  }, [])

  const selectedDayHours = selectedDate && branch?.openingHours
    ? branch.openingHours[selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]
    : null
  const timeSlots = selectedDayHours && !selectedDayHours.closed
    ? generateSlotsForHours(selectedDayHours.open, selectedDayHours.close, 30, selectedService?.duration ?? 30)
    : []

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y-1) } else setViewMonth(m => m-1) }
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y+1) } else setViewMonth(m => m+1) }

  const daysInMonth    = getDaysInMonth(viewYear, viewMonth)
  const firstDay       = getFirstDayOfMonth(viewYear, viewMonth)
  const calendarDays   = Array.from({ length: daysInMonth }, (_, i) => i + 1)
  const leadingBlanks  = Array.from({ length: firstDay === 0 ? 6 : firstDay - 1 })

  // Filter professionals who offer the selected service
  const availablePros = selectedService
    ? professionals.filter(p => p.services.length === 0 || p.services.some(s => s.id === selectedService.id || s.name === selectedService.name))
    : professionals

  const onConfirm = async (details: DetailsForm) => {
    try {
      const { data } = await api.post('/bookings', {
        serviceId:      selectedService?.id,
        professionalId: selectedProfessional?.id,
        date:           selectedDate?.toISOString().split('T')[0],
        time:           selectedTime,
        branchId:       branch?.id,
        ...details,
      })
      setBookingId(data.id?.slice(0, 8).toUpperCase() ?? 'AG-' + Math.random().toString(36).slice(2,8).toUpperCase())
      setStep(5)
      toast.success(copy.toastSuccess)
    } catch {
      toast.error(copy.toastError)
    }
  }

  /* ── STEPS ────────────────────────────────────── */

  const StepService = () => (
    <div>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">{copy.serviceTitle}</h2>
      <p className="text-gray-400 mb-8">{copy.serviceText}</p>
      {dataLoading ? (
        <div className="flex items-center justify-center py-16"><Loader size={32} className="text-gold-400 animate-spin" /></div>
      ) : services.length === 0 ? (
        <div className="card-luxury p-12 text-center text-gray-400">{copy.noServices}</div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {services.map(s => (
            <button key={s.id} onClick={() => { setSelectedService(s); setSelectedTime(null); setStep(1) }}
              className={cn('card-luxury p-5 text-left transition-all duration-200 relative',
                selectedService?.id === s.id && 'border-gold-500/50 shadow-gold')}>
              {s.isPopular && (
                <span className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5 rounded-full bg-gold-500/20 text-gold-400 border border-gold-500/30">{copy.popular}</span>
              )}
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-gold-500/20 bg-gold-500/10 text-gold-400">
                <ServiceGlyph icon={s.icon} size={24} />
              </div>
              <h3 className="font-semibold text-white text-sm mb-1">{s.name}</h3>
              <p className="text-xs text-gray-400 mb-2">{s.duration} {copy.min}</p>
              <span className="text-sm font-bold text-gradient-gold">{formatPrice(s.price)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  const StepProfessional = () => (
    <div>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">{copy.professionalTitle}</h2>
      <p className="text-gray-400 mb-8">
        {availablePros.length > 0
          ? copy.proText
          : copy.proFallbackText}
      </p>
      {dataLoading ? (
        <div className="flex items-center justify-center py-16"><Loader size={32} className="text-gold-400 animate-spin" /></div>
      ) : availablePros.length === 0 ? (
        <div className="card-luxury p-10 sm:p-12 text-center">
          <Scissors size={32} className="mx-auto text-gold-400 mb-4" />
          <p className="text-white font-semibold text-lg mb-2">{copy.noProsTitle}</p>
          <p className="text-sm text-gray-400 max-w-md mx-auto mb-7">{copy.noProsText}</p>
          {/* Rather than dead-end the customer, hand them straight to WhatsApp */}
          <WhatsAppBookingButton
            className="mx-auto"
            message={selectedService
              ? (locale === 'lt'
                  ? `Sveiki, Afroglow! Noreciau rezervuoti: ${selectedService.name}.`
                  : `Hello Afroglow, I would like to book: ${selectedService.name}.`)
              : undefined}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {availablePros.map(pro => (
            <div key={pro.id}
              className={cn('card-luxury p-5 flex items-center gap-4 text-left transition-all duration-200',
                selectedProfessional?.id === pro.id && 'border-gold-500/50 shadow-gold')}>
              {pro.user.avatarUrl ? (
                <Image src={pro.user.avatarUrl} alt={pro.user.fullName} width={56} height={56}
                  className="rounded-full avatar-gold object-cover flex-shrink-0" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-gradient-gold flex items-center justify-center text-luxury-black font-bold text-xl flex-shrink-0">
                  {pro.user.fullName.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white truncate">{pro.user.fullName}</h3>
                <p className="text-xs text-gray-400">{pro.specialization ?? copy.professional}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pro.bio || copy.profileHint}</p>
                {pro.avgRating > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={12} className="text-gold-400 fill-gold-400" />
                    <span className="text-xs font-semibold text-white">{pro.avgRating.toFixed(1)}</span>
                    {!!pro.reviewCount && <span className="text-xs text-gray-500">({pro.reviewCount})</span>}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setProfileOpen(pro)}
                  className="btn-ghost text-xs py-1.5 px-3"
                >
                  {copy.profile}
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedProfessional(pro); setStep(2) }}
                  className="btn-gold text-xs py-1.5 px-3"
                >
                  {copy.select}
                </button>
              </div>
              {selectedProfessional?.id === pro.id && <CheckCircle size={20} className="text-gold-400 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const StepDateTime = () => (
    <div>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">{copy.dateTitle}</h2>
      <p className="text-gray-400 mb-8">{copy.dateText}</p>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card-luxury p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-luxury-muted/50 text-gray-400 hover:text-white">
              <ChevronLeft size={18} />
            </button>
            <span className="font-semibold text-white text-sm">{(locale === 'lt' ? MONTH_NAMES_LT : MONTH_NAMES)[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-luxury-muted/50 text-gray-400 hover:text-white">
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {WEEKDAYS[locale].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {leadingBlanks.map((_, i) => <div key={`b-${i}`} />)}
            {calendarDays.map(day => {
              const date   = new Date(viewYear, viewMonth, day)
              const isPast = date < new Date(today.toDateString())
              const isToday = date.toDateString() === today.toDateString()
              const isSel  = selectedDate?.toDateString() === date.toDateString()
              return (
                <button key={day} disabled={isPast} onClick={() => { setSelectedDate(date); setSelectedTime(null) }}
                  className={cn('w-8 h-8 text-xs rounded-lg transition-all mx-auto',
                    isPast    ? 'text-gray-600 cursor-not-allowed' : 'hover:bg-luxury-muted/50',
                    isToday   ? 'border border-gold-500/40 text-gold-400' : 'text-gray-300',
                    isSel     ? 'bg-gradient-gold text-luxury-black font-bold' : '')}>
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-white mb-4 text-sm">
            {selectedDate ? copy.availableFor(selectedDate) : copy.selectDateFirst}
          </h3>
          <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto">
          {selectedDate ? timeSlots.map(slot => (
              <button key={slot} onClick={() => setSelectedTime(slot)}
                className={cn('px-3 py-2 rounded-xl text-xs font-medium transition-all border',
                  selectedTime === slot
                    ? 'bg-gradient-gold text-luxury-black border-gold-500'
                    : 'border-luxury-border text-gray-300 hover:border-gold-500/30 hover:text-white')}>
                {slot}
              </button>
            )) : (
              <p className="col-span-3 text-xs text-gray-500 text-center py-8">
                {selectedDate ? copy.closed : copy.pickDate}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const StepDetails = () => (
    <div>
      <h2 className="text-2xl font-serif font-bold text-white mb-2">{copy.detailsTitle}</h2>
      <p className="text-gray-400 mb-8">{copy.detailsText}</p>
      <div className="card-luxury p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="label-luxury">{copy.fullName}</label>
            <input {...register('fullName')} className="input-luxury" placeholder="John Doe" />
            {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName.message}</p>}
          </div>
          <div>
            <label className="label-luxury">{copy.email}</label>
            <input {...register('email')} type="email" className="input-luxury" placeholder="you@example.com" />
            {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="label-luxury">{copy.phone}</label>
            <input {...register('phone')} className="input-luxury" placeholder="+370 600 00000" />
            {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="label-luxury">{copy.notes}</label>
            <input {...register('notes')} className="input-luxury" placeholder={copy.notesPlaceholder} />
          </div>
        </div>
      </div>
    </div>
  )

  const StepConfirm = () => {
    const details = getValues()
    return (
      <div>
        <h2 className="text-2xl font-serif font-bold text-white mb-2">{copy.confirmTitle}</h2>
        <p className="text-gray-400 mb-8">{copy.confirmText}</p>
        <div className="card-luxury p-6 space-y-4">
          {[
            { label: copy.summary[0], value: selectedService?.name ?? '' },
            { label: copy.summary[1], value: selectedProfessional?.user.fullName },
            { label: copy.summary[2], value: selectedDate?.toLocaleDateString(locale === 'lt' ? 'lt-LT' : 'en', { weekday:'long', year:'numeric', month:'long', day:'numeric' }) },
            { label: copy.summary[3], value: selectedTime },
            { label: copy.summary[4], value: `${selectedService?.duration} ${copy.min}` },
            { label: copy.summary[5], value: selectedService ? formatPrice(selectedService.price) : '' },
            { label: copy.summary[6], value: details.fullName },
            { label: copy.summary[7], value: details.email },
            { label: copy.summary[8], value: details.phone },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2 border-b border-luxury-border last:border-0">
              <span className="text-sm text-gray-400">{item.label}</span>
              <span className="text-sm font-semibold text-white">{item.value ?? '—'}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-4">{copy.cancellation}</p>
      </div>
    )
  }

  const StepSuccess = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
      <div className="w-24 h-24 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-8">
        <CheckCircle size={48} className="text-green-400" />
      </div>
      <h2 className="font-serif text-3xl font-bold text-white mb-3">{copy.successTitle}</h2>
      <p className="text-gray-400 mb-2">{copy.reference} <span className="text-gold-400 font-bold">#{bookingId}</span></p>
      <p className="text-gray-400 mb-8">{copy.successText}</p>
      <div className="card-luxury p-6 max-w-sm mx-auto mb-8 text-left space-y-3">
        {[
          { icon: Scissors,  val: selectedService?.name },
          { icon: User,      val: selectedProfessional?.user.fullName },
          { icon: Calendar,  val: selectedDate?.toLocaleDateString() },
          { icon: Clock,     val: selectedTime },
        ].map(({ icon: Icon, val }) => val ? (
          <div key={val} className="flex items-center gap-3 text-sm">
            <Icon size={16} className="text-gold-400" />
            <span className="text-white">{val}</span>
          </div>
        ) : null)}
      </div>
      <button
        onClick={() => { setStep(0); setSelectedService(null); setSelectedProfessional(null); setSelectedDate(null); setSelectedTime(null) }}
        className="btn-gold px-8 py-3">
        {copy.another}
      </button>
    </motion.div>
  )

  const showStep = () => {
    switch(step) {
      case 0: return <StepService />
      case 1: return <StepProfessional />
      case 2: return <StepDateTime />
      case 3: return <StepDetails />
      case 4: return <StepConfirm />
      case 5: return <StepSuccess />
      default: return null
    }
  }

  const canProceed = () => {
    if (step === 0) return !!selectedService
    if (step === 1) return !!selectedProfessional
    if (step === 2) return !!selectedDate && !!selectedTime
    return true
  }

  return (
    <div className="min-h-screen bg-luxury-black pt-20">
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="gold-line mx-auto mb-4" />
          <h1 className="section-title">{copy.title[0]} <span className="gold-shimmer">{copy.title[1]}</span></h1>
          <div className="mt-6 flex justify-center">
            <WhatsAppBookingButton />
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {step < 5 && (
            <div className="mb-12">
              <div className="flex items-center justify-between mb-4">
                {copy.steps.map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                      i < step  ? 'bg-gradient-gold text-luxury-black' :
                      i === step ? 'border-2 border-gold-500 text-gold-400' :
                                   'border border-luxury-border text-gray-500')}>
                      {i < step ? <CheckCircle size={16} /> : i + 1}
                    </div>
                    <span className={cn('text-xs hidden sm:block', i === step ? 'text-gold-400 font-semibold' : 'text-gray-500')}>{s}</span>
                    {i < STEPS.length - 1 && <div className={cn('h-px flex-1 min-w-[20px] sm:min-w-[40px] mx-1 transition-colors', i < step ? 'bg-gold-500' : 'bg-luxury-border')} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
              {showStep()}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {profileOpen && (
              <ProfessionalProfileModal
                professional={profileOpen}
                allServices={services}
                selectedService={selectedService}
                locale={locale}
                copy={copy.modal}
                onClose={() => setProfileOpen(null)}
                onSelect={() => {
                  setSelectedProfessional(profileOpen)
                  setProfileOpen(null)
                  setStep(2)
                }}
              />
            )}
          </AnimatePresence>

          {step > 0 && step < 5 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-luxury-border">
              <button onClick={() => setStep(s => s - 1)} className="btn-ghost flex items-center gap-2">
                <ChevronLeft size={16} /> {copy.back}
              </button>
              {step < 4 ? (
                <button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}
                  className={cn('btn-gold', !canProceed() && 'opacity-40 cursor-not-allowed')}>
                  {copy.continue} <ChevronRight size={16} />
                </button>
              ) : (
                <button onClick={handleSubmit(onConfirm)} disabled={isSubmitting} className="btn-gold">
                  {isSubmitting ? <><div className="luxury-loader !w-4 !h-4 !border-2" /> {copy.processing}</> : <><CheckCircle size={16} /> {copy.confirmBooking}</>}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ProfessionalProfileModal({
  professional,
  allServices,
  selectedService,
  locale,
  copy,
  onClose,
  onSelect,
}: {
  professional: ApiProfessional
  allServices: ApiService[]
  selectedService: ApiService | null
  locale: 'en' | 'lt'
  copy: ModalCopy
  onClose: () => void
  onSelect: () => void
}) {
  const offeredServices = professional.services.length ? professional.services : allServices
  const gallery = professional.portfolio ?? []
  const heroImage = professional.user.avatarUrl ?? gallery[0]?.imageUrl

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="bg-luxury-surface border border-luxury-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="on-dark-media relative h-48 bg-luxury-charcoal">
          {heroImage ? (
            <Image
              src={heroImage}
              alt={professional.user.fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full flex items-center justify-center text-5xl font-bold text-luxury-black bg-gradient-gold">
              {professional.user.fullName.charAt(0)}
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
          >
            <X size={18} />
          </button>
          <div className="absolute bottom-5 left-5 right-5">
            <h2 className="font-serif text-2xl font-bold text-white">{professional.user.fullName}</h2>
            <p className="text-gold-400 text-sm">{professional.specialization ?? copy.professional}</p>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid md:grid-cols-[1fr_220px] gap-6">
            <div>
              <h3 className="font-semibold text-white mb-2">{copy.profile}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                {professional.bio || copy.fallbackBio(professional.user.fullName)}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-luxury-charcoal border border-luxury-border p-3">
                <p className="text-xs text-gray-500">{copy.experience}</p>
                <p className="text-lg font-bold text-white">{professional.yearsOfExperience ?? 0}+ {copy.years}</p>
              </div>
              <div className="rounded-lg bg-luxury-charcoal border border-luxury-border p-3">
                <p className="text-xs text-gray-500">{copy.rating}</p>
                <p className="text-lg font-bold text-white">{professional.avgRating ? professional.avgRating.toFixed(1) : copy.newLabel}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{copy.canDo}</h3>
            <div className="grid sm:grid-cols-2 gap-2">
              {offeredServices.slice(0, 8).map(service => (
                <div
                  key={service.id ?? service.name}
                  className={cn(
                    'rounded-lg border px-3 py-2 flex items-center justify-between gap-3',
                    selectedService?.id === service.id
                      ? 'border-gold-500/50 bg-gold-500/10'
                      : 'border-luxury-border bg-luxury-charcoal',
                  )}
                >
                  <span className="text-sm text-white">{service.name}</span>
                  {service.price !== undefined && <span className="text-xs font-semibold text-gold-400">{formatPrice(service.price)}</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-3">{copy.gallery}</h3>
            {gallery.length === 0 ? (
              <div className="rounded-lg border border-dashed border-luxury-border p-8 text-center text-gray-500">
                <ImageIcon size={28} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">{copy.emptyGallery}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gallery.map((item, index) => (
                  <div key={`${item.imageUrl}-${index}`} className="on-dark-media relative aspect-square rounded-xl overflow-hidden bg-luxury-charcoal group">
                    <Image src={item.imageUrl} alt={item.caption ?? (locale === 'lt' ? 'Specialisto darbas' : 'Professional work')} fill className="object-cover" />
                    {(item.caption || item.serviceType) && (
                      <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                        {item.serviceType && <p className="text-[10px] text-gold-400 font-semibold">{item.serviceType}</p>}
                        {item.caption && <p className="text-xs text-white line-clamp-2">{item.caption}</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-luxury-border">
            <button onClick={onClose} className="btn-ghost flex-1 justify-center">{copy.close}</button>
            <button onClick={onSelect} className="btn-gold flex-1 justify-center">
              {copy.bookWith(professional.user.fullName.split(' ')[0])}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function generateSlotsForHours(open: string, close: string, intervalMinutes: number, durationMinutes: number) {
  const [openHour, openMinute] = open.split(':').map(Number)
  const [closeHour, closeMinute] = close.split(':').map(Number)
  const startMinutes = (openHour * 60) + openMinute
  const closeMinutes = (closeHour * 60) + closeMinute
  const slots: string[] = []

  for (let mins = startMinutes; mins + durationMinutes <= closeMinutes; mins += intervalMinutes) {
    const hour = Math.floor(mins / 60).toString().padStart(2, '0')
    const minute = (mins % 60).toString().padStart(2, '0')
    slots.push(`${hour}:${minute}`)
  }

  return slots
}
