'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BarChart3, Package, Tag, Settings, TrendingUp,
  Users, ShoppingBag, DollarSign, Eye, Plus, Edit2,
  Trash2, ToggleLeft, ToggleRight, Search, Bell,
  ChefHat, ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { useLocaleStore } from '@/lib/locale-store'
import { PRODUCTS, CATEGORIES } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import { cn } from '@/lib/utils'
import Image from 'next/image'

type AdminTab = 'analytics' | 'menu' | 'promotions' | 'settings'

/* ---- Mock analytics data ---- */
const ANALYTICS = {
  todayOrders:   47,
  todayRevenue:  823000,
  activeVisitors: 12,
  weekOrders:    312,
  weekRevenue:   5640000,
  growth:        18.5,
  topProducts: [
    { id: 'b1', count: 124, percentage: 82 },
    { id: 's1', count: 98,  percentage: 65 },
    { id: 'c1', count: 87,  percentage: 58 },
    { id: 'm1', count: 76,  percentage: 50 },
    { id: 'sd1', count: 65, percentage: 43 },
  ],
  dailySales: [
    { day: 'Mon', value: 480000 },
    { day: 'Tue', value: 620000 },
    { day: 'Wed', value: 560000 },
    { day: 'Thu', value: 890000 },
    { day: 'Fri', value: 1120000 },
    { day: 'Sat', value: 980000 },
    { day: 'Sun', value: 750000 },
  ],
}

const PROMO_CODES = [
  { code: 'WELCOME10', discountType: 'percent', discountValue: 10, usedCount: 234, active: true,  expiresAt: '2025-03-01' },
  { code: 'FRIES5000', discountType: 'fixed',   discountValue: 5000, usedCount: 89, active: true,  expiresAt: '2025-02-14' },
  { code: 'VIPFREE',   discountType: 'percent', discountValue: 20, usedCount: 12, active: false, expiresAt: '2024-12-31' },
]

const TABS: { id: AdminTab; labelEn: string; icon: React.ElementType }[] = [
  { id: 'analytics',  labelEn: 'Analytics',   icon: BarChart3 },
  { id: 'menu',       labelEn: 'Menu',         icon: Package },
  { id: 'promotions', labelEn: 'Promotions',   icon: Tag },
  { id: 'settings',   labelEn: 'Settings',     icon: Settings },
]

