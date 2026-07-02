'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, Globe, User, LogOut, LayoutDashboard, Shield, Moon, Sun } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useI18n } from '@/contexts/I18nContext'
import { useTheme } from '@/contexts/ThemeContext'
import { cn } from '@/lib/utils'

const navLinks = (t: ReturnType<typeof useI18n>['t']) => [
  { href: '/',              label: t.nav.home },
  { href: '/about',         label: t.nav.about },
  { href: '/services',      label: t.nav.services },
  { href: '/professionals', label: t.nav.professionals },
  { href: '/rent-a-spot',   label: t.nav.rentASpot },
]

export default function Navbar() {
  const [isScrolled,    setIsScrolled]    = useState(false)
  const [isMobileOpen,  setIsMobileOpen]  = useState(false)
  const [isUserMenuOpen,setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isAuthenticated } = useAuth()
  const { t, locale, setLocale } = useI18n()
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setIsMobileOpen(false) }, [pathname])

  const links = navLinks(t)

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-luxury-black/95 backdrop-blur-xl border-b border-luxury-border shadow-luxury'
          : 'bg-transparent',
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-gold rounded-lg flex items-center justify-center">
              <span className="text-luxury-black font-serif font-bold text-lg">A</span>
            </div>
            <span className="font-serif font-bold text-xl text-white opacity-90 group-hover:opacity-100 transition-opacity">
              Afroglow
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'nav-link text-sm',
                  pathname === link.href && 'nav-link-active text-gold-400',
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400
                         hover:text-gold-400 hover:bg-gold-500/10
                         border border-luxury-border hover:border-gold-500/30
                         transition-all duration-200"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={() => setLocale(locale === 'en' ? 'lt' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-gray-400 hover:text-gold-400 hover:bg-gold-500/10
                         border border-luxury-border hover:border-gold-500/30
                         transition-all duration-200"
              aria-label="Toggle language"
            >
              <Globe size={14} />
              {locale.toUpperCase()}
            </button>

            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             hover:bg-luxury-surface transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center
                                  text-luxury-black font-semibold text-sm avatar-gold">
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 bg-luxury-surface border border-luxury-border
                                 rounded-2xl shadow-luxury overflow-hidden z-50"
                    >
                      <div className="p-3 border-b border-luxury-border">
                        <p className="text-sm font-semibold text-white">{user.fullName}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                        <span className="badge-gold mt-1 text-xs">{user.role}</span>
                      </div>
                      <div className="p-2">
                        <Link
                          href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                     text-gray-300 hover:text-white hover:bg-luxury-muted/50
                                     transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {user.role === 'ADMIN'
                            ? <><Shield size={16} className="text-gold-400" /> Admin Panel</>
                            : <><LayoutDashboard size={16} className="text-gold-400" /> Dashboard</>
                          }
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                     text-gray-300 hover:text-white hover:bg-luxury-muted/50
                                     transition-colors"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <User size={16} className="text-gold-400" /> Profile
                        </Link>
                        <button
                          onClick={() => { logout(); setIsUserMenuOpen(false) }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
                                     text-red-400 hover:text-red-300 hover:bg-red-500/10
                                     transition-colors"
                        >
                          <LogOut size={16} /> {t.nav.logout}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth/login" className="btn-ghost text-sm py-2 px-4">
                  {t.nav.login}
                </Link>
                <Link href="/book" className="btn-gold text-sm py-2 px-5">
                  {t.nav.booking}
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white
                       hover:bg-luxury-surface transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden border-t border-luxury-border bg-luxury-black/98 backdrop-blur-xl"
          >
            <div className="px-4 py-4 space-y-1">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'text-gold-400 bg-gold-500/10'
                      : 'text-gray-300 hover:text-white hover:bg-luxury-surface',
                  )}
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 border-t border-luxury-border space-y-2">
                {isAuthenticated && user ? (
                  <>
                    <Link href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                      className="block px-4 py-3 rounded-xl text-sm text-gray-300 hover:bg-luxury-surface">
                      {user.role === 'ADMIN' ? t.nav.admin : t.nav.dashboard}
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10"
                    >
                      {t.nav.logout}
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" className="block btn-ghost w-full text-center py-3">
                      {t.nav.login}
                    </Link>
                    <Link href="/book" className="block btn-gold w-full text-center py-3">
                      {t.nav.booking}
                    </Link>
                  </>
                )}

                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gold-400"
                  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </button>

                <button
                  onClick={() => setLocale(locale === 'en' ? 'lt' : 'en')}
                  className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400 hover:text-gold-400"
                >
                  <Globe size={16} /> {locale === 'en' ? 'Lietuvių' : 'English'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
