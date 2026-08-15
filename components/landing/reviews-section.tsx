"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { REVIEWS } from "@/lib/data";

export default function ReviewsSection() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";

  const [[page, direction], setPage] = useState([0, 0]);
  const [cardsPerPage, setCardsPerPage] = useState(3);

  // Responsive items per page (1 on mobile, 3 on desktop)
  useEffect(() => {
    const updateCardsPerPage = () => {
      if (window.innerWidth < 768) {
        setCardsPerPage(1);
      } else {
        setCardsPerPage(3);
      }
    };

    updateCardsPerPage();
    window.addEventListener("resize", updateCardsPerPage);
    return () => window.removeEventListener("resize", updateCardsPerPage);
  }, []);

  const totalPages = Math.ceil(REVIEWS.length / cardsPerPage);
  const activePageIndex = ((page % totalPages) + totalPages) % totalPages;

  const paginate = (newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  };

  // Extract visible reviews for the current page
  const currentReviews = Array.from({ length: cardsPerPage }).map((_, i) => {
    const reviewIndex = (activePageIndex * cardsPerPage + i) % REVIEWS.length;
    return REVIEWS[reviewIndex];
  });

  // Animation variants
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (isRtl ? -400 : 400) : isRtl ? 400 : -400,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (dir: number) => ({
      x: dir < 0 ? (isRtl ? -400 : 400) : isRtl ? 400 : -400,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section
      className="py-16 sm:py-24 bg-[oklch(0.08_0.008_45)] overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass border border-primary/20 text-primary text-xs sm:text-sm font-semibold">
            <Star className="w-3.5 h-3.5 fill-primary" />
            {isRtl ? "4.9 من 5" : "4.9 out of 5"}
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground text-balance">
            {t("customerLove", locale)}
          </h2>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-md mx-auto">
            {t("reviewSubtitle", locale)}
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Card Viewport */}
          <div className="relative min-h-[260px] sm:min-h-[240px] w-full overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={page}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: "spring", stiffness: 280, damping: 28 },
                  opacity: { duration: 0.2 },
                }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;
                  if (swipe < -10000 || offset.x < -100) {
                    paginate(isRtl ? -1 : 1);
                  } else if (swipe > 10000 || offset.x > 100) {
                    paginate(isRtl ? 1 : -1);
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full cursor-grab active:cursor-grabbing"
              >
                {currentReviews.map((review, i) => (
                  <ReviewCard
                    key={`${review.id}-${i}`}
                    review={review}
                    locale={locale}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls Bar */}
          <div className="flex items-center justify-between mt-8 px-2">
            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i - activePageIndex;
                    if (diff !== 0) paginate(diff);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === activePageIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-white/20 hover:bg-white/40"
                  }`}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            {/* Previous & Next Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => paginate(-1)}
                className="p-2.5 sm:p-3 rounded-full bg-card/80 backdrop-blur border border-white/10 text-foreground active:scale-90 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-lg"
                aria-label="Previous reviews"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="p-2.5 sm:p-3 rounded-full bg-card/80 backdrop-blur border border-white/10 text-foreground active:scale-90 hover:bg-primary/20 hover:border-primary/40 transition-all shadow-lg"
                aria-label="Next reviews"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 rtl:rotate-180" />
              </button>
            </div>
          </div>
        </div>
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
    <div className="h-full bg-card/80 backdrop-blur border border-white/10 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-xl select-none">
      <div className="space-y-3">
        <Quote className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40" />
        <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed line-clamp-4">
          {text}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-3 border-t border-white/5">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm`}
        >
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
            {review.authorName}
          </p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {[...Array(review.rating)].map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-primary text-primary" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
