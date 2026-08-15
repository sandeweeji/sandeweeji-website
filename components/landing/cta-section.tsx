"use client";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight, Clock, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import whatsapp from "@/public/whatsapp.png";
import Image from "next/image";

const stats = [
  {
    valueEn: "5+",
    valueAr: "+5",
    labelEn: "Years of flavor",
    labelAr: "سنوات من الطعم",
  },
  {
    valueEn: "20k+",
    valueAr: "+20k",
    labelEn: "Orders delivered",
    labelAr: "طلب تم توصيله",
  },
  {
    valueEn: "4.9★",
    valueAr: "★4.9",
    labelEn: "Average rating",
    labelAr: "متوسط التقييم",
  },
  {
    valueEn: "<30s",
    valueAr: "<30ث",
    labelEn: "Order via WhatsApp",
    labelAr: "اطلب عبر واتساب",
  },
];

export default function CtaSection() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";
  const phone = RESTAURANT_SETTINGS.whatsappNumber.replace(/[^0-9]/g, "");
  const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent("Hello Sandweeji! 👋\n\nI'd like to place an order.")}`;

  return (
    <section className="py-24 bg-background" dir={isRtl ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-white/5 rounded-2xl p-6 text-center hover:border-primary/20 transition-colors"
            >
              <p className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">
                {isRtl ? stat.valueAr : stat.valueEn}
              </p>
              <p className="text-sm text-muted-foreground">
                {isRtl ? stat.labelAr : stat.labelEn}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Big CTA banner */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-card border border-white/5 p-10 lg:p-16"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 70% 50%, oklch(0.75 0.18 52 / 0.12) 0%, transparent 60%)",
          }}
        >
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center lg:text-start">
              <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground text-balance">
                {isRtl ? (
                  <>
                    جاهز للطلب؟
                    <br />
                    <span className="text-primary">نحن جاهزون لك</span>
                  </>
                ) : (
                  <>
                    Ready to order?
                    <br />
                    <span className="text-primary">
                      We&apos;re ready for you
                    </span>
                  </>
                )}
              </h2>
              <p className="text-muted-foreground text-lg max-w-md">
                {isRtl
                  ? "اطلب عبر واتساب في أقل من 30 ثانية وتذوق الفرق"
                  : "Order in under 30 seconds on WhatsApp and taste the difference"}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
              <Link href="/menu">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-card border border-white/10 text-foreground font-bold text-base hover:border-primary/30 transition-all"
                >
                  {t("viewMenu", locale)}
                  <ArrowRight
                    className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`}
                  />
                </motion.button>
              </Link>
              <motion.a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base glow-brand hover:bg-primary/90 transition-all"
              >
                <Image src={whatsapp} alt="WhatsApp" className="w-5 h-5" />
                {t("orderWhatsApp", locale)}
              </motion.a>
            </div>
          </div>
        </motion.div>

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Clock,
              titleEn: "Opening Hours",
              titleAr: "أوقات العمل",
              bodyEn: "Mon–Wed 11am–11pm\nThu–Sat 11am–1am\nSun 12pm–11pm",
              bodyAr: "إثنين–أربعاء 11ص–11م\nخميس–سبت 11ص–1ص\nأحد 12ظ–11م",
            },
            {
              icon: MapPin,
              titleEn: "Location",
              titleAr: "الموقع",
              bodyEn: "Abi Samra, Tripoli\nNorth Lebanon",
              bodyAr: "أبي سمرا، طرابلس\nشمال لبنان",
            },
            {
              icon: Phone,
              titleEn: "Contact Us",
              titleAr: "اتصل بنا",
              bodyEn: "+961 70 206 686\nWhatsApp / Call",
              bodyAr: "+961 70 206 686\nواتساب / اتصال",
            },
          ].map(({ icon: Icon, titleEn, titleAr, bodyEn, bodyAr }, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-white/5 rounded-2xl p-6 space-y-3 hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-foreground">
                {isRtl ? titleAr : titleEn}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {isRtl ? bodyAr : bodyEn}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
