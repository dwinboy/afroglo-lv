import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistance, parseISO } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'EUR'): string {
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, fmt)
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistance(d, new Date(), { addSuffix: true })
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function truncate(str: string, length = 100): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}…`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getAvatarColor(name: string): string {
  const colors = [
    'from-gold-400 to-gold-600',
    'from-amber-400 to-orange-600',
    'from-yellow-400 to-amber-600',
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms = 300) {
  let timeout: ReturnType<typeof setTimeout>
  return function (...args: Parameters<T>) {
    clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), ms)
  }
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function generateTimeSlots(
  startHour = 9,
  endHour = 21,
  intervalMinutes = 30,
): string[] {
  const slots: string[] = []
  for (let h = startHour; h < endHour; h++) {
    for (let m = 0; m < 60; m += intervalMinutes) {
      const hour   = h.toString().padStart(2, '0')
      const minute = m.toString().padStart(2, '0')
      slots.push(`${hour}:${minute}`)
    }
  }
  return slots
}

export function getRatingStars(rating: number): string {
  return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))
}

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001/api'
