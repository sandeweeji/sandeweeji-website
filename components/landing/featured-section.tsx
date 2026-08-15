"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Plus } from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { useCartStore } from "@/lib/cart-store";
import { t } from "@/lib/i18n";
import { axiosGet } from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import type { Product } from "@/lib/types";

const BADGE_STYLES: Record<
  string,
  {
    label: string;
    labelAr: string;
    className: string;
  }
> = {
  popular: {
    label: "Popular",
    labelAr: "شعبي",
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },

  new: {
    label: "New",
    labelAr: "جديد",
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },

  spicy: {
    label: "🌶 Spicy",
    labelAr: "🌶 حار",
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },

  meal: {
    label: "Meal",
    labelAr: "وجبة",
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },

  bestseller: {
    label: "Bestseller",
    labelAr: "الأكثر مبيعاً",
    className: "bg-primary/20 text-primary border-primary/30",
  },

  limited: {
    label: "Limited",
    labelAr: "محدود",
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
};

interface ProductsResponse {
  products?: Product[];
}

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 25,
  },

  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.08,
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

function ProductSkeleton() {
  return (
    <div className="bg-card rounded-3xl overflow-hidden border border-white/5 shadow-xl">
      {/* Image */}
      <div className="h-48 sm:h-52 bg-surface animate-pulse" />

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        <div className="h-4 bg-surface rounded animate-pulse w-2/3" />

        <div className="space-y-2">
          <div className="h-3 bg-surface rounded animate-pulse w-full" />
          <div className="h-3 bg-surface rounded animate-pulse w-4/5" />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="h-6 bg-surface rounded animate-pulse w-20" />
          <div className="h-10 bg-surface rounded-xl animate-pulse w-28" />
        </div>
      </div>
    </div>
  );
}

