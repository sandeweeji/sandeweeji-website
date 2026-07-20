'use client'
import { motion } from 'framer-motion'
import { Phone, MapPin, Clock, MessageCircle, Share2, ExternalLink } from 'lucide-react'
import { useLocaleStore } from '@/lib/locale-store'
import { t } from '@/lib/i18n'
import { RESTAURANT_SETTINGS } from '@/lib/data'

export default function ContactPage() {
  const { locale } = useLocaleStore()
  const isRtl = locale === 'ar'
  const phone = RESTAURANT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, '')
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Sandweeji! 👋\n\nI'd like to place an order.")}`
  const mapsUrl = `https://maps.google.com/?q=${RESTAURANT_SETTINGS.lat},${RESTAURANT_SETTINGS.lng}`

  const channels = [
    {
      icon: MessageCircle,
      titleEn: 'WhatsApp',
      titleAr: 'واتساب',
      valueEn: RESTAURANT_SETTINGS.whatsappNumber,
      valueAr: RESTAURANT_SETTINGS.whatsappNumber,
      href: waUrl,
      cls: 'hover:border-[#25D366]/40 hover:text-[#25D366] group-hover:text-[#25D366]',
      iconCls: 'text-[#25D366]',
      ctaEn: 'Message us',
      ctaAr: 'راسلنا',
    },
    {
      icon: Phone,
      titleEn: 'Phone',
      titleAr: 'الهاتف',
      valueEn: RESTAURANT_SETTINGS.phone,
      valueAr: RESTAURANT_SETTINGS.phone,
      href: `tel:${RESTAURANT_SETTINGS.phone}`,
      cls: 'hover:border-primary/40',
      iconCls: 'text-primary',
      ctaEn: 'Call us',
      ctaAr: 'اتصل بنا',
    },
    {
      icon: Share2,
      titleEn: 'Instagram',
      titleAr: 'إنستغرام',
      valueEn: '@sandeweeji',
      valueAr: '@sandeweeji',
      href: RESTAURANT_SETTINGS.instagramUrl,
      cls: 'hover:border-pink-500/40',
      iconCls: 'text-pink-400',
      ctaEn: 'Follow us',
      ctaAr: 'تابعنا',
    },
    {
      icon: ExternalLink,
      titleEn: 'Facebook',
      titleAr: 'فيسبوك',
      valueEn: 'Sandweeji',
      valueAr: 'ساندويجي',
      href: RESTAURANT_SETTINGS.facebookUrl,
      cls: 'hover:border-blue-500/40',
      iconCls: 'text-blue-400',
      ctaEn: 'Like us',
      ctaAr: 'أعجبني',
    },
  ]

  return (
    <main className="min-h-screen bg-background" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 60% 40%, oklch(0.75 0.18 52 / 0.12) 0%, transparent 60%)' }} />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 mb-12"
          >
            <p className="text-primary font-semibold tracking-wider uppercase text-sm">
              {t('getInTouch', locale)}
            </p>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground">
              {t('contact', locale)}
            </h1>
          </motion.div>

          {/* Channels grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
            {channels.map(({ icon: Icon, titleEn, titleAr, valueEn, valueAr, href, cls, iconCls, ctaEn, ctaAr }, i) => (
              <motion.a
                key={i}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className={`group bg-card border border-white/5 rounded-2xl p-6 flex items-center gap-5 transition-all ${cls}`}
              >
                <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-6 h-6 ${iconCls}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">
                    {isRtl ? titleAr : titleEn}
                  </p>
                  <p className="text-base font-semibold text-foreground truncate">
                    {isRtl ? valueAr : valueEn}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0">
                  {isRtl ? ctaAr : ctaEn}
                  <ExternalLink className="w-3 h-3" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Map + Hours */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Map embed */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                {t('findUs', locale)}
              </h2>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative h-72 rounded-2xl overflow-hidden bg-surface border border-white/10 hover:border-primary/30 transition-colors group"
              >
                <iframe
                  src={`https://maps.google.com/maps?q=${RESTAURANT_SETTINGS.lat},${RESTAURANT_SETTINGS.lng}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(200deg) brightness(0.7) saturate(0.8)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Sandweeji location"
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <span className="glass text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    {isRtl ? 'افتح في خرائط Google' : 'Open in Google Maps'}
                  </span>
                </div>
              </a>
              <p className="text-sm text-muted-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-primary/60 flex-shrink-0" />
                {isRtl ? RESTAURANT_SETTINGS.addressAr : RESTAURANT_SETTINGS.addressEn}
              </p>
            </motion.div>

            {/* Opening Hours */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h2 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                {t('openingHours', locale)}
              </h2>
              <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
                {RESTAURANT_SETTINGS.openingHours.map((hour, i) => {
                  const day = isRtl ? hour.dayAr : hour.day
                  const isToday = new Date().getDay() === i
                  return (
                    <div
                      key={hour.day}
                      className={`flex items-center justify-between px-5 py-3.5 border-b border-white/5 last:border-0 ${isToday ? 'bg-primary/8' : ''}`}
                    >
                      <span className={`text-sm font-medium ${isToday ? 'text-primary font-semibold' : 'text-foreground/70'}`}>
                        {isToday && <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary mr-2 mb-0.5" />}
                        {day}
                      </span>
                      <span className={`text-sm font-semibold ${hour.closed ? 'text-destructive' : isToday ? 'text-primary' : 'text-foreground'}`}>
                        {hour.closed ? t('closed', locale) : `${hour.openTime} – ${hour.closeTime}`}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  )
}
