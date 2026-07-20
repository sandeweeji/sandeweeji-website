'use client'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle, Star, Flame, Sparkles } from 'lucide-react'
import { useLocaleStore } from '@/lib/locale-store'
import { t } from '@/lib/i18n'
import { RESTAURANT_SETTINGS } from '@/lib/data'

export default function HeroSection() {
  const { locale } = useLocaleStore()
  const isAr = locale === 'ar'

  const floatingCards = [
    { label: '4.9★', subLabel: isAr ? '+2000 تقييم' : '2k+ reviews', emoji: '⭐', delay: 0, x: '-5%', y: '25%' },
    { label: isAr ? 'طازج يومياً' : 'Fresh Daily', subLabel: isAr ? 'كل المكونات' : 'All ingredients', emoji: '🌿', delay: 0.4, x: '3%', y: '68%' },
    { label: isAr ? '#1 في طرابلس' : '#1 in Tripoli', subLabel: isAr ? 'أفضل برغر' : 'Best Burger', emoji: '🏆', delay: 0.8, x: '72%', y: '15%' },
    { label: isAr ? 'اطلب في 30 ثانية' : 'Order in 30s', subLabel: isAr ? 'عبر واتساب' : 'Via WhatsApp', emoji: '⚡', delay: 0.6, x: '78%', y: '60%' },
  ]
  const isRtl = isAr
  const phone = RESTAURANT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Sandweeji! 👋\n\nI'd like to place an order.")}`

  return (
    <section
      className="relative min-h-screen flex items-center overflow-hidden bg-background"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Background texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 50%, oklch(0.75 0.18 52 / 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, oklch(0.68 0.20 40 / 0.10) 0%, transparent 50%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 lg:pt-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

          {/* Left — Copy */}
          <div className="space-y-8 order-2 lg:order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/25 text-sm font-medium text-primary"
            >
              <Flame className="w-3.5 h-3.5" />
              {t('heroTagline', locale)}
            </motion.div>

            {/* Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-foreground leading-[0.9] tracking-tight text-balance">
                {isRtl ? (
                  <>
                    <span className="text-primary">ذوق</span>
                    <br />
                    الفرق
                  </>
                ) : (
                  <>
                    Taste
                    <br />
                    <span className="text-primary">the Diff</span>
                    <span className="text-foreground">erence</span>
                  </>
                )}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-md"
            >
              {t('heroSubtitle', locale)}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg glow-brand hover:bg-primary/90 transition-all"
                >
                  {t('viewMenu', locale)}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>

              <motion.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/30 text-[#25D366] font-bold text-base hover:bg-[#25D366]/20 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                {t('orderWhatsApp', locale)}
              </motion.a>
            </motion.div>

            {/* Social proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-4"
            >
              <div className="flex -space-x-2">
                {['bg-amber-500', 'bg-orange-500', 'bg-red-500', 'bg-yellow-500'].map((c, i) => (
                  <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-background flex items-center justify-center text-xs font-bold text-white`}>
                    {['A', 'S', 'O', 'L'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {isRtl ? 'أكثر من 2000 زبون سعيد' : '2,000+ happy customers'}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right — Food Image */}
          <div className="relative order-1 lg:order-2 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[520px] aspect-square"
            >
              {/* Glow ring */}
              <div className="absolute inset-8 rounded-full bg-primary/10 blur-3xl" />
              {/* Rotating ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border border-dashed border-primary/20"
              />
              {/* Image */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative z-10 w-full h-full"
              >
                <Image
                  src="/images/hero-sandwich.png"
                  alt="Sandweeji signature sandwich"
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                  sizes="(max-width: 1024px) 80vw, 520px"
                />
              </motion.div>

              {/* Floating Feature Cards */}
              {floatingCards.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + card.delay, type: 'spring', stiffness: 200 }}
                  style={{ left: card.x, top: card.y, position: 'absolute' }}
                  className="glass border border-white/10 rounded-2xl px-3 py-2 flex items-center gap-2 shadow-xl z-20 whitespace-nowrap"
                >
                  <span className="text-xl leading-none">{card.emoji}</span>
                  <div>
                    <p className="text-xs font-bold text-foreground">{card.label}</p>
                    <p className="text-[10px] text-muted-foreground">{card.subLabel}</p>
                  </div>
                </motion.div>
              ))}

              {/* Sparkle accents */}
              <motion.div
                animate={{ rotate: [0, 360], scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute top-[12%] right-[18%] z-30"
              >
                <Sparkles className="w-5 h-5 text-primary/60" />
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-5 h-8 rounded-full border-2 border-white/20 flex items-start justify-center pt-1.5"
        >
          <div className="w-1 h-2 rounded-full bg-primary/60" />
        </motion.div>
      </motion.div>
    </section>
  )
}
