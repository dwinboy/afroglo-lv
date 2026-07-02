'use client'

import Link from 'next/link'
import { ArrowLeft, CheckCircle, FileText, Mail, Shield } from 'lucide-react'
import { useI18n } from '@/contexts/I18nContext'

type LegalSection = {
  title: string
  body?: string
  items?: string[]
}

type LegalCopy = {
  eyebrow: string
  title: string
  intro: string
  updated: string
  back: string
  contactTitle: string
  contactText: string
  contactEmail: string
  sections: LegalSection[]
}

type LegalContentPageProps = {
  icon: 'privacy' | 'terms' | 'gdpr'
  copy: {
    en: LegalCopy
    lt: LegalCopy
  }
}

const iconMap = {
  privacy: Shield,
  terms: FileText,
  gdpr: CheckCircle,
}

export default function LegalContentPage({ icon, copy }: LegalContentPageProps) {
  const { locale } = useI18n()
  const page = copy[locale]
  const Icon = iconMap[icon]

  return (
    <div className="min-h-screen bg-luxury-black pt-20">
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="btn-ghost mb-8 px-0">
            <ArrowLeft size={16} /> {page.back}
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
              <Icon size={22} className="text-gold-400" />
            </div>
            <span className="badge-gold">{page.eyebrow}</span>
          </div>

          <h1 className="section-title mb-5">{page.title}</h1>
          <p className="text-lg text-gray-300 max-w-3xl">{page.intro}</p>
          <p className="text-sm text-gray-500 mt-6">{page.updated}</p>
        </div>
      </section>

      <section className="pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {page.sections.map(section => (
            <article key={section.title} className="card-luxury p-6 sm:p-8">
              <h2 className="font-serif text-2xl font-bold text-white mb-4">{section.title}</h2>
              {section.body && <p className="text-gray-400">{section.body}</p>}
              {section.items && (
                <ul className="space-y-3">
                  {section.items.map(item => (
                    <li key={item} className="flex items-start gap-3 text-sm text-gray-400">
                      <CheckCircle size={16} className="text-gold-400 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}

          <article className="card-luxury p-6 sm:p-8 bg-gold-500/5">
            <h2 className="font-serif text-2xl font-bold text-white mb-3">{page.contactTitle}</h2>
            <p className="text-gray-400 mb-5">{page.contactText}</p>
            <a href={`mailto:${page.contactEmail}`} className="btn-outline-gold">
              <Mail size={16} /> {page.contactEmail}
            </a>
          </article>
        </div>
      </section>
    </div>
  )
}