export default function FeaturedSection() {
  const { locale } = useLocaleStore();

  const addItem = useCartStore((state) => state.addItem);

  const [added, setAdded] = useState<string | null>(null);

  const isRtl = locale === "ar";

  /*
   * -------------------------------------------------------
   * Live products from API
   * -------------------------------------------------------
   */

  const {
    data: productsResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["featured-products"],

    queryFn: async () => {
      const response = await axiosGet<Product[] | ProductsResponse>("products");

      if (!response.data) {
        throw new Error(response.message || "Failed to fetch products");
      }

      return response.data;
    },
  });

  /*
   * Normalize API response.
   *
   * Supports both:
   *
   * Product[]
   *
   * and
   *
   * { products: Product[] }
   */

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse?.products ?? []);

  /*
   * Only show:
   *
   * - featured products
   * - available products
   *
   * Maximum 6 products.
   */

  const featured = products
    .filter(
      (product) =>
        product.badges.includes("bestseller") ||
        (product.badges.includes("popular") && product.available),
    )
    .slice(0, 6);

  /*
   * -------------------------------------------------------
   * Add to cart
   * -------------------------------------------------------
   */

  const handleAdd = (product: Product) => {
    addItem({
      productId: product.id,
      nameEn: product.nameEn,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      quantity: 1,
      extras: [],
    });

    setAdded(product.id);

    setTimeout(() => {
      setAdded(null);
    }, 1200);
  };

  /*
   * -------------------------------------------------------
   * Render
   * -------------------------------------------------------
   */

  return (
    <section
      className="
        bg-background
        py-12
        sm:py-16
        lg:py-24
      "
      dir={isRtl ? "rtl" : "ltr"}
    >
      <div
        className="
          max-w-7xl
          mx-auto
          px-4
          sm:px-6
          lg:px-8
        "
      >
        {/* =================================================
            SECTION HEADER
        ================================================= */}

        <div
          className="
            flex
            flex-col
            sm:flex-row
            sm:items-end
            sm:justify-between
            gap-4
            sm:gap-6
            mb-8
            sm:mb-10
            lg:mb-14
          "
        >
          {/* Title */}

          <motion.div
            initial={{
              opacity: 0,
              x: isRtl ? 20 : -20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-80px",
            }}
          >
            <div
              className="
                inline-flex
                items-center
                gap-2
                text-primary
                text-xs
                sm:text-sm
                font-semibold
                mb-2
                sm:mb-3
                tracking-wider
                uppercase
              "
            >
              <Flame className="w-4 h-4" />

              {isRtl ? "الأكثر طلباً" : "Most Ordered"}
            </div>

            <h2
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-extrabold
                text-foreground
                text-balance
                leading-tight
              "
            >
              {isRtl ? "الأصناف المميزة" : "Featured Items"}
            </h2>
          </motion.div>

          {/* View Menu */}

          <motion.div
            initial={{
              opacity: 0,
              x: isRtl ? -20 : 20,
            }}
            whileInView={{
              opacity: 1,
              x: 0,
            }}
            viewport={{
              once: true,
              margin: "-80px",
            }}
          >
            <Link
              href="/menu"
              className="
                inline-flex
                items-center
                gap-2
                text-primary
                font-semibold
                text-sm
                sm:text-base
                hover:gap-3
                transition-all
              "
            >
              {isRtl ? "عرض القائمة الكاملة" : "View Full Menu"}

              <ArrowRight
                className={`
                  w-4
                  h-4
                  ${isRtl ? "rotate-180" : ""}
                `}
              />
            </Link>
          </motion.div>
        </div>

        {/* =================================================
            ERROR STATE
        ================================================= */}

        {isError && (
          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="
              bg-destructive/10
              border
              border-destructive/20
              rounded-2xl
              px-4
              py-5
              sm:px-6
              sm:py-6
              mb-8
            "
          >
            <div
              className="
                flex
                flex-col
                sm:flex-row
                sm:items-center
                sm:justify-between
                gap-4
              "
            >
              <div>
                <p
                  className="
                    text-sm
                    sm:text-base
                    font-semibold
                    text-destructive
                  "
                >
                  {isRtl
                    ? "حدث خطأ أثناء تحميل الأصناف."
                    : "Something went wrong while loading featured items."}
                </p>

                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {isRtl
                    ? "تأكد من الاتصال وحاول مرة أخرى."
                    : "Check your connection and try again."}
                </p>
              </div>

              <button
                onClick={() => refetch()}
                className="
                  w-full
                  sm:w-auto
                  px-4
                  py-2.5
                  rounded-xl
                  bg-destructive
                  text-destructive-foreground
                  text-sm
                  font-semibold
                  hover:bg-destructive/90
                  transition-colors
                "
              >
                {isRtl ? "إعادة المحاولة" : "Try Again"}
              </button>
            </div>
          </motion.div>
        )}

        {/* =================================================
            LOADING STATE
        ================================================= */}

        {isLoading && !isError && (
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-3
              gap-4
              sm:gap-5
              lg:gap-6
            "
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        )}

        {/* =================================================
            EMPTY STATE
        ================================================= */}

        {!isLoading && !isError && featured.length === 0 && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
                flex
                flex-col
                items-center
                justify-center
                text-center
                py-12
                sm:py-16
                lg:py-20
                rounded-3xl
                border
                border-white/5
                bg-card/30
              "
          >
            <span
              className="
                  text-4xl
                  sm:text-5xl
                  mb-4
                "
            >
              🍽️
            </span>

            <h3
              className="
                  text-lg
                  sm:text-xl
                  font-bold
                  text-foreground
                "
            >
              {isRtl
                ? "لا توجد أصناف مميزة حالياً"
                : "No featured items right now"}
            </h3>

            <p
              className="
                  text-sm
                  text-muted-foreground
                  mt-2
                  max-w-md
                  px-4
                "
            >
              {isRtl
                ? "يمكنك تصفح القائمة الكاملة لرؤية جميع الأصناف."
                : "Browse the full menu to see all available items."}
            </p>

            <Link
              href="/menu"
              className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  rounded-xl
                  bg-primary
                  text-primary-foreground
                  text-sm
                  font-bold
                  hover:bg-primary/90
                  transition-colors
                "
            >
              {isRtl ? "عرض القائمة" : "View Menu"}

              <ArrowRight
                className={`
                    w-4
                    h-4
                    ${isRtl ? "rotate-180" : ""}
                  `}
              />
            </Link>
          </motion.div>
        )}

        {/* =================================================
            FEATURED GRID
        ================================================= */}

        {!isLoading && !isError && featured.length > 0 && (
          <div
            className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
                sm:gap-5
                lg:gap-6
              "
          >
            {featured.map((product, index) => {
              const name = locale === "ar" ? product.nameAr : product.nameEn;

              const desc =
                locale === "ar" ? product.descriptionAr : product.descriptionEn;

              const isAdded = added === product.id;

              return (
                <motion.article
                  key={product.id}
                  custom={index}
                  //  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  whileHover={{
                    y: -4,
                  }}
                  className="
                        group
                        relative
                        bg-card
                        rounded-3xl
                        overflow-hidden
                        border
                        border-white/5
                        shadow-xl
                        hover:shadow-2xl
                        hover:border-primary/20
                        transition-all
                        duration-300
                      "
                >
                  {/* =====================================
                          IMAGE
                      ====================================== */}

                  <div
                    className="
                          relative
                          h-48
                          sm:h-52
                          overflow-hidden
                          bg-surface
                        "
                  >
                    <Image
                      src={product.image}
                      alt={name || "Product Image"}
                      fill
                      className="
                            object-cover
                            transition-transform
                            duration-500
                            group-hover:scale-105
                          "
                      sizes="
                            (max-width: 640px) 100vw,
                            (max-width: 1024px) 50vw,
                            33vw
                          "
                    />

                    {/* Image overlay */}

                    <div
                      className="
                            absolute
                            inset-0
                            bg-gradient-to-t
                            from-card/80
                            via-transparent
                            to-transparent
                          "
                    />

                    {/* =================================
                            BADGES
                        ================================== */}

                    {product.badges.length > 0 && (
                      <div
                        className={`
                              absolute
                              top-3
                              ${isRtl ? "right-3" : "left-3"}
                              flex
                              flex-wrap
                              gap-1.5
                              max-w-[70%]
                            `}
                      >
                        {product.badges.slice(0, 2).map((badge) => {
                          const style = BADGE_STYLES[badge];

                          if (!style) {
                            return null;
                          }

                          return (
                            <span
                              key={badge}
                              className={`
                                      inline-flex
                                      items-center
                                      px-2
                                      py-0.5
                                      rounded-full
                                      text-[10px]
                                      sm:text-[11px]
                                      font-semibold
                                      border
                                      ${style.className}
                                    `}
                            >
                              {locale === "ar" ? style.labelAr : style.label}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* =================================
                            CALORIES
                        ================================== */}

                    {product.calories && (
                      <span
                        className="
                              absolute
                              top-3
                              right-3
                              text-[10px]
                              sm:text-[11px]
                              font-medium
                              text-foreground/70
                              bg-black/40
                              backdrop-blur-sm
                              px-2
                              py-0.5
                              rounded-full
                            "
                      >
                        {product.calories} {t("calories", locale)}
                      </span>
                    )}
                  </div>

                  {/* =====================================
                          CONTENT
                      ====================================== */}

                  <div
                    className="
                          p-4
                          sm:p-5
                        "
                  >
                    <h3
                      className="
                            font-bold
                            text-base
                            sm:text-lg
                            text-foreground
                            line-clamp-1
                            mb-1.5
                          "
                    >
                      {name}
                    </h3>

                    <p
                      className="
                            text-sm
                            text-muted-foreground
                            line-clamp-2
                            leading-relaxed
                            mb-4
                            min-h-[2.75rem]
                          "
                    >
                      {desc}
                    </p>

                    {/* Price + Add */}

                    <div
                      className="
                            flex
                            items-center
                            justify-between
                            gap-2
                          "
                    >
                      {/* Price */}

                      <span
                        className="
                              text-lg
                              sm:text-xl
                              font-extrabold
                              text-primary
                              whitespace-nowrap
                            "
                      >
                        {formatPrice(product.price)}
                      </span>

                      {/* Add to cart */}

                      <motion.button
                        whileTap={{
                          scale: 0.9,
                        }}
                        onClick={() => handleAdd(product)}
                        className={`
                              shrink-0
                              inline-flex
                              items-center
                              justify-center
                              gap-1.5
                              px-3
                              sm:px-4
                              py-2.5
                              rounded-xl
                              text-xs
                              sm:text-sm
                              font-bold
                              transition-all

                              ${
                                isAdded
                                  ? `
                                    bg-emerald-500/20
                                    text-emerald-400
                                    border
                                    border-emerald-500/30
                                  `
                                  : `
                                    bg-primary
                                    text-primary-foreground
                                    hover:bg-primary/90
                                    glow-brand-sm
                                  `
                              }
                            `}
                      >
                        {isAdded ? (
                          <>
                            <span>✓</span>

                            <span>{t("added", locale)}</span>
                          </>
                        ) : (
                          <>
                            <Plus
                              className="
                                    w-3.5
                                    h-3.5
                                  "
                            />

                            <span>{t("addToCart", locale)}</span>
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* =====================================
                          BOTTOM GLOW
                      ====================================== */}

                  <div
                    className="
                          absolute
                          bottom-0
                          inset-x-0
                          h-px
                          bg-gradient-to-r
                          from-transparent
                          via-primary/40
                          to-transparent
                          opacity-0
                          group-hover:opacity-100
                          transition-opacity
                        "
                  />
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
