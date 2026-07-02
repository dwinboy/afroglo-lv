'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Calendar, MapPin,
  Star, Settings, LogOut, Menu, X, Shield,
  ChevronRight, Home, Bell, ClipboardList, Scissors, Tag, ImageIcon,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn, getInitials } from '@/lib/utils'

const ADMIN_NAV = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Overview'      },
  { href: '/admin/professionals', icon: Scissors,        label: 'Professionals' },
  { href: '/admin/bookings',      icon: Calendar,        label: 'Bookings'      },
  { href: '/admin/services',      icon: Tag,             label: 'Services'      },
  { href: '/admin/gallery',       icon: ImageIcon,       label: 'Gallery'       },
  { href: '/admin/spots',         icon: MapPin,          label: 'Spots'         },
  { href: '/admin/applications',  icon: ClipboardList,   label: 'Applications'  },
  { href: '/admin/reviews',       icon: Star,            label: 'Reviews'       },
  { href: '/admin/settings',      icon: Settings,        label: 'Settings'      },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router   = useRouter()
  const { user, logout, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
      router.replace('/auth/login')
    }
  }, [isAuthenticated, isLoading, user, router])

  if (isLoading) return (
    <div className="min-h-screen bg-luxury-black flex items-center justify-center">
      <div className="luxury-loader" />
    </div>
  )

  if (!user || user.role !== 'ADMIN') return null

  return (
    <div className="min-h-screen bg-luxury-black flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed h-full bg-luxury-charcoal border-r border-luxury-border z-40">
        <AdminSidebar user={user} pathname={pathname} logout={logout} onClose={() => {}} />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-luxury-charcoal border-r border-luxury-border z-50 lg:hidden"
            >
              <AdminSidebar user={user} pathname={pathname} logout={logout} onClose={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col">
        <header className="h-16 bg-luxury-charcoal/80 backdrop-blur-md border-b border-luxury-border
                           flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <Link href="/" className="hover:text-white"><Home size={16} /></Link>
              <ChevronRight size={14} />
              <Shield size={14} className="text-gold-400" />
              <span className="text-white">Admin</span>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight size={14} />
                  <span className="text-white capitalize">{pathname.split('/').pop()?.replace(/-/g, ' ')}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-xl text-gray-400 hover:text-white hover:bg-luxury-surface">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center
                              text-luxury-black font-bold text-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-white">{user.fullName}</p>
                <p className="text-xs text-gold-400">Administrator</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}

function AdminSidebar({
  user, pathname, logout, onClose,
}: {
  user: ReturnType<typeof useAuth>['user']
  pathname: string
  logout: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center justify-between px-5 border-b border-luxury-border">
        <Link href="/" className="inline-flex items-center gap-2" onClick={onClose}>
          <div className="w-8 h-8 bg-gradient-gold rounded-lg flex items-center justify-center">
            <span className="text-luxury-black font-serif font-bold text-base">A</span>
          </div>
          <span className="font-serif font-bold text-lg text-white">Afroglow</span>
        </Link>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white"><X size={20} /></button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {ADMIN_NAV.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn('sidebar-item', isActive && 'sidebar-item-active')}
            >
              <item.icon size={18} />
              {item.label}
              {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-400" />}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-luxury-border">
        <button
          onClick={logout}
          className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  )
}
