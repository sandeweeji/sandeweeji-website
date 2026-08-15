'use client'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/cart-store'
import { useLocaleStore } from '@/lib/locale-store'
import { t } from '@/lib/i18n'
import { formatPrice } from '@/lib/utils'
import type { Product } from '@/lib/types'

const BADGE_MAP: Record<string, { labelEn: string; labelAr: string; cls: string }> = {
  popular:    { labelEn: 'Popular',     labelAr: 'شعبي',          cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  new:        { labelEn: 'New',         labelAr: 'جديد',          cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  spicy:      { labelEn: '🌶 Spicy',    labelAr: '🌶 حار',        cls: 'bg-red-500/20 text-red-400 border-red-500/30' },
  meal:       { labelEn: 'Meal Deal',   labelAr: 'وجبة',          cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  bestseller: { labelEn: 'Bestseller',  labelAr: 'الأكثر مبيعاً', cls: 'bg-primary/20 text-primary border-primary/30' },
  limited:    { labelEn: 'Limited',     labelAr: 'محدود',         cls: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

interface Props {
  product: Product
  onOpenModal: (product: Product) => void
}

export default function ProductCard({ product, onOpenModal }: Props) {
  const { locale } = useLocaleStore()
  const addItem = useCartStore(s => s.addItem)
  const [justAdded, setJustAdded] = useState(false)
  const [liked, setLiked] = useState(false)
  const isRtl = locale === 'ar'

  // Fall back to Arabic when the English fields haven't been filled in yet
  // (the admin product form currently only edits the Arabic fields).
  const name = locale === 'ar' ? product.nameAr : (product.nameEn ?? product.nameAr)
  const desc = locale === 'ar' ? product.descriptionAr : (product.descriptionEn ?? product.descriptionAr)

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (product.extras && product.extras.length > 0) {
      onOpenModal(product)
      return
    }
    addItem({ productId: product.id, nameEn: product.nameEn ?? product.nameAr, nameAr: product.nameAr, price: product.price, image: product.image, quantity: 1, extras: [] })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1400)
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(v => !v)
  }

  if (!product.available) {
    return (
      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden opacity-50 cursor-not-allowed">
        <div className="relative h-44 bg-surface">
          <Image src={product.image} alt={name} fill className="object-cover grayscale" sizes="300px" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="text-sm font-semibold text-white/70 bg-black/60 px-3 py-1 rounded-full">
              {isRtl ? 'غير متاح' : 'Unavailable'}
            </span>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground/50">{name}</h3>
        </div>
      </div>
    )
  }

  return (
    <motion.article
      layout
      whileHover={{ y: -3 }}
      onClick={() => onOpenModal(product)}
      className="group relative bg-card border border-white/10 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/20 hover:shadow-xl hover:shadow-black/30 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden bg-surface">
        <Image
          src={product.image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent" />

        {/* Like */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleLike}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Favourite"
        >
          <Heart className={`w-4 h-4 transition-colors ${liked ? 'fill-red-400 text-red-400' : 'text-white/60'}`} />
        </motion.button>

        {/* Badges */}
        {product.badges.length > 0 && (
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
            {product.badges.slice(0, 2).map(badge => {
              const b = BADGE_MAP[badge]
              if (!b) return null
              return (
                <span key={badge} className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${b.cls}`}>
                  {locale === 'ar' ? b.labelAr : b.labelEn}
                </span>
              )
            })}
          </div>
        )}

        {/* Calories */}
        {product.calories && (
          <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium text-white/60 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {product.calories} {t('calories', locale)}
          </span>
        )}

        {/* Hover detail hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="glass border border-white/20 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs text-white font-medium">
            <Eye className="w-3.5 h-3.5" />
            {isRtl ? 'عرض التفاصيل' : 'View details'}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-0.5">{name}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{desc}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span className="text-lg font-extrabold text-primary">{formatPrice(product.price)}</span>

          <AnimatePresence mode="wait">
            {justAdded ? (
              <motion.span
                key="added"
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.7, opacity: 0 }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold"
              >
                ✓ {t('added', locale)}
              </motion.span>
            ) : (
              <motion.button
                key="add"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                whileTap={{ scale: 0.85 }}
                onClick={handleQuickAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors glow-brand-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('addToCart', locale)}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.article>
  )
}
