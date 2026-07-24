'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Trash2, ImageIcon, Upload, X, Loader } from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface PortfolioItem {
  id:          string
  imageUrl:    string
  caption?:    string
  serviceType?: string
  tags:        string[]
  likes:       number
  isPublic:    boolean
  createdAt:   string
}

interface UploadForm {
  caption:     string
  serviceType: string
}

const SERVICE_TYPES = [
  'Haircut', 'Fade & Taper', 'Beard Trim', 'Box Braids', 'Knotless Braids',
  'Cornrows', 'Dreadlocks', 'Locs Retwist', 'Wig Installation', 'Hair Coloring',
  'Highlights', 'Other',
]

export default function DashboardPortfolioPage() {
  const [items, setItems]       = useState<PortfolioItem[]>([])
  const [loading, setLoading]   = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [preview, setPreview]   = useState<string | null>(null)
  const [file, setFile]         = useState<File | null>(null)
  const [form, setForm]         = useState<UploadForm>({ caption: '', serviceType: '' })
  const fileRef                 = useRef<HTMLInputElement>(null)

  useEffect(() => { fetchPortfolio() }, [])

  async function fetchPortfolio() {
    setLoading(true)
    try {
      const { data } = await api.get('/professionals/me/portfolio')
      setItems(Array.isArray(data) ? data : [])
    } catch {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File must be under 10MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
    setShowForm(true)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    try {
      // 1. Upload image file — DB-backed so it shows on the live domain
      const fd = new FormData()
      fd.append('file', file)
      const { data: uploadData } = await api.post('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const imageUrl = Array.isArray(uploadData) ? uploadData[0].url : uploadData.url

      // 2. Save portfolio item
      await api.post('/professionals/me/portfolio', {
        imageUrl,
        caption:     form.caption || undefined,
        serviceType: form.serviceType || undefined,
      })

      toast.success('Photo added to portfolio!')
      setShowForm(false)
      setFile(null)
      setPreview(null)
      setForm({ caption: '', serviceType: '' })
      if (fileRef.current) fileRef.current.value = ''
      fetchPortfolio()
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function deleteItem(id: string) {
    if (!confirm('Remove this photo from your portfolio?')) return
    try {
      await api.delete(`/professionals/me/portfolio/${id}`)
      toast.success('Photo removed')
      setItems(prev => prev.filter(i => i.id !== id))
    } catch {
      toast.error('Failed to remove photo')
    }
  }

  function cancelUpload() {
    setShowForm(false)
    setFile(null)
    setPreview(null)
    setForm({ caption: '', serviceType: '' })
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 text-sm mt-1">{items.length} photos · Showcase your best work</p>
        </div>
        <button
          onClick={() => fileRef.current?.click()}
          className="btn-gold"
          disabled={uploading}
        >
          <Plus size={16} /> Add Photo
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
        />
      </div>

      {/* Upload form modal */}
      <AnimatePresence>
        {showForm && preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={cancelUpload}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-luxury-charcoal border border-luxury-border rounded-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Preview */}
              <div className="relative aspect-[4/3] bg-black">
                <Image src={preview} alt="Preview" fill className="object-cover" />
              </div>

              {/* Form */}
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-semibold">Add to Portfolio</h3>
                  <button onClick={cancelUpload} className="text-gray-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div>
                  <label className="label-luxury">Service Type</label>
                  <select
                    value={form.serviceType}
                    onChange={e => setForm(f => ({ ...f, serviceType: e.target.value }))}
                    className="input-luxury w-full"
                  >
                    <option value="">Select service type…</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="label-luxury">Caption (optional)</label>
                  <input
                    value={form.caption}
                    onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                    placeholder="Describe this style…"
                    className="input-luxury w-full"
                    maxLength={200}
                  />
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={cancelUpload} className="flex-1 btn-ghost justify-center">
                    Cancel
                  </button>
                  <button onClick={handleUpload} disabled={uploading} className="flex-1 btn-gold justify-center">
                    {uploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Portfolio grid */}
      {loading ? (
        <div className="p-16 text-center"><div className="luxury-loader mx-auto" /></div>
      ) : items.length === 0 ? (
        <div
          onClick={() => fileRef.current?.click()}
          className="card-luxury p-16 text-center text-gray-400 border-2 border-dashed border-luxury-border
                     hover:border-gold-500/40 hover:bg-luxury-surface/30 cursor-pointer transition-all"
        >
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-white font-medium mb-1">No photos yet</p>
          <p className="text-sm">Click to upload your first portfolio photo</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {/* Add photo tile */}
          <div
            onClick={() => fileRef.current?.click()}
            className="aspect-square card-luxury border-2 border-dashed border-luxury-border
                       hover:border-gold-500/40 cursor-pointer flex flex-col items-center justify-center gap-2
                       text-gray-500 hover:text-gold-400 transition-all"
          >
            <Plus size={28} />
            <span className="text-xs font-medium">Add Photo</span>
          </div>

          {/* Portfolio items */}
          {items.map(item => (
            <motion.div key={item.id} layout
              className="group relative aspect-square rounded-xl overflow-hidden bg-luxury-surface">
              <Image
                src={item.imageUrl}
                alt={item.caption ?? 'Portfolio photo'}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                              flex flex-col justify-between p-3">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="self-end p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                >
                  <Trash2 size={14} />
                </button>
                <div>
                  {item.serviceType && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-400 mb-1 inline-block">
                      {item.serviceType}
                    </span>
                  )}
                  {item.caption && (
                    <p className="text-xs text-white leading-snug line-clamp-2">{item.caption}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}
