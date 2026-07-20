'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Plus, Star } from 'lucide-react'
import { useLocaleStore } from '@/lib/locale-store'
import { useCartStore } from '@/lib/cart-store'
import { t } from '@/lib/i18n'
import { PRODUCTS, CATEGORIES } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'

const BADGE_STYLES: Record<string, { label: string; labelAr: string; className: string }> = {
  popular:    { label: 'Popular',    labelAr: 'شعبي',          className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  new:        { label: 'New',        labelAr: 'جديد',          className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  spicy:      { label: '🌶 Spicy',   labelAr: '🌶 حار',        className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  meal:       { label: 'Meal',       labelAr: 'وجبة',          className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  bestseller: { label: 'Bestseller', labelAr: 'الأكثر مبيعاً', className: 'bg-primary/20 text-primary border-primary/30' },
  limited:    { label: 'Limited',    labelAr: 'محدود',         className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
}

const featured = PRODUCTS.filter(p => p.featured).slice(0, 6)

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }),
}

export default function FeaturedSection() {
  const { locale } = useLocaleStore()
  const addItem    = useCartStore(s => s.addItem)
  const [added, setAdded] = useState<string | null>(null)
  const isRtl = locale === 'ar'

  const handleAdd = (product: typeof PRODUCTS[0]) => {
    addItem({
      productId: product.id,
      nameEn:    product.nameEn,
      nameAr:    product.nameAr,
      price:     product.price,
      image:     product.image,
      quantity:  1,
      extras:    [],
    })
    setAdded(product.id)
    setTimeout(() => setAdded(null), 1200)
  }

  return (
    <section className="py-24 bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold mb-3 tracking-wider uppercase">
              <Flame className="w-4 h-4" />
              {isRtl ? 'الأكثر طلباً' : 'Most Ordered'}
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground text-balance">
              {isRtl ? 'الأصناف المميزة' : 'Featured Items'}
            </h2>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.03, x: isRtl ? -4 : 4 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
              >
                {isRtl ? 'عرض القائمة الكاملة' : 'View Full Menu'}
                <ArrowRight className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
              </motion.button>
            </Link>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((product, i) => {
            const name = locale === 'ar' ? product.nameAr : product.nameEn
            const desc = locale === 'ar' ? product.descriptionAr : product.descriptionEn
            const isAdded = added === product.id

            return (
              <motion.div
                key={product.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="group relative bg-card rounded-3xl overflow-hidden border border-white/5 shadow-xl hover:shadow-2xl hover:border-primary/20 transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-52 overflow-hidden bg-surface">
                  <Image
                    src={product.image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {product.badges.slice(0, 2).map(badge => {
                      const s = BADGE_STYLES[badge]
                      if (!s) return null
                      return (
                        <span
                          key={badge}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${s.className}`}
                        >
                          {locale === 'ar' ? s.labelAr : s.label}
                        </span>
                      )
                    })}
                  </div>

                  {/* Calories */}
                  {product.calories && (
                    <span className="absolute top-3 right-3 text-[11px] font-medium text-foreground/70 bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      {product.calories} {t('calories', locale)}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-base text-foreground line-clamp-1 mb-1">{name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{desc}</p>

                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xl font-extrabold text-primary">{formatPrice(product.price)}</span>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.88 }}
                      onClick={() => handleAdd(product)}
                      className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        isAdded
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90 glow-brand-sm'
                      }`}
                    >
                      {isAdded ? (
                        <>✓ {t('added', locale)}</>
                      ) : (
                        <><Plus className="w-4 h-4" /> {t('addToCart', locale)}</>
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Bottom glow on hover */}
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
