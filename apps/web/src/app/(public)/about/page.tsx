'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Target, Eye, Heart, Award, Users, Star, MapPin, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import { useI18n } from '@/contexts/I18nContext'

const TEAM = [
  {
    name:  'Kofi Mensah',
    role:  'Founder & CEO',
    bio:   'Kofi founded Afroglow with a vision to create a premium salon coworking space that celebrates African beauty culture in the heart of Europe.',
    image: 'https://images.unsplash.com/photo-1531384441138-2736e62e0919?w=400&h=400&fit=crop',
  },
  {
    name:  'Adaeze Nwosu',
    role:  'Head of Operations',
    bio:   'With 10+ years in luxury hospitality, Adaeze ensures every client and barber has an exceptional experience at Afroglow.',
    image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop',
  },
  {
    name:  'Tomas Kavaliauskas',
    role:  'Creative Director',
    bio:   'Tomas brings the visual identity of Afroglow to life, blending luxury European aesthetics with vibrant African culture.',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  },
]

const VALUES = [
  { icon: Star,   title: 'Excellence',  desc: 'We set the highest standards for every service and experience.' },
  { icon: Heart,  title: 'Community',   desc: 'Building a space where professionals and clients thrive together.' },
  { icon: Award,  title: 'Authenticity',desc: 'Celebrating cultural beauty heritage with modern techniques.' },
  { icon: Users,  title: 'Inclusion',   desc: 'A welcoming home for every professional and client.' },
]

const MILESTONES = [
  { year: '2019', event: 'Afroglow founded in Vilnius with 5 stations' },
  { year: '2020', event: 'Expanded to 20 working spots; launched online booking' },
  { year: '2021', event: 'Won "Best Afro Salon Lithuania 2021" award' },
  { year: '2022', event: 'Launched the digital platform & chair-rental marketplace' },
  { year: '2023', event: '50+ professionals onboarded; 10,000+ clients served' },
  { year: '2024', event: 'Multi-branch expansion plans launched' },
]