export default function AdminPage() {
  const { locale } = useLocaleStore()
  const isRtl = locale === 'ar'
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics')
  const [productSearch, setProductSearch] = useState('')
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, boolean>>(
    Object.fromEntries(PRODUCTS.map(p => [p.id, p.available]))
  )

  const filteredProducts = PRODUCTS.filter(p =>
    p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.nameAr.includes(productSearch)
  )

  const toggleAvailability = (id: string) => {
    setAvailabilityMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const maxDailySale = Math.max(...ANALYTICS.dailySales.map(d => d.value))

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Admin Header */}
        <div className="flex items-center justify-between mb-8">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">Admin Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">Dashboard</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <button className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">3</span>
            </div>
          </motion.div>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8">
          {TABS.map(tab => {
            const Icon = tab.icon
            return (
              <motion.button
                key={tab.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.labelEn}
              </motion.button>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {/* =========== ANALYTICS =========== */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                {/* KPI row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { icon: ShoppingBag, label: "Today's Orders",  value: ANALYTICS.todayOrders,    growth: '+12%', up: true },
                    { icon: DollarSign,  label: "Today's Revenue", value: formatPrice(ANALYTICS.todayRevenue), growth: '+8%', up: true },
                    { icon: Eye,         label: 'Active Visitors', value: ANALYTICS.activeVisitors,  growth: '-3%', up: false },
                    { icon: TrendingUp,  label: 'Week Growth',     value: `${ANALYTICS.growth}%`,   growth: '+4.2%', up: true },
                  ].map(({ icon: Icon, label, value, growth, up }, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card border border-white/5 rounded-2xl p-5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className={`text-xs font-semibold flex items-center gap-0.5 ${up ? 'text-emerald-400' : 'text-destructive'}`}>
                          {up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {growth}
                        </span>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-foreground">{value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Weekly bar chart */}
                <div className="bg-card border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="font-bold text-foreground">Weekly Sales</h2>
                    <span className="text-sm text-muted-foreground">{formatPrice(ANALYTICS.weekRevenue)} this week</span>
                  </div>
                  <div className="flex items-end gap-3 h-40">
                    {ANALYTICS.dailySales.map(({ day, value }) => {
                      const pct = (value / maxDailySale) * 100
                      const isToday = day === new Date().toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3)
                      return (
                        <div key={day} className="flex-1 flex flex-col items-center gap-2">
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: `${pct}%` }}
                            transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
                            className={cn(
                              'w-full rounded-t-lg min-h-1',
                              isToday ? 'bg-primary glow-brand-sm' : 'bg-surface-elevated hover:bg-primary/40 transition-colors'
                            )}
                            style={{ minHeight: '4px' }}
                          />
                          <span className={`text-[10px] font-medium ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>
                            {day}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Top products */}
                <div className="bg-card border border-white/5 rounded-2xl p-6">
                  <h2 className="font-bold text-foreground mb-5">Top Products</h2>
                  <div className="space-y-4">
                    {ANALYTICS.topProducts.map(({ id, count, percentage }, rank) => {
                      const product = PRODUCTS.find(p => p.id === id)
                      if (!product) return null
                      const name = isRtl ? product.nameAr : product.nameEn
                      return (
                        <div key={id} className="flex items-center gap-4">
                          <span className="text-xs font-bold text-muted-foreground w-4">#{rank + 1}</span>
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                            <Image src={product.image} alt={name} fill className="object-cover" sizes="40px" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                            <div className="mt-1 h-1.5 rounded-full bg-surface-elevated overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ delay: 0.3 + rank * 0.08, duration: 0.5, ease: 'easeOut' }}
                                className="h-full rounded-full bg-primary"
                              />
                            </div>
                          </div>
                          <span className="text-sm font-bold text-foreground flex-shrink-0">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* =========== MENU =========== */}
            {activeTab === 'menu' && (
              <div className="space-y-5">
                {/* Search + Add */}
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="search"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="w-full h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 pl-11 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                    Add Item
                  </button>
                </div>

                {/* Products table */}
                <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white/5">
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Product</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">Category</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Price</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Available</th>
                          <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredProducts.map(product => {
                          const cat = CATEGORIES.find(c => c.id === product.categoryId)
                          const available = availabilityMap[product.id] ?? product.available
                          return (
                            <tr key={product.id} className="hover:bg-white/2 transition-colors group">
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface flex-shrink-0">
                                    <Image src={product.image} alt={product.nameEn} fill className="object-cover" sizes="40px" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{product.nameEn}</p>
                                    <p className="text-xs text-muted-foreground truncate hidden md:block">{product.nameAr}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5 hidden sm:table-cell">
                                <span className="text-sm text-muted-foreground">
                                  {cat ? `${cat.emoji} ${cat.nameEn}` : '—'}
                                </span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="text-sm font-bold text-primary">{formatPrice(product.price)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <button
                                  onClick={() => toggleAvailability(product.id)}
                                  className="transition-colors"
                                  aria-label={available ? 'Mark unavailable' : 'Mark available'}
                                >
                                  {available
                                    ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                                    : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
                                </button>
                              </td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =========== PROMOTIONS =========== */}
            {activeTab === 'promotions' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-foreground">Promo Codes</h2>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                    <Plus className="w-4 h-4" />
                    New Code
                  </button>
                </div>
                <div className="space-y-3">
                  {PROMO_CODES.map((promo, i) => (
                    <motion.div
                      key={promo.code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="bg-card border border-white/5 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                          <Tag className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-mono font-bold text-foreground text-base tracking-wide">{promo.code}</span>
                            <span className={cn(
                              'text-xs font-semibold px-2 py-0.5 rounded-full',
                              promo.active
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : 'bg-muted text-muted-foreground border border-white/10'
                            )}>
                              {promo.active ? 'Active' : 'Expired'}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {promo.discountType === 'percent'
                              ? `${promo.discountValue}% off`
                              : `${formatPrice(promo.discountValue as number)} off`}
                            {' · '}
                            {promo.usedCount} uses
                            {' · '}
                            Expires {promo.expiresAt}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* =========== SETTINGS =========== */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-card border border-white/5 rounded-2xl p-6 space-y-5">
                  <h2 className="font-bold text-foreground">Restaurant Settings</h2>
                  {[
                    { label: 'Restaurant Name (EN)', value: 'Sandweeji', type: 'text' },
                    { label: 'Restaurant Name (AR)', value: 'ساندويجي', type: 'text' },
                    { label: 'WhatsApp Number', value: '+96170206686', type: 'tel' },
                    { label: 'Instagram URL', value: 'https://instagram.com/sandeweeji', type: 'url' },
                  ].map(({ label, value, type }) => (
                    <div key={label} className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</label>
                      <input
                        type={type}
                        defaultValue={value}
                        className="w-full h-11 bg-surface border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  ))}
                  <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors">
                    Save Changes
                  </button>
                </div>

                {/* Opening hours toggle preview */}
                <div className="bg-card border border-white/5 rounded-2xl p-6">
                  <h2 className="font-bold text-foreground mb-4">Opening Hours</h2>
                  <div className="space-y-3">
                    {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map((day, i) => (
                      <div key={day} className="flex items-center justify-between">
                        <span className="text-sm text-foreground">{day}</span>
                        <div className="flex items-center gap-2">
                          <input defaultValue="11:00" type="time" className="text-xs bg-surface border border-white/10 rounded-lg px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary/40" />
                          <span className="text-muted-foreground text-xs">–</span>
                          <input defaultValue={i >= 3 && i <= 5 ? '01:00' : '23:00'} type="time" className="text-xs bg-surface border border-white/10 rounded-lg px-2 py-1 text-muted-foreground focus:outline-none focus:border-primary/40" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  )
}
