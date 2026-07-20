'use client'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag, MessageCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/lib/cart-store'
import { useLocaleStore } from '@/lib/locale-store'
import { t } from '@/lib/i18n'
import { RESTAURANT_SETTINGS } from '@/lib/data'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/lib/types'

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem } = useCartStore()
  const { locale } = useLocaleStore()
  const name    = locale === 'ar' ? item.nameAr : item.nameEn
  const itemTotal = (item.price + item.extras.reduce((s, e) => s + e.price, 0)) * item.quantity

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40, height: 0 }}
      transition={{ duration: 0.25 }}
      className="flex gap-3 py-4"
    >
      <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface">
        <Image
          src={item.image}
          alt={name}
          fill
          className="object-cover"
          sizes="64px"
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{name}</p>
        {item.extras.length > 0 && (
          <p className="text-xs text-muted-foreground mt-0.5">
            +{item.extras.map(e => locale === 'ar' ? e.nameAr : e.nameEn).join(', ')}
          </p>
        )}
        {item.notes && (
          <p className="text-xs text-primary/70 mt-0.5 italic truncate">📝 {item.notes}</p>
        )}
        <div className="flex items-center justify-between mt-2">
          {/* Qty Controls */}
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              className="w-7 h-7 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors"
              aria-label="Decrease"
            >
              <Minus className="w-3 h-3" />
            </motion.button>
            <span className="text-sm font-semibold w-5 text-center text-foreground">{item.quantity}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              className="w-7 h-7 rounded-lg bg-surface-elevated border border-white/10 flex items-center justify-center text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors"
              aria-label="Increase"
            >
              <Plus className="w-3 h-3" />
            </motion.button>
          </div>
          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{formatPrice(itemTotal)}</span>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => removeItem(item.id)}
              className="p-1 rounded-lg text-destructive/50 hover:text-destructive hover:bg-destructive/10 transition-colors"
              aria-label={t('remove', locale)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CartDrawer() {
  const { items, isOpen, closeCart, clearCart, subtotal } = useCartStore()
  const { locale } = useLocaleStore()
  const isRtl = locale === 'ar'
  const total = subtotal()

  const handleWhatsAppOrder = () => {
    const greeting = t('whatsappGreeting', locale)
    let message = greeting
    items.forEach(item => {
      const name = locale === 'ar' ? item.nameAr : item.nameEn
      message += `\n• ${item.quantity}x ${name}`
      if (item.extras.length > 0) {
        const extraNames = item.extras.map(e => locale === 'ar' ? e.nameAr : e.nameEn).join(', ')
        message += ` (+${extraNames})`
      }
      if (item.notes) {
        message += `\n  _${item.notes}_`
      }
    })
    message += `${t('whatsappTotal', locale)}${formatPrice(total)}`
    message += `${t('whatsappName', locale)}`
    message += `${t('whatsappPhone', locale)}`

    const phone = RESTAURANT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '')
    const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 35 }}
            className={`fixed top-0 bottom-0 z-50 w-full max-w-md flex flex-col glass-strong border-white/5 shadow-2xl ${isRtl ? 'left-0 border-r' : 'right-0 border-l'}`}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">{t('yourCart', locale)}</h2>
                  <p className="text-xs text-muted-foreground">
                    {items.length} {t('cartItems', locale)}
                  </p>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center h-full gap-4 py-16"
                >
                  <div className="w-20 h-20 rounded-2xl bg-surface border border-white/10 flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
                  </div>
                  <div className="text-center">
                    <p className="text-base font-semibold text-foreground">{t('cartEmpty', locale)}</p>
                    <p className="text-sm text-muted-foreground mt-1">{t('cartEmptyDesc', locale)}</p>
                  </div>
                  <Button
                    onClick={closeCart}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                  >
                    {t('browseMenu', locale)}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map(item => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 border-t border-white/10 space-y-4">
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('subtotal', locale)}</span>
                    <span className="text-foreground font-medium">{formatPrice(total)}</span>
                  </div>
                  <Separator className="bg-white/5" />
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-foreground">{t('total', locale)}</span>
                    <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleWhatsAppOrder}
                  className="w-full py-4 rounded-xl bg-[#25D366] text-white font-bold text-base flex items-center justify-center gap-3 shadow-lg hover:bg-[#1ebe5d] transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('sendOrder', locale)}
                </motion.button>

                <button
                  onClick={clearCart}
                  className="w-full text-xs text-muted-foreground hover:text-destructive transition-colors py-1"
                >
                  {isRtl ? 'مسح السلة' : 'Clear cart'}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
