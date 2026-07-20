import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount) + ' LL'
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

export function generateId(): string {
  return Math.random().toString(36).slice(2, 9)
}

export function truncate(str: string, length: number): string {
  return str.length <= length ? str : str.slice(0, length).trimEnd() + '...'
}
