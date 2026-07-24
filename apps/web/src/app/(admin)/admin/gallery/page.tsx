'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ImageIcon, Plus, Upload, Pencil, Trash2,
  Eye, EyeOff, Star, X, Save,
} from 'lucide-react'
import { api } from '@/contexts/AuthContext'
import { cn, formatDate } from '@/lib/utils'

type GalleryItem = {
  id: string
  title: string
  caption?: string | null
  imageUrl: string
  category?: string | null
  tags: string[]
  isFeatured: boolean
  isPublished: boolean
  sortOrder: number
  createdAt: string
}

const emptyForm = {
  title: '',
  caption: '',
  imageUrl: '',
  category: '',
  tags: '',
  isFeatured: false,
  isPublished: true,
  sortOrder: 0,
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [editing, setEditing] = useState<GalleryItem | null>(null)
  const [form, setForm] = useState(emptyForm)

  const loadGallery = async () => {
    setLoading(true)
    try {
      const { data } = await api.get<{ data: GalleryItem[] }>('/admin/gallery?limit=100')
      setItems(data.data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadGallery() }, [])

  const startCreate = () => {
    setEditing(null)
    setForm(emptyForm)
  }

  const startEdit = (item: GalleryItem) => {
    setEditing(item)
    setForm({
      title: item.title,
      caption: item.caption ?? '',
      imageUrl: item.imageUrl,
      category: item.category ?? '',
      tags: item.tags.join(', '),
      isFeatured: item.isFeatured,
      isPublished: item.isPublished,
      sortOrder: item.sortOrder,
    })
  }

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    setUploading(true)
    try {
      // Durable DB-backed upload so gallery images show on the live domain.
      const { data } = await api.post<{ url: string }>('/upload/image', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setForm(prev => ({ ...prev, imageUrl: data?.url ?? prev.imageUrl }))
      toast.success('Image uploaded')
    } catch {
      toast.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const save = async () => {
    if (!form.title.trim() || !form.imageUrl.trim()) {
      toast.error('Title and image are required')
      return
    }

    const payload = {
      ...form,
      sortOrder: Number(form.sortOrder) || 0,
      tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
    }

    setSaving(true)
    try {
      if (editing) {
        await api.put(`/admin/gallery/${editing.id}`, payload)
        toast.success('Gallery item updated')
      } else {
        await api.post('/admin/gallery', payload)
        toast.success('Gallery item created')
      }
      setForm(emptyForm)
      setEditing(null)
      await loadGallery()
    } finally {
      setSaving(false)
    }
  }

  const toggle = async (item: GalleryItem, field: 'isPublished' | 'isFeatured') => {
    await api.put(`/admin/gallery/${item.id}`, { [field]: !item[field] })
    setItems(prev => prev.map(row => row.id === item.id ? { ...row, [field]: !item[field] } : row))
  }

  const remove = async (item: GalleryItem) => {
    if (!confirm(`Delete "${item.title}" from the gallery?`)) return
    await api.delete(`/admin/gallery/${item.id}`)
    setItems(prev => prev.filter(row => row.id !== item.id))
    toast.success('Gallery item deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-white">Gallery</h1>
          <p className="text-gray-400 text-sm mt-1">Manage the images shown across Afroglow brand and marketing surfaces</p>
        </div>
        <button onClick={startCreate} className="btn-gold">
          <Plus size={16} /> New Image
        </button>
      </div>

      <div className="grid xl:grid-cols-[380px_1fr] gap-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-luxury p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">{editing ? 'Edit Image' : 'Add Image'}</h2>
            {editing && (
              <button onClick={startCreate} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            )}
          </div>

          <label className="block">
            <span className="text-xs text-gray-400">Image</span>
            <div className="mt-2 aspect-video rounded-lg border border-luxury-border bg-luxury-surface overflow-hidden flex items-center justify-center">
              {form.imageUrl ? (
                <img src={form.imageUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <ImageIcon className="text-gray-600" size={40} />
              )}
            </div>
          </label>

          <label className="btn-outline-gold w-full justify-center cursor-pointer">
            <Upload size={15} /> {uploading ? 'Uploading...' : 'Upload Image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) uploadImage(file)
                e.currentTarget.value = ''
              }}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">Image URL</span>
            <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} className="input-luxury mt-1" placeholder="https://..." />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">Title</span>
            <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-luxury mt-1" placeholder="Braids detail" />
          </label>

          <label className="block">
            <span className="text-xs text-gray-400">Caption</span>
            <textarea value={form.caption} onChange={e => setForm({ ...form, caption: e.target.value })} className="input-luxury mt-1 min-h-[88px]" placeholder="Short optional caption" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-400">Category</span>
              <input value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="input-luxury mt-1" placeholder="Braids" />
            </label>
            <label className="block">
              <span className="text-xs text-gray-400">Order</span>
              <input type="number" value={form.sortOrder} onChange={e => setForm({ ...form, sortOrder: Number(e.target.value) })} className="input-luxury mt-1" />
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-gray-400">Tags</span>
            <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} className="input-luxury mt-1" placeholder="braids, detail, studio" />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => setForm({ ...form, isPublished: !form.isPublished })} className={cn('py-2.5 rounded-xl border text-sm flex items-center justify-center gap-2', form.isPublished ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-luxury-border text-gray-400')}>
              {form.isPublished ? <Eye size={15} /> : <EyeOff size={15} />} Published
            </button>
            <button onClick={() => setForm({ ...form, isFeatured: !form.isFeatured })} className={cn('py-2.5 rounded-xl border text-sm flex items-center justify-center gap-2', form.isFeatured ? 'border-gold-500/30 text-gold-400 bg-gold-500/10' : 'border-luxury-border text-gray-400')}>
              <Star size={15} /> Featured
            </button>
          </div>

          <button onClick={save} disabled={saving || uploading} className="btn-gold w-full justify-center disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Image'}
          </button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-luxury">
          <div className="p-5 border-b border-luxury-border flex items-center justify-between">
            <h2 className="font-semibold text-white">Gallery Library</h2>
            <span className="text-xs text-gray-400">{items.length} images</span>
          </div>

          {loading ? (
            <div className="py-20 flex items-center justify-center"><div className="luxury-loader" /></div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center text-gray-500">No gallery images yet</div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
              {items.map(item => (
                <div key={item.id} className="rounded-lg border border-luxury-border bg-luxury-surface overflow-hidden">
                  <div className="aspect-[4/3] bg-luxury-black">
                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                        {item.isFeatured && <Star size={14} className="text-gold-400 fill-gold-400 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{item.category || 'Uncategorized'} - {formatDate(item.createdAt)}</p>
                    </div>
                    {item.caption && <p className="text-xs text-gray-400 line-clamp-2">{item.caption}</p>}
                    <div className="flex items-center justify-between gap-2">
                      <button onClick={() => toggle(item, 'isPublished')} className={cn('text-xs px-2.5 py-1 rounded-full border', item.isPublished ? 'border-green-500/30 text-green-400 bg-green-500/10' : 'border-gray-600 text-gray-400')}>
                        {item.isPublished ? 'Published' : 'Draft'}
                      </button>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggle(item, 'isFeatured')} className="w-8 h-8 rounded-lg text-gray-400 hover:text-gold-400 hover:bg-luxury-charcoal flex items-center justify-center">
                          <Star size={15} />
                        </button>
                        <button onClick={() => startEdit(item)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-luxury-charcoal flex items-center justify-center">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => remove(item)} className="w-8 h-8 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
