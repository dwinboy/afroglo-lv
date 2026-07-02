'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Search, Check, X, Eye, Phone, Mail, Calendar } from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'

interface Application {
  id:               string
  fullName:         string
  email:            string
  phone:            string
  specialization:   string
  yearsExperience?: string
  rentalDuration?:  string
  message?:         string
  status:           string
  createdAt:        string
  rentalSpot?:      { spotNumber: string }
  preferredSpot?:   string
}

const STATUS_COLOR: Record<string, string> = {
  PENDING:  'text-yellow-400 bg-yellow-400/10',
  APPROVED: 'text-green-400  bg-green-400/10',
  REJECTED: 'text-red-400    bg-red-400/10',
}

export default function AdminApplicationsPage() {
  const [apps, setApps]       = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('')
  const [selected, setSelected] = useState<Application | null>(null)

  useEffect(() => { fetchApps() }, [search, filter])

  async function fetchApps() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filter) params.set('status', filter)
      const { data } = await api.get(`/rental-applications?${params}`)
      setApps(data.data ?? data)
    } catch {
      setApps([])
    } finally {
      setLoading(false)
    }
  }

  async function decide(id: string, status: 'APPROVED' | 'REJECTED') {
    try {
      const endpoint = status === 'APPROVED' ? 'approve' : 'reject'
      await api.patch(`/rental-applications/${id}/${endpoint}`)
      toast.success(`Application ${status.toLowerCase()}`)
      setSelected(null)
      fetchApps()
    } catch {
      toast.error('Failed to update application')
    }
  }

  const pending = apps.filter(a => a.status === 'PENDING').length

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">Spot Applications</h1>
        <p className="text-gray-400 text-sm mt-1">
          {pending > 0 ? <span className="text-yellow-400 font-medium">{pending} pending review</span> : 'All applications reviewed'}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search applicants…" className="input-luxury pl-9 w-full" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="input-luxury">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Table */}
      <div className="card-luxury overflow-hidden">
        {loading ? (
          <div className="p-16 text-center"><div className="luxury-loader mx-auto" /></div>
        ) : apps.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <ClipboardList size={40} className="mx-auto mb-3 opacity-30" />
            <p>No applications yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-luxury-border">
                {['Applicant', 'Specialization', 'Plan', 'Spot Pref.', 'Applied', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-luxury-surface/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-white font-medium">{app.fullName}</p>
                    <p className="text-xs text-gray-400">{app.email}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{app.specialization}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-1 rounded-full bg-gold-500/10 text-gold-400 capitalize">
                      {app.rentalDuration?.toLowerCase() ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{app.preferredSpot ?? app.rentalSpot?.spotNumber ?? '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLOR[app.status] ?? 'text-gray-400 bg-gray-400/10'}`}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(app)}
                        className="p-1.5 rounded-lg bg-luxury-muted text-gray-400 hover:text-white">
                        <Eye size={14} />
                      </button>
                      {app.status === 'PENDING' && (
                        <>
                          <button onClick={() => decide(app.id, 'APPROVED')}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">
                            <Check size={14} />
                          </button>
                          <button onClick={() => decide(app.id, 'REJECTED')}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
                            <X size={14} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-luxury-charcoal border border-luxury-border rounded-2xl w-full max-w-lg p-6 space-y-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selected.fullName}</h2>
                <p className="text-gray-400 text-sm">{selected.specialization}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3">
              {[
                { icon: Mail,     label: 'Email',       value: selected.email     },
                { icon: Phone,    label: 'Phone',       value: selected.phone     },
                { icon: Calendar, label: 'Experience',  value: `${selected.yearsExperience ?? '0'} years` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 bg-luxury-surface rounded-xl">
                  <Icon size={16} className="text-gold-400" />
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm text-white">{value}</p>
                  </div>
                </div>
              ))}
              {selected.message && (
                <div className="p-3 bg-luxury-surface rounded-xl">
                  <p className="text-xs text-gray-400 mb-1">Message</p>
                  <p className="text-sm text-gray-300">{selected.message}</p>
                </div>
              )}
            </div>

            {selected.status === 'PENDING' && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => decide(selected.id, 'APPROVED')}
                  className="flex-1 btn-gold justify-center">
                  <Check size={16} /> Approve
                </button>
                <button onClick={() => decide(selected.id, 'REJECTED')}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
                  <X size={16} /> Reject
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </motion.div>
  )
}
