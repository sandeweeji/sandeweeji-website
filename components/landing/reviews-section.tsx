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

  // Responsive cards per page
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

  const activePageIndex =
    totalPages > 0 ? ((page % totalPages) + totalPages) % totalPages : 0;

  const paginate = (newDirection: number) => {
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  };

  const currentReviews = Array.from({ length: cardsPerPage }).map((_, i) => {
    const reviewIndex = (activePageIndex * cardsPerPage + i) % REVIEWS.length;

    return REVIEWS[reviewIndex];
  });

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? (isRtl ? -300 : 300) : isRtl ? 300 : -300,
      opacity: 0,
      scale: 0.98,
    }),

    center: {
      x: 0,
      opacity: 1,
      scale: 1,
    },

    exit: (dir: number) => ({
      x: dir < 0 ? (isRtl ? -300 : 300) : isRtl ? 300 : -300,
      opacity: 0,
      scale: 0.98,
    }),
  };

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="
        w-full
        overflow-hidden
        bg-[oklch(0.08_0.008_45)]
        pt-16
        pb-14
        sm:pt-20
        sm:pb-16
        lg:pt-0
        lg:pb-20
      "
    >
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="
            mx-auto
            mb-8
            max-w-3xl
            text-center
            sm:mb-12
            lg:mb-14
          "
        >
          <h2
            className="
              text-balance
              text-3xl
              font-extrabold
              leading-tight
              tracking-tight
              text-foreground
              sm:text-4xl
              md:text-5xl
            "
          >
            {t("customerLove", locale)}
          </h2>
        </motion.div>

        {/* Carousel */}
        <div className="relative mx-auto w-full max-w-6xl">
          {/* Card viewport */}
          <div
            className="
              relative
              min-h-[245px]
              w-full
              overflow-hidden
              sm:min-h-[230px]
              md:min-h-[250px]
            "
          >
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
                  x: {
                    type: "spring",
                    stiffness: 280,
                    damping: 28,
                  },
                  opacity: {
                    duration: 0.2,
                  },
                }}
                drag="x"
                dragConstraints={{
                  left: 0,
                  right: 0,
                }}
                dragElastic={0.8}
                onDragEnd={(_, { offset, velocity }) => {
                  const swipe = Math.abs(offset.x) * velocity.x;

                  if (swipe < -10000 || offset.x < -80) {
                    paginate(isRtl ? -1 : 1);
                  } else if (swipe > 10000 || offset.x > 80) {
                    paginate(isRtl ? 1 : -1);
                  }
                }}
                className="
                  grid
                  w-full
                  grid-cols-1
                  gap-4
                  sm:gap-5
                  md:grid-cols-3
                  md:gap-6
                  cursor-grab
                  active:cursor-grabbing
                "
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

          {/* Navigation */}
          <div
            className="
              mt-6
              flex
              flex-col
              gap-5
              px-1
              sm:mt-8
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-2
            "
          >
            {/* Pagination dots */}
            <div
              className="
                flex
                min-h-5
                items-center
                justify-center
                gap-1.5
                sm:justify-start
              "
            >
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const diff = i - activePageIndex;

                    if (diff !== 0) {
                      paginate(diff);
                    }
                  }}
                  className={`
                    h-2
                    rounded-full
                    transition-all
                    duration-300
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                    focus-visible:ring-offset-2
                    focus-visible:ring-offset-[oklch(0.08_0.008_45)]
                    ${
                      i === activePageIndex
                        ? "w-7 bg-primary"
                        : "w-2 bg-white/20 hover:bg-white/40"
                    }
                  `}
                  aria-label={`Go to page ${i + 1}`}
                  aria-current={i === activePageIndex ? "true" : undefined}
                />
              ))}
            </div>

            {/* Previous / Next */}
            <div className="flex items-center justify-center gap-3 sm:justify-end">
              <button
                onClick={() => paginate(-1)}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-card/80
                  text-foreground
                  shadow-lg
                  backdrop-blur
                  transition-all
                  duration-200
                  hover:border-primary/40
                  hover:bg-primary/20
                  active:scale-90
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary
                "
                aria-label="Previous reviews"
              >
                <ChevronLeft
                  className="
                    h-5
                    w-5
                    rtl:rotate-180
                  "
                />
              </button>

              <button
                onClick={() => paginate(1)}
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-white/10
                  bg-card/80
                  text-foreground
                  shadow-lg
                  backdrop-blur
                  transition-all
                  duration-200
                  hover:border-primary/40
                  hover:bg-primary/20
                  active:scale-90
                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-primary
                "
                aria-label="Next reviews"
              >
                <ChevronRight
                  className="
                    h-5
                    w-5
                    rtl:rotate-180
                  "
                />
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
    <motion.div
      className="
        flex
        h-full
        min-h-[225px]
        flex-col
        justify-between
        rounded-2xl
        border
        border-white/10
        bg-card/80
        p-5
        shadow-xl
        backdrop-blur
        select-none
        sm:min-h-[215px]
        sm:p-6
        md:min-h-[235px]
      "
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      {/* Review content */}
      <div className="space-y-3">
        <Quote
          className="
            h-5
            w-5
            text-primary/40
            sm:h-6
            sm:w-6
          "
        />

        <p
          className="
            text-sm
            leading-relaxed
            text-foreground/90
            sm:text-sm
            md:text-base
            line-clamp-4
          "
        >
          {text}
        </p>
      </div>

      {/* Author */}
      <div
        className="
          mt-5
          flex
          min-w-0
          items-center
          gap-3
          border-t
          border-white/5
          pt-4
        "
      >
        {/* Avatar */}
        <div
          className={`
            flex
            h-9
            w-9
            flex-shrink-0
            items-center
            justify-center
            rounded-full
            ${color}
            text-xs
            font-bold
            text-white
            shadow-sm
            sm:h-10
            sm:w-10
          `}
        >
          {initials}
        </div>

        {/* Name + rating */}
        <div className="min-w-0 flex-1">
          <p
            className="
              truncate
              text-sm
              font-semibold
              text-foreground
              sm:text-sm
            "
          >
            {review.authorName}
          </p>

          <div className="mt-1 flex items-center gap-0.5">
            {[...Array(review.rating)].map((_, i) => (
              <Star
                key={i}
                className="
                  h-3
                  w-3
                  fill-primary
                  text-primary
                  sm:h-3.5
                  sm:w-3.5
                "
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