const ABOUT_LT = {
  heroTitle: ['Mūsų', 'istorija'],
  heroText: 'Afroglow gimė iš noro sukurti daugiau nei saloną: erdvę, kuri Vilniaus širdyje puoselėja Afrikos ir Karibų grožio kultūrą.',
  storyTitle: 'Kur kultūra susitinka su meistryste',
  story: [
    '2019 metais Kofi Mensah atvyko į Vilnių su žirklėmis, svajone ir tvirtu įsitikinimu: pasaulinio lygio afrikietiškų plaukų priežiūra nusipelno pasaulinio lygio erdvės.',
    'Apie saloną greitai pasklido žinia. Klientai atvykdavo iš visos Lietuvos ir už jos ribų, kad patirtų kartomis perduotas technikas modernioje, kokybiškoje aplinkoje.',
    'Šiandien Afroglow yra daugiau nei salonas. Tai bendradarbystės bendruomenė, kur grožio profesionalai kuria karjerą, augina savo vardą ir aptarnauja lojalius klientus.',
  ],
  join: 'Prisijungti prie bendruomenės',
  clients: 'Laimingų klientų per mėnesį',
  missionTitle: 'Mūsų misija',
  mission: 'Sukurti kokybišką ir kultūriškai atvirą salono patirtį, kuri padeda grožio specialistams augti ir klientams gauti aukščiausio lygio paslaugas.',
  visionTitle: 'Mūsų vizija',
  vision: 'Tapti pirmaujančia Afrikos ir daugiakultūrio grožio bendradarbystės platforma Europoje, plečiantis į kitus miestus ir saugant grožio tradicijų įvairovę.',
  valuesTitle: 'Mūsų vertybės',
  journeyTitle: 'Mūsų kelias',
  teamTitle: 'Susipažinkite su komanda',
  teamSubtitle: 'Žmonės, kuriantys Afroglow patirtį',
  rentTitle: 'Kodėl verta nuomotis Afroglow?',
  rentText: 'Prisijunkite prie augančios specialistų bendruomenės. Čia jūsų laukia kokybiška darbo vieta, rinkodaros palaikymas ir komanda, kuri padeda augti.',
  apply: 'Pateikti paraišką',
  visit: 'Aplankyti mus',
  values: [
    { title: 'Meistriškumas', desc: 'Kiekvienai paslaugai ir patirčiai keliame aukštus standartus.' },
    { title: 'Bendruomenė', desc: 'Kuriame erdvę, kurioje kartu auga specialistai ir klientai.' },
    { title: 'Autentiškumas', desc: 'Puoselėjame kultūrinį grožio paveldą ir modernias technikas.' },
    { title: 'Įtrauktis', desc: 'Visiems profesionalams ir klientams kuriame svetingą aplinką.' },
  ],
  milestones: [
    'Afroglow įkurtas Vilniuje su 5 darbo vietomis',
    'Išsiplėtė iki 20 darbo vietų ir paleido internetinę rezervaciją',
    'Pelnė „Geriausio afro salono Lietuvoje 2021“ įvertinimą',
    'Paleista skaitmeninė platforma ir darbo vietų nuomos sistema',
    'Prijungta 50+ specialistų ir aptarnauta 10 000+ klientų',
    'Pradėti kelių filialų plėtros planai',
  ],
  team: [
    { role: 'Įkūrėjas ir vadovas', bio: 'Kofi įkūrė Afroglow siekdamas sukurti kokybišką salono bendradarbystės erdvę, kuri Europoje garsina Afrikos grožio kultūrą.' },
    { role: 'Operacijų vadovė', bio: 'Turėdama daugiau nei 10 metų prabangios svetingumo srities patirtį, Adaeze rūpinasi išskirtine klientų ir specialistų patirtimi.' },
    { role: 'Kūrybos vadovas', bio: 'Tomas padeda formuoti Afroglow vizualinį identitetą, jungdamas europietišką estetiką ir gyvą Afrikos kultūrą.' },
  ],
}

