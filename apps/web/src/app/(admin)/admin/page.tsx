'use client'

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  Users, Calendar, DollarSign, MapPin,
  TrendingUp, AlertCircle, CheckCircle,
  Star, UserX, BarChart2, Activity,
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import { api } from '@/contexts/AuthContext'
import { cn, formatPrice, formatRelativeTime, getInitials } from '@/lib/utils'

type Overview = {
  totalUsers: number
  activeRenters: number
  monthlyBookings: number
  totalRevenue: number
  totalSpots: number
  occupiedSpots: number
  occupancyRate: number
  avgSatisfaction: number
  pendingReviews: number
}

type RevenueRow = { month: string; year: number; revenue: number; bookings: number }
type OccupancyRow = { day: string; rate: number; bookings: number }
type ServiceRow = { id: string; name: string; value: number; revenue: number; color: string }
type TopProfessional = { id: string; name: string; role: string; bookings: number; revenue: number; rating: number }
type Application = { id: string; fullName: string; profession: string; createdAt: string; status: string }
type Booking = {
  id: string
  date: string
  time: string
  status: string
  totalAmount?: number | null
  guestName?: string | null
  service?: { name: string; price: number }
  professional?: { user?: { fullName: string } }
}

const emptyOverview: Overview = {
  totalUsers: 0,
  activeRenters: 0,
  monthlyBookings: 0,
  totalRevenue: 0,
  totalSpots: 0,
  occupiedSpots: 0,
  occupancyRate: 0,
  avgSatisfaction: 0,
  pendingReviews: 0,
}

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<Overview>(emptyOverview)
  const [revenue, setRevenue] = useState<RevenueRow[]>([])
  const [occupancy, setOccupancy] = useState<OccupancyRow[]>([])
  const [services, setServices] = useState<ServiceRow[]>([])
  const [professionals, setProfessionals] = useState<TopProfessional[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    Promise.all([
      api.get<Overview>('/analytics/overview'),
      api.get<RevenueRow[]>('/analytics/revenue?period=monthly'),
      api.get<OccupancyRow[]>('/analytics/occupancy'),
      api.get<ServiceRow[]>('/analytics/services'),
      api.get<TopProfessional[]>('/analytics/top-professionals?limit=5'),
      api.get<{ data: Application[] }>('/rental-applications?limit=4'),
      api.get<{ data: Booking[] }>(`/bookings?date=${today}&limit=5`),
    ])
      .then(([overviewRes, revenueRes, occupancyRes, serviceRes, proRes, appRes, bookingRes]) => {
        setOverview(overviewRes.data)
        setRevenue(revenueRes.data)
        setOccupancy(occupancyRes.data)
        setServices(serviceRes.data)
        setProfessionals(proRes.data)
        setApplications(appRes.data.data)
        setBookings(bookingRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const stats = useMemo(() => [
    { title: 'Total Revenue', value: formatPrice(overview.totalRevenue), change: 'live', icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-500/10' },
    { title: 'Active Renters', value: overview.activeRenters.toString(), change: `${overview.totalUsers} users`, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { title: 'Spots Occupied', value: `${overview.occupiedSpots}/${overview.totalSpots}`, change: `${overview.occupancyRate}%`, icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { title: 'Monthly Bookings', value: overview.monthlyBookings.toString(), change: 'this month', icon: Calendar, color: 'text-green-400', bg: 'bg-green-500/10' },
    { title: 'Avg. Satisfaction', value: overview.avgSatisfaction ? `${overview.avgSatisfaction} ★` : 'N/A', change: 'visible reviews', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { title: 'Pending Reviews', value: overview.pendingReviews.toString(), change: 'moderation', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  ], [overview])

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="luxury-loader" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Afroglow platform overview - {new Date().toLocaleDateString('en', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="#analytics-overview" className="btn-outline-gold text-sm py-2 px-4 hidden sm:flex">
          <BarChart2 size={14} /> Analytics
        </Link>
      </div>

      <div id="analytics-overview" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="card-luxury p-5"
          >
            <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', s.bg)}>
              <s.icon size={17} className={s.color} />
            </div>
            <p className="text-lg font-bold text-white">{s.value}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">{s.title}</p>
            <p className="text-[11px] text-green-400 mt-1">{s.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-white">Revenue & Bookings</h3>
              <p className="text-xs text-gray-400">Actual booking revenue by month</p>
            </div>
            <TrendingUp size={18} className="text-gold-400" />
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenue}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bookGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="month" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: '12px', color: '#fff' }} />
              <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={2} fill="url(#revGrad)" name="Revenue" />
              <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fill="url(#bookGrad)" name="Bookings" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-6">
          <h3 className="font-semibold text-white mb-4">Service Mix</h3>
          {services.length === 0 ? (
            <EmptyPanel label="No completed bookings yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={services} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {services.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: '12px', color: '#fff' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {services.slice(0, 5).map(s => (
                  <div key={s.id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-gray-400">{s.name}</span>
                    </div>
                    <span className="text-white font-semibold">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white">Weekly Spot Occupancy</h3>
            <p className="text-xs text-gray-400">Booking utilization across the last 30 days</p>
          </div>
          <Activity size={18} className="text-gold-400" />
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={occupancy} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis dataKey="day" stroke="#555" tick={{ fill: '#888', fontSize: 12 }} />
            <YAxis domain={[0, 100]} stroke="#555" tick={{ fill: '#888', fontSize: 12 }} tickFormatter={v => `${v}%`} />
            <Tooltip contentStyle={{ background: '#1E1E1E', border: '1px solid #2A2A2A', borderRadius: '12px', color: '#fff' }} formatter={(v: number, name) => [name === 'rate' ? `${v}%` : v, name === 'rate' ? 'Occupancy' : 'Bookings']} />
            <Bar dataKey="rate" fill="#D4AF37" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <DashboardList title="Recent Applications" href="/admin/applications">
          {applications.length === 0 ? <EmptyPanel label="No applications yet" /> : applications.map(app => (
            <div key={app.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-gold flex items-center justify-center text-luxury-black font-bold text-xs flex-shrink-0">
                  {getInitials(app.fullName)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{app.fullName}</p>
                  <p className="text-xs text-gray-400">{app.profession} - {formatRelativeTime(app.createdAt)}</p>
                </div>
              </div>
              <span className={cn('text-xs', app.status === 'APPROVED' ? 'badge-success' : app.status === 'REJECTED' ? 'badge-danger' : 'badge-warning')}>
                {app.status.toLowerCase()}
              </span>
            </div>
          ))}
        </DashboardList>

        <DashboardList title="Today's Bookings" href="/admin/bookings" table>
          {bookings.length === 0 ? <EmptyPanel label="No bookings today" /> : (
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Pro</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id}>
                    <td>
                      <p className="text-sm text-white">{b.guestName ?? 'Customer'}</p>
                      <p className="text-xs text-gray-500">{b.time} - {b.service?.name ?? 'Service'}</p>
                    </td>
                    <td className="text-sm text-gray-400">{b.professional?.user?.fullName ?? '-'}</td>
                    <td className="font-semibold text-gold-400 text-sm">{formatPrice(b.totalAmount ?? b.service?.price ?? 0)}</td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </DashboardList>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxury">
        <div className="flex items-center justify-between p-5 border-b border-luxury-border">
          <h3 className="font-semibold text-white">Top Performing Professionals</h3>
          <Link href="/admin/professionals" className="text-xs text-gold-400 hover:text-gold-300">View all</Link>
        </div>
        <div className="overflow-x-auto">
          {professionals.length === 0 ? <EmptyPanel label="No professional booking data yet" /> : (
            <table className="table-luxury">
              <thead>
                <tr>
                  <th>Professional</th>
                  <th>Role</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Rating</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {professionals.map(pro => (
                  <tr key={pro.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-gold flex items-center justify-center text-luxury-black font-bold text-xs">
                          {getInitials(pro.name)}
                        </div>
                        <span className="font-medium text-white text-sm">{pro.name}</span>
                      </div>
                    </td>
                    <td className="text-sm text-gray-400">{pro.role}</td>
                    <td className="font-semibold text-white text-sm">{pro.bookings}</td>
                    <td className="font-semibold text-gold-400 text-sm">{formatPrice(pro.revenue)}</td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-gold-400 fill-gold-400" />
                        <span className="text-sm font-semibold text-white">{pro.rating || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <Link href="/admin/professionals" className="text-xs text-gold-400 hover:text-gold-300 transition-colors">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function DashboardList({ title, href, children, table = false }: { title: string; href: string; children: React.ReactNode; table?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-luxury">
      <div className="flex items-center justify-between p-5 border-b border-luxury-border">
        <h3 className="font-semibold text-white">{title}</h3>
        <Link href={href} className="text-xs text-gold-400 hover:text-gold-300">View all</Link>
      </div>
      <div className={table ? 'overflow-x-auto' : 'p-4 space-y-3'}>{children}</div>
    </motion.div>
  )
}

function EmptyPanel({ label }: { label: string }) {
  return <div className="py-10 text-center text-sm text-gray-500">{label}</div>
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn(
      status === 'CONFIRMED' ? 'badge-success' :
      status === 'COMPLETED' ? 'badge-blue' :
      status === 'CANCELLED' ? 'badge-danger' :
      'badge-warning',
      'text-xs',
    )}>
      {status.toLowerCase()}
    </span>
  )
}
