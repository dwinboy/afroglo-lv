'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Search, Filter, Eye, Clock, User, Scissors, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { formatPrice } from '@/lib/utils'

interface Booking {
  id: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  guestName?: string | null
  guestEmail?: string | null
  guestPhone?: string | null
  date: string
  time: string
  status: string
  totalPrice?: number
  totalAmount?: number | null
  service?: { name: string }
  professional?: { user: { fullName: string } }
  customer?: { fullName: string; email: string; phone?: string | null } | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  CONFIRMED:  { label: 'Confirmed',  color: 'text-green-400 bg-green-400/10',  icon: CheckCircle  },
  PENDING:    { label: 'Pending',    color: 'text-yellow-400 bg-yellow-400/10', icon: AlertCircle  },
  COMPLETED:  { label: 'Completed',  color: 'text-blue-400 bg-blue-400/10',    icon: CheckCircle  },
  CANCELLED:  { label: 'Cancelled',  color: 'text-red-400 bg-red-400/10',      icon: XCircle      },
  NO_SHOW:    { label: 'No Show',    color: 'text-gray-400 bg-gray-400/10',    icon: XCircle      },
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [status, setStatus]     = useState('')
  const [page, setPage]         = useState(1)
  const [total, setTotal]       = useState(0)
  const limit = 20

  useEffect(() => {
    fetchBookings()
  }, [search, status, page])

  async function fetchBookings() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (search) params.set('search', search)
      if (status) params.set('status', status)
      const { data } = await api.get(`/bookings?${params}`)
      setBookings(data.data ?? data)
      setTotal(data.total ?? (data.data ?? data).length)
    } catch {
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    try {
      await api.patch(`/bookings/${id}/status`, { status: newStatus })
      fetchBookings()
    } catch { /* handled silently */ }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">Bookings</h1>
        <p className="text-gray-400 text-sm mt-1">All guest appointment bookings</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name or email…"
            className="input-luxury pl-9 w-full"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1) }}
            className="input-luxury pl-9 pr-8 appearance-none"
          >
            <option value="">All statuses</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><div className="luxury-loader mx-auto" /></div>
        ) : bookings.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p>No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-luxury-border">
                  {['Client', 'Service', 'Professional', 'Date & Time', 'Price', 'Status', ''].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-luxury-border">
                {bookings.map(b => {
                  const cfg = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.PENDING
                  const Icon = cfg.icon
                  const clientName = b.clientName ?? b.guestName ?? b.customer?.fullName ?? 'Guest client'
                  const clientEmail = b.clientEmail ?? b.guestEmail ?? b.customer?.email ?? 'No email'
                  const clientPhone = b.clientPhone ?? b.guestPhone ?? b.customer?.phone
                  const totalPrice = b.totalPrice ?? b.totalAmount ?? 0
                  return (
                    <tr key={b.id} className="hover:bg-luxury-surface/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-luxury-black font-bold text-xs">
                            {clientName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm text-white font-medium">{clientName}</p>
                            <p className="text-xs text-gray-400">{clientEmail}</p>
                            {clientPhone && <p className="text-xs text-gray-500">{clientPhone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <Scissors size={14} className="text-gold-400" />
                          {b.service?.name ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <User size={14} className="text-gold-400" />
                          {b.professional?.user?.fullName ?? '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-300">
                          <Clock size={14} className="text-gold-400" />
                          <span>{new Date(b.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} · {b.time}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white font-medium">{formatPrice(totalPrice)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
                          <Icon size={12} />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {b.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => updateStatus(b.id, 'CONFIRMED')}
                              className="text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">
                              Confirm
                            </button>
                            <button onClick={() => updateStatus(b.id, 'CANCELLED')}
                              className="text-xs px-2.5 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>{total} total bookings</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => p - 1)} disabled={page === 1}
              className="px-3 py-1.5 rounded-lg border border-luxury-border hover:border-gold-500/30 disabled:opacity-40">
              Prev
            </button>
            <span className="px-3 py-1.5 text-white">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg border border-luxury-border hover:border-gold-500/30 disabled:opacity-40">
              Next
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
