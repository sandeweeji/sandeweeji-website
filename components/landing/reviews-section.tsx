"use client";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { REVIEWS } from "@/lib/data";

export default function ReviewsSection() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";

  return (
    <section
      className="py-24 bg-[oklch(0.08_0.008_45)]"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-semibold">
            <Star className="w-3.5 h-3.5 fill-primary" />
            {isRtl ? "4.9 من 5" : "4.9 out of 5"}
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground text-balance">
            {t("customerLove", locale)}
          </h2>
          <p className="text-lg text-muted-foreground">
            {t("reviewSubtitle", locale)}
          </p>
        </motion.div>

        {/* Marquee row 1 */}
        <div className="overflow-hidden">
          <motion.div
            animate={{ x: isRtl ? [0, "50%"] : ["0%", "-50%"] }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="flex gap-6 w-max"
          >
            {[...REVIEWS, ...REVIEWS].map((review, i) => (
              <ReviewCard key={`r1-${i}`} review={review} locale={locale} />
            ))}
          </motion.div>
        </div>

        {/* Marquee row 2 — reversed */}
        <div className="overflow-hidden mt-6">
          <motion.div
            animate={{ x: isRtl ? ["-50%", "0%"] : ["-50%", "0%"] }}
            transition={{ duration: 25, ease: "linear", repeat: Infinity }}
            className="flex gap-6 w-max"
          >
            {[...REVIEWS.slice().reverse(), ...REVIEWS.slice().reverse()].map(
              (review, i) => (
                <ReviewCard key={`r2-${i}`} review={review} locale={locale} />
              ),
            )}
          </motion.div>
        </div>

        {/* Average rating card */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 max-w-sm mx-auto glass border border-white/10 rounded-3xl p-8 text-center"
        >
          <p className="text-7xl font-extrabold text-primary mb-2">4.9</p>
          <div className="flex items-center justify-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-primary text-primary" />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {isRtl ? 'بناءً على أكثر من 2000 تقييم' : 'Based on 2,000+ reviews'}
          </p>
        </motion.div> */}
      </div>
    </section>
  );
}

function ReviewCard({
  review,
  locale,
}: {
  review: (typeof REVIEWS)[0];
  locale: "en" | "ar";
}) {
  const text = locale === "ar" ? review.textAr : review.textEn;
  const initials = review.authorName.slice(0, 2).toUpperCase();
  const avatarColors = [
    "bg-amber-500",
    "bg-orange-500",
    "bg-red-400",
    "bg-yellow-500",
    "bg-emerald-500",
  ];
  const color = avatarColors[review.id.charCodeAt(1) % avatarColors.length];

  return (
    <div className="w-72 flex-shrink-0 bg-card border border-white/5 rounded-2xl p-5 space-y-3">
      <Quote className="w-6 h-6 text-primary/40" />
      <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
        {text}
      </p>
      <div className="flex items-center gap-2.5 pt-1">
        <div
          className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">
            {review.authorName}
          </p>
          <div className="flex items-center gap-0.5">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
