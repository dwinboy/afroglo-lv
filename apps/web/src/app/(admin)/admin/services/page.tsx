'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Eye, EyeOff, Star } from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { formatPrice, cn } from '@/lib/utils'

interface Service {
  id:          string
  name:        string
  category:    string
  description: string
  price:       number
  duration:    number
  icon:        string
  isActive:    boolean
  isPopular:   boolean
}

const CATEGORIES = ['Hair', 'Beard', 'Braids & Locs', 'Color', 'Treatments', 'Special']

const ICONS = ['✂️','💈','🪒','👑','🧵','🔒','🎨','👸','💆','✨','🌟','💅']

const EMPTY: Omit<Service, 'id'> = {
  name: '', category: 'Hair', description: '', price: 0,
  duration: 30, icon: '✂️', isActive: true, isPopular: false,
}

export default function AdminServicesPage() {
  const [services, setServices]   = useState<Service[]>([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState<'create' | 'edit' | null>(null)
  const [editing, setEditing]     = useState<Service | null>(null)
  const [form, setForm]           = useState<Omit<Service, 'id'>>(EMPTY)
  const [saving, setSaving]       = useState(false)

  useEffect(() => { fetchServices() }, [])

  async function fetchServices() {
    setLoading(true)
    try {
      // Admin fetches all (active + inactive) via a direct query
      const { data } = await api.get('/services/all')
      setServices(Array.isArray(data) ? data : [])
    } catch {
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(EMPTY)
    setEditing(null)
    setModal('create')
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, category: s.category, description: s.description ?? '', price: s.price,
      duration: s.duration, icon: s.icon ?? '✂️', isActive: s.isActive, isPopular: s.isPopular })
    setModal('edit')
  }

  async function save() {
    if (!form.name.trim()) { toast.error('Service name is required'); return }
    if (form.price < 0)    { toast.error('Price must be positive');   return }
    if (form.duration < 5) { toast.error('Minimum duration is 5 min'); return }
    setSaving(true)
    try {
      if (modal === 'create') {
        await api.post('/services', form)
        toast.success('Service created')
      } else if (editing) {
        await api.put(`/services/${editing.id}`, form)
        toast.success('Service updated')
      }
      setModal(null)
      fetchServices()
    } catch {
      toast.error('Failed to save service')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(s: Service) {
    try {
      await api.put(`/services/${s.id}`, { isActive: !s.isActive })
      setServices(prev => prev.map(x => x.id === s.id ? { ...x, isActive: !x.isActive } : x))
    } catch {
      toast.error('Failed to update service')
    }
  }

  async function deleteService(id: string) {
    if (!confirm('Delete this service? This cannot be undone.')) return
    try {
      await api.delete(`/services/${id}`)
      toast.success('Service deleted')
      setServices(prev => prev.filter(s => s.id !== id))
    } catch {
      toast.error('Cannot delete — service may have bookings')
    }
  }

  const f = (key: keyof typeof form, val: any) => setForm(p => ({ ...p, [key]: val }))

  const activeCount   = services.filter(s => s.isActive).length
  const activeServices = services.filter(s => s.isActive)

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Services & Prices</h1>
          <p className="text-gray-400 text-sm mt-1">{activeCount} active · {services.length} total</p>
        </div>
        <button onClick={openCreate} className="btn-gold">
          <Plus size={16} /> New Service
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Services', value: services.length },
          { label: 'Active',         value: activeCount },
          { label: 'Inactive',       value: services.length - activeCount },
          { label: 'Price Range',    value: activeServices.length ? `€${Math.min(...activeServices.map(s=>s.price))}–€${Math.max(...activeServices.map(s=>s.price))}` : '—' },
        ].map(s => (
          <div key={s.label} className="card-luxury p-4">
            <p className="text-xs text-gray-400">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="p-16 text-center"><div className="luxury-loader mx-auto" /></div>
      ) : (
        <div className="card-luxury overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-luxury-border">
                {['Service','Category','Price','Duration','Status',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-luxury-border">
              {services.map(s => (
                <tr key={s.id} className={cn('hover:bg-luxury-surface/30 transition-colors', !s.isActive && 'opacity-50')}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon ?? '✂️'}</span>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-medium text-white">{s.name}</span>
                          {s.isPopular && <Star size={10} className="text-gold-400 fill-gold-400" />}
                        </div>
                        {s.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{s.description}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 text-xs rounded-full bg-luxury-surface text-gray-300 border border-luxury-border">{s.category}</span>
                  </td>
                  <td className="px-4 py-3 font-bold text-gold-400">{formatPrice(s.price)}</td>
                  <td className="px-4 py-3 text-gray-400">{s.duration} min</td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(s)}
                      className={cn('flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors',
                        s.isActive ? 'text-green-400 bg-green-500/10 hover:bg-green-500/20' : 'text-gray-400 bg-luxury-surface hover:bg-luxury-muted/50')}>
                      {s.isActive ? <Eye size={12} /> : <EyeOff size={12} />}
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-luxury-surface transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteService(s.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 && (
            <div className="p-16 text-center text-gray-400">
              <p>No services yet. Create your first service.</p>
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setModal(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-luxury-charcoal border border-luxury-border rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-luxury-border">
                <h2 className="font-semibold text-white">{modal === 'create' ? 'New Service' : 'Edit Service'}</h2>
                <button onClick={() => setModal(null)} className="text-gray-400 hover:text-white"><X size={18} /></button>
              </div>

              <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">

                {/* Icon picker */}
                <div>
                  <label className="label-luxury">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(ic => (
                      <button key={ic} type="button" onClick={() => f('icon', ic)}
                        className={cn('text-xl p-2 rounded-lg border transition-colors',
                          form.icon === ic ? 'border-gold-500/60 bg-gold-500/10' : 'border-luxury-border hover:border-luxury-muted/50')}>
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="label-luxury">Service Name *</label>
                  <input value={form.name} onChange={e => f('name', e.target.value)}
                    placeholder="e.g. Box Braids" className="input-luxury w-full" />
                </div>

                {/* Category */}
                <div>
                  <label className="label-luxury">Category</label>
                  <select value={form.category} onChange={e => f('category', e.target.value)} className="input-luxury w-full">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {/* Price & Duration */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-luxury">Price (€) *</label>
                    <input type="number" min={0} step={0.5} value={form.price}
                      onChange={e => f('price', parseFloat(e.target.value) || 0)}
                      className="input-luxury w-full" />
                  </div>
                  <div>
                    <label className="label-luxury">Duration (min) *</label>
                    <input type="number" min={5} step={5} value={form.duration}
                      onChange={e => f('duration', parseInt(e.target.value) || 30)}
                      className="input-luxury w-full" />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="label-luxury">Description</label>
                  <textarea value={form.description} onChange={e => f('description', e.target.value)}
                    rows={2} maxLength={300} placeholder="Brief description for clients…"
                    className="input-luxury w-full resize-none" />
                </div>

                {/* Toggles */}
                <div className="flex gap-4">
                  {([
                    { key: 'isActive' as const,  label: 'Active (visible to clients)' },
                    { key: 'isPopular' as const, label: 'Mark as Popular' },
                  ]).map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => f(key, !form[key])}
                        className={cn('w-10 h-5 rounded-full transition-colors relative cursor-pointer',
                          form[key] ? 'bg-gold-500' : 'bg-luxury-surface border border-luxury-border')}>
                        <div className={cn('absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                          form[key] ? 'translate-x-5' : 'translate-x-0.5')} />
                      </div>
                      <span className="text-sm text-gray-300">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-luxury-border flex gap-3 justify-end">
                <button onClick={() => setModal(null)} className="btn-ghost">Cancel</button>
                <button onClick={save} disabled={saving} className="btn-gold">
                  {saving ? <div className="luxury-loader !w-4 !h-4 !border-2" /> : <Save size={16} />}
                  {modal === 'create' ? 'Create Service' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
