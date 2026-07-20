/* ================================
   SANDWEEJI — Core Type Definitions
   ================================ */

export type Locale = 'en' | 'ar'

// ----- Menu -----
export type Badge = 'popular' | 'new' | 'spicy' | 'meal' | 'bestseller' | 'limited'

export interface Extra {
  id: string
  nameEn: string
  nameAr: string
  price: number
}

export interface Product {
  id: string
  categoryId: string
  nameEn: string
  nameAr: string
  descriptionEn: string
  descriptionAr: string
  price: number
  image: string
  badges: Badge[]
  available: boolean
  featured: boolean
  calories?: number
  extras?: Extra[]
  order: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  nameEn: string
  nameAr: string
  emoji: string
  order: number
  visible: boolean
}

// ----- Cart -----
export interface CartExtra {
  id: string
  nameEn: string
  nameAr: string
  price: number
}

export interface CartItem {
  id: string            // unique cart entry id
  productId: string
  nameEn: string
  nameAr: string
  price: number
  image: string
  quantity: number
  notes?: string
  extras: CartExtra[]
}

export interface CartState {
  items: CartItem[]
  isOpen: boolean
}

// ----- User / Auth -----
export interface UserProfile {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  phoneNumber?: string
  referralCode: string
  loyaltyPoints: number
  birthday?: string
  language: Locale
  darkMode: boolean
  savedAddresses: Address[]
  favoriteProductIds: string[]
  recentlyViewedIds: string[]
  coupons: string[]
  achievements: Achievement[]
  createdAt: Date
}

export interface Address {
  id: string
  label: string
  value: string
}

export interface Achievement {
  id: string
  title: string
  icon: string
  unlockedAt: Date
}

// ----- Orders -----
export interface WhatsAppOrder {
  id: string
  uid?: string
  items: CartItem[]
  subtotal: number
  notes?: string
  customerName?: string
  customerPhone?: string
  createdAt: Date
}

// ----- Admin -----
export interface AnalyticsData {
  totalOrdersToday: number
  totalRevenueToday: number
  activeVisitors: number
  topProducts: { productId: string; count: number }[]
  topCategories: { categoryId: string; count: number }[]
}

export interface Coupon {
  id: string
  code: string
  discountType: 'percent' | 'fixed'
  discountValue: number
  minOrder?: number
  expiresAt: Date
  usedCount: number
  active: boolean
}

export interface RestaurantSettings {
  nameEn: string
  nameAr: string
  whatsappNumber: string
  instagramUrl: string
  facebookUrl: string
  phone: string
  addressEn: string
  addressAr: string
  lat: number
  lng: number
  openingHours: OpeningHour[]
  heroSlides: HeroSlide[]
  seoTitle: string
  seoDescription: string
}

export interface OpeningHour {
  day: string
  dayAr: string
  openTime: string
  closeTime: string
  closed: boolean
}

export interface HeroSlide {
  id: string
  titleEn: string
  titleAr: string
  subtitleEn: string
  subtitleAr: string
  image: string
  ctaEn: string
  ctaAr: string
}

// ----- Review -----
export interface Review {
  id: string
  uid?: string
  authorName: string
  authorAvatar?: string
  rating: number
  textEn: string
  textAr: string
  date: string
}
