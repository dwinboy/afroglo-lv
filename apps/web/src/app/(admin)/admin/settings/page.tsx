'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, MapPin, Phone, Mail, Clock, Save } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '@/contexts/AuthContext'

interface BranchSettings {
  name:    string
  address: string
  city:    string
  country: string
  phone:   string
  email:   string
  openingHours: {
    monday:    { open: string; close: string; closed?: boolean }
    tuesday:   { open: string; close: string; closed?: boolean }
    wednesday: { open: string; close: string; closed?: boolean }
    thursday:  { open: string; close: string; closed?: boolean }
    friday:    { open: string; close: string; closed?: boolean }
    saturday:  { open: string; close: string; closed?: boolean }
    sunday:    { open: string; close: string; closed?: boolean }
  }
}

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] as const

const DEFAULT: BranchSettings = {
  name: 'Afroglow Vilnius',
  address: 'Kalvarijų g. 88',
  city: 'Vilnius',
  country: 'Lithuania',
  phone: '+37069150485',
  email: 'afroglowstudiostudio@gmail.com',
  openingHours: {
    monday:    { open: '09:00', close: '21:00' },
    tuesday:   { open: '09:00', close: '21:00' },
    wednesday: { open: '09:00', close: '21:00' },
    thursday:  { open: '09:00', close: '21:00' },
    friday:    { open: '09:00', close: '21:00' },
    saturday:  { open: '09:00', close: '19:00' },
    sunday:    { open: '10:00', close: '17:00' },
  },
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<BranchSettings>(DEFAULT)
  const [loading, setSaving]    = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const { data } = await api.get('/admin/settings/branch')
        setSettings({
          ...DEFAULT,
          name: data.name ?? DEFAULT.name,
          address: data.address ?? DEFAULT.address,
          city: data.city ?? DEFAULT.city,
          country: data.country ?? DEFAULT.country,
          phone: data.phone ?? DEFAULT.phone,
          email: data.email ?? DEFAULT.email,
          openingHours: data.openingHours ?? DEFAULT.openingHours,
        })
      } catch {
        toast.error('Failed to load branch settings')
      } finally {
        setLoadingSettings(false)
      }
    }

    fetchSettings()
  }, [])

  function setHours(day: typeof DAYS[number], field: 'open' | 'close', value: string) {
    setSettings(s => ({
      ...s,
      openingHours: { ...s.openingHours, [day]: { ...s.openingHours[day], [field]: value } },
    }))
  }

  function setClosed(day: typeof DAYS[number], closed: boolean) {
    setSettings(s => ({
      ...s,
      openingHours: { ...s.openingHours, [day]: { ...s.openingHours[day], closed } },
    }))
  }

  async function save() {
    setSaving(true)
    try {
      const { data } = await api.put('/admin/settings/branch', settings)
      setSettings({
        ...settings,
        name: data.name,
        address: data.address,
        city: data.city,
        country: data.country,
        phone: data.phone ?? '',
        email: data.email ?? '',
        openingHours: data.openingHours ?? settings.openingHours,
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loadingSettings) {
    return <div className="p-16 text-center"><div className="luxury-loader mx-auto" /></div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-serif text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Branch information & working hours</p>
      </div>

      {/* Contact info */}
      <div className="card-luxury p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><MapPin size={16} className="text-gold-400" /> Branch Info</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {([
            { label: 'Branch Name',  key: 'name'    as const },
            { label: 'Address',      key: 'address' as const },
            { label: 'City',         key: 'city'    as const },
            { label: 'Country',      key: 'country' as const },
          ]).map(({ label, key }) => (
            <div key={key}>
              <label className="label-luxury">{label}</label>
              <input value={settings[key]}
                onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))}
                className="input-luxury w-full" />
            </div>
          ))}
          <div>
            <label className="label-luxury flex items-center gap-1.5"><Phone size={12} /> Phone</label>
            <input value={settings.phone}
              onChange={e => setSettings(s => ({ ...s, phone: e.target.value }))}
              className="input-luxury w-full" />
          </div>
          <div>
            <label className="label-luxury flex items-center gap-1.5"><Mail size={12} /> Email</label>
            <input value={settings.email} type="email"
              onChange={e => setSettings(s => ({ ...s, email: e.target.value }))}
              className="input-luxury w-full" />
          </div>
        </div>
      </div>

      {/* Working hours */}
      <div className="card-luxury p-6 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2"><Clock size={16} className="text-gold-400" /> Working Hours</h2>

        <div className="space-y-3">
          {DAYS.map(day => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <span className="text-sm text-gray-400 capitalize w-24">{day}</span>
              <div className="flex items-center gap-2 flex-1">
                <input type="time" value={settings.openingHours[day].open}
                  onChange={e => setHours(day, 'open', e.target.value)}
                  disabled={settings.openingHours[day].closed}
                  className="input-luxury flex-1 text-sm disabled:opacity-40" />
                <span className="text-gray-500 text-sm">–</span>
                <input type="time" value={settings.openingHours[day].close}
                  onChange={e => setHours(day, 'close', e.target.value)}
                  disabled={settings.openingHours[day].closed}
                  className="input-luxury flex-1 text-sm disabled:opacity-40" />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={!!settings.openingHours[day].closed}
                  onChange={e => setClosed(day, e.target.checked)}
                  className="accent-gold-500"
                />
                Closed
              </label>
            </div>
          ))}
        </div>
      </div>

      <button onClick={save} disabled={loading}
        className="btn-gold">
        {loading ? <div className="luxury-loader !w-4 !h-4 !border-2" /> : <Save size={16} />}
        Save Changes
      </button>
    </motion.div>
  )
}