export default function AboutPage() {
  const { locale } = useI18n()
  const values = locale === 'lt'
    ? VALUES.map((v, i) => ({ ...v, title: ABOUT_LT.values[i].title, desc: ABOUT_LT.values[i].desc }))
    : VALUES
  const milestones = locale === 'lt'
    ? MILESTONES.map((m, i) => ({ ...m, event: ABOUT_LT.milestones[i] }))
    : MILESTONES
  const team = locale === 'lt'
    ? TEAM.map((m, i) => ({ ...m, role: ABOUT_LT.team[i].role, bio: ABOUT_LT.team[i].bio }))
    : TEAM
  const c = locale === 'lt' ? ABOUT_LT : null

  return (
    <div className="min-h-screen bg-luxury-black pt-20">

      {/* Hero */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="gold-line mb-6" />
            <h1 className="section-title mb-6">
              {c ? c.heroTitle[0] : 'Our'} <span className="gold-shimmer">{c ? c.heroTitle[1] : 'Story'}</span>
            </h1>
            <p className="text-xl text-gray-300 leading-relaxed">
              {c ? c.heroText : 'Afroglow was born from a dream to create more than just a salon — a movement celebrating African & Caribbean beauty culture in the heart of Vilnius, Lithuania.'}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-serif font-bold text-white mb-6">
                {c ? c.storyTitle : 'Where Culture Meets Craft'}
              </h2>
              <div className="space-y-4 text-gray-400 leading-relaxed">
                {(c ? c.story : [
                  'In 2019, Kofi Mensah arrived in Vilnius with scissors, a dream, and an unshakable belief: world-class African hair care deserved a world-class space. He opened the first Afroglow studio with just five chairs and a vision.',
                  'Word spread quickly. Clients came from across Lithuania — and beyond — to experience techniques passed down through generations, now elevated in a truly luxury environment.',
                  "Today, Afroglow is more than a salon. It's a coworking community where over 50 beauty professionals craft their careers, build their brands, and serve thousands of loyal clients.",
                ]).map(text => <p key={text}>{text}</p>)}
              </div>
              <Link href="/rent-a-spot" className="btn-gold mt-8">
                {c ? c.join : 'Join Our Community'} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-luxury h-96">
                <Image
                  src="https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&h=600&fit=crop"
                  alt="Afroglow Salon Interior"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 glass-gold rounded-2xl p-6 shadow-gold">
                <p className="text-3xl font-bold text-gradient-gold">5,000+</p>
                <p className="text-sm text-gray-300">{c ? c.clients : 'Happy Clients Monthly'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-luxury p-8">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20
                              flex items-center justify-center mb-6">
                <Target size={22} className="text-gold-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-4">{c ? c.missionTitle : 'Our Mission'}</h3>
              <p className="text-gray-400 leading-relaxed">
                {c ? c.mission : 'To provide a premium, culturally inclusive salon experience that empowers beauty professionals to build thriving careers while delivering world-class services to every client.'}
              </p>
            </div>
            <div className="card-luxury p-8">
              <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20
                              flex items-center justify-center mb-6">
                <Eye size={22} className="text-gold-400" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-white mb-4">{c ? c.visionTitle : 'Our Vision'}</h3>
              <p className="text-gray-400 leading-relaxed">
                {c ? c.vision : "To become Europe's leading African & multicultural beauty coworking platform, expanding to multiple cities while celebrating diverse beauty traditions at the highest level."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-3"><div className="gold-line" /></div>
            <h2 className="section-title">{c ? c.valuesTitle : 'Our Values'}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury p-6 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20
                                flex items-center justify-center mx-auto mb-4">
                  <v.icon size={20} className="text-gold-400" />
                </div>
                <h4 className="font-semibold text-white mb-2">{v.title}</h4>
                <p className="text-xs text-gray-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-3"><div className="gold-line" /></div>
            <h2 className="section-title">{c ? c.journeyTitle : 'Our Journey'}</h2>
          </div>
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-luxury-border" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-8 pl-20 relative"
                >
                  <div className="absolute left-4 w-8 h-8 rounded-full bg-gradient-gold
                                  flex items-center justify-center -translate-x-1/2 flex-shrink-0">
                    <span className="text-luxury-black text-xs font-bold">{i + 1}</span>
                  </div>
                  <div className="card-luxury p-5">
                    <span className="text-gold-400 font-bold text-sm">{m.year}</span>
                    <p className="text-white mt-1">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-3"><div className="gold-line" /></div>
            <h2 className="section-title">{c ? c.teamTitle : 'Meet the Team'}</h2>
            <p className="section-subtitle mx-auto">{c ? c.teamSubtitle : 'The passionate people behind Afroglow'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, i) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card-luxury overflow-hidden group text-center"
              >
                <div className="relative h-56">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-serif font-bold text-white text-lg">{member.name}</h3>
                  <p className="text-xs text-gold-400 font-semibold mb-3 uppercase tracking-wider">{member.role}</p>
                  <p className="text-sm text-gray-400">{member.bio}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why rent CTA */}
      <section className="py-24 bg-luxury-charcoal/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-3"><div className="gold-line" /></div>
          <h2 className="section-title mb-6">{c ? c.rentTitle : 'Why Rent at Afroglow?'}</h2>
          <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
            {c ? c.rentText : 'Join a growing community of professionals who have found their home at Afroglow. Premium workspace, built-in marketing, and a supportive team behind you.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/rent-a-spot" className="btn-gold text-base px-8 py-4">
              {c ? c.apply : 'Apply to Rent'} <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="btn-outline-gold text-base px-8 py-4">
              <MapPin size={16} /> {c ? c.visit : 'Visit Us'}
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
