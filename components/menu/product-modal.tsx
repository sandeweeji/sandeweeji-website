'use client'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag, Flame } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useCartStore } from '@/lib/cart-store'
import { useLocaleStore } from '@/lib/locale-store'
import { t } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import type { Product, CartExtra } from '@/lib/types'

const BADGE_MAP: Record<string, { labelEn: string; labelAr: string; cls: string }> = {
  popular:    { labelEn: 'Popular',     labelAr: 'شعبي',          cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  new:        { labelEn: 'New',         labelAr: 'جديد',          cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  spicy:      { labelEn: '🌶 Spicy',    labelAr: '🌶 حار',        cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  meal:       { labelEn: 'Meal Deal',   labelAr: 'وجبة',          cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  bestseller: { labelEn: 'Bestseller',  labelAr: 'الأكثر مبيعاً', cls: 'bg-primary/20 text-primary border-primary/30' },
}

interface Props {
  product: Product | null
  onClose: () => void
}

export default function ProductModal({ product, onClose }: Props) {
  const { locale } = useLocaleStore()
  const addItem = useCartStore(s => s.addItem)
  const [qty, setQty]       = useState(1)
  const [notes, setNotes]   = useState('')
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([])
  const [justAdded, setJustAdded] = useState(false)
  const isRtl = locale === 'ar'

  if (!product) return null

  const name = locale === 'ar' ? product.nameAr : product.nameEn
  const desc = locale === 'ar' ? product.descriptionAr : product.descriptionEn
  const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0)
  const total = (product.price + extrasTotal) * qty

  const toggleExtra = (extra: NonNullable<typeof product.extras>[0]) => {
    setSelectedExtras(prev => {
      const exists = prev.find(e => e.id === extra.id)
      return exists ? prev.filter(e => e.id !== extra.id) : [...prev, { id: extra.id, nameEn: extra.nameEn, nameAr: extra.nameAr, price: extra.price }]
    })
  }

  const handleAdd = () => {
    addItem({ productId: product.id, nameEn: product.nameEn, nameAr: product.nameAr, price: product.price, image: product.image, quantity: qty, notes, extras: selectedExtras })
    setJustAdded(true)
    setTimeout(() => { setJustAdded(false); onClose() }, 900)
  }

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl scrollbar-hide"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Image */}
            <div className="relative h-56 sm:h-64 overflow-hidden rounded-t-3xl sm:rounded-t-3xl bg-surface flex-shrink-0">
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 512px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                {product.badges.map(badge => {
                  const b = BADGE_MAP[badge]
                  if (!b) return null
                  return (
                    <span key={badge} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${b.cls}`}>
                      {locale === 'ar' ? b.labelAr : b.labelEn}
                    </span>
                  )
                })}
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name & price */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-extrabold text-foreground leading-tight">{name}</h2>
                  {product.calories && (
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {product.calories} {t('calories', locale)}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-extrabold text-primary">{formatPrice(product.price)}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>

              {/* Extras */}
              {product.extras && product.extras.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground">{t('extras', locale)}</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {product.extras.map(extra => {
                      const selected = selectedExtras.some(e => e.id === extra.id)
                      const extraName = locale === 'ar' ? extra.nameAr : extra.nameEn
                      return (
                        <motion.button
                          key={extra.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleExtra(extra)}
                          className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                            selected
                              ? 'border-primary/50 bg-primary/10 text-foreground'
                              : 'border-white/10 bg-surface text-muted-foreground hover:border-primary/30'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all ${selected ? 'border-primary bg-primary' : 'border-white/30'}`}>
                              {selected && <span className="text-[8px] text-primary-foreground font-bold">✓</span>}
                            </div>
                            {extraName}
                          </div>
                          <span className={`font-semibold ${selected ? 'text-primary' : ''}`}>
                            +{formatPrice(extra.price)}
                          </span>
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">{t('specialNotes', locale)}</label>
                <Textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder={t('notesPlaceholder', locale)}
                  rows={2}
                  className="bg-surface border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 resize-none rounded-xl text-sm"
                />
              </div>

              {/* Quantity & Add */}
              <div className="flex items-center justify-between gap-4 pt-2">
                {/* Qty */}
                <div className="flex items-center gap-3">
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors">
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <span className="text-lg font-bold text-foreground w-8 text-center">{qty}</span>
                  <motion.button whileTap={{ scale: 0.85 }} onClick={() => setQty(q => q + 1)}
                    className="w-10 h-10 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors">
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Add to cart */}
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAdd}
                  disabled={justAdded}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm transition-all ${
                    justAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-brand'
                  }`}
                >
                  {justAdded ? (
                    <>✓ {t('added', locale)}</>
                  ) : (
                    <><ShoppingBag className="w-4 h-4" /> {t('addToCart', locale)} · {formatPrice(total)}</>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
