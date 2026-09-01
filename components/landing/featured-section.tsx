"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLocaleStore } from "@/lib/locale-store";
import { axiosGet } from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/lib/types";
import ProductCard from "@/components/menu/product-card";
import ProductModal from "@/components/menu/product-modal";

interface ProductsResponse {
  products?: Product[];
}

/* ============================================================
   PRODUCT SKELETON
   ============================================================ */

function ProductSkeleton() {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        bg-card
        shadow-xl
        border
        border-white/5
      "
      aria-hidden="true"
    >
      {/* Image */}
      <div className="h-44 bg-surface animate-pulse" />

      {/* Content */}
      <div className="space-y-4 p-4">
        {/* Product name */}
        <div className="h-5 w-2/3 rounded-md bg-surface animate-pulse" />

        {/* Description */}
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-surface animate-pulse" />
          <div className="h-3 w-4/5 rounded bg-surface animate-pulse" />
        </div>

        {/* Price + button */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <div className="h-6 w-20 rounded-md bg-surface animate-pulse" />
          <div className="h-9 w-28 rounded-xl bg-surface animate-pulse" />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   FEATURED SECTION
   ============================================================ */

export default function FeaturedSection() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* ============================================================
     QUERY
     ============================================================ */

  const {
    data: productsResponse,
    isPending,
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

  /* ============================================================
     PRODUCTS
     ============================================================ */

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse?.products ?? []);

  const featured = products.filter((product) =>
    product.badges.includes("featured"),
  );

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <>
      <section
        dir={isRtl ? "rtl" : "ltr"}
        className="
          bg-[#050505]
          text-white
        "
      >
        <div
          className="
            mx-auto
            max-w-7xl
            px-4
            sm:px-6
            sm:py-20
            lg:px-8
          "
        >
          {/* =====================================================
              HEADER
          ===================================================== */}

          <div
            className="
              mb-10
              flex
              flex-col
              gap-5
              sm:mb-12
              sm:flex-row
              sm:items-end
              sm:justify-between
              lg:mb-14
            "
          >
            {/* Heading */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: "-80px",
              }}
              transition={{
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <h2
                className="
                  text-3xl
                  font-black
                  leading-tight
                  tracking-tight
                  text-white
                  sm:text-4xl
                  lg:text-5xl
                "
              >
                {isRtl ? "الأصناف المميزة" : "Featured Items"}
              </h2>

              <p
                className="
                  mt-3
                  max-w-xl
                  text-sm
                  leading-relaxed
                  text-white/50
                  sm:text-base
                "
              >
                {isRtl
                  ? "مجموعة من الأصناف التي اخترناها لك بعناية."
                  : "A selection of our favorites, chosen especially for you."}
              </p>
            </motion.div>

            {/* View Full Menu */}

            <motion.div
              initial={{
                opacity: 0,
                y: 20,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                margin: "-80px",
              }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <Link
                href="/menu"
                className="
                  group
                  inline-flex
                  w-fit
                  items-center
                  gap-2
                  rounded-xl
                  bg-white/10
                  px-4
                  py-2.5
                  text-sm
                  font-bold
                  text-white
                  transition-all
                  duration-200
                  hover:bg-white/15
                  sm:text-base
                "
              >
                {isRtl ? "عرض القائمة الكاملة" : "View Full Menu"}

                <ArrowRight
                  className={`
                    h-4
                    w-4
                    transition-transform
                    duration-200
                    ${
                      isRtl
                        ? "rotate-180 group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }
                  `}
                />
              </Link>
            </motion.div>
          </div>

          {/* =====================================================
              ERROR
          ===================================================== */}

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
                mb-8
                rounded-2xl
                bg-white/[0.04]
                px-5
                py-5
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div>
                  <p
                    className="
                      text-sm
                      font-bold
                      text-red-400
                      sm:text-base
                    "
                  >
                    {isRtl
                      ? "حدث خطأ أثناء تحميل الأصناف."
                      : "Something went wrong while loading featured items."}
                  </p>

                  <p
                    className="
                      mt-1
                      text-xs
                      text-white/40
                      sm:text-sm
                    "
                  >
                    {isRtl
                      ? "تأكد من الاتصال وحاول مرة أخرى."
                      : "Check your connection and try again."}
                  </p>
                </div>

                <button
                  onClick={() => refetch()}
                  className="
                    w-full
                    rounded-xl
                    bg-primary
                    px-4
                    py-2.5
                    text-sm
                    font-bold
                    text-primary-foreground
                    transition-colors
                    hover:bg-primary/90
                    sm:w-auto
                  "
                >
                  {isRtl ? "إعادة المحاولة" : "Try Again"}
                </button>
              </div>
            </motion.div>
          )}

          {/* =====================================================
              LOADING SKELETON
          ===================================================== */}

          {isPending && !isError && (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                lg:gap-6
              "
            >
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </div>
          )}

          {/* =====================================================
              EMPTY STATE
          ===================================================== */}

          {!isPending && !isError && featured.length === 0 && (
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
                rounded-3xl
                bg-white/[0.03]
                px-5
                py-16
                text-center
                sm:py-20
              "
            >
              <span className="mb-4 text-5xl">🍽️</span>

              <h3
                className="
                  text-lg
                  font-bold
                  text-white
                  sm:text-xl
                "
              >
                {isRtl
                  ? "لا توجد أصناف مميزة حالياً"
                  : "No featured items right now"}
              </h3>

              <p
                className="
                  mt-2
                  max-w-md
                  text-sm
                  leading-relaxed
                  text-white/45
                "
              >
                {isRtl
                  ? "يمكنك تصفح القائمة الكاملة لرؤية جميع الأصناف."
                  : "Browse the full menu to see all available items."}
              </p>

              <Link
                href="/menu"
                className="
                  mt-6
                  inline-flex
                  items-center
                  gap-2
                  rounded-xl
                  bg-primary
                  px-5
                  py-3
                  text-sm
                  font-bold
                  text-primary-foreground
                  transition-colors
                  hover:bg-primary/90
                "
              >
                {isRtl ? "عرض القائمة" : "View Menu"}

                <ArrowRight
                  className={`
                    h-4
                    w-4
                    ${isRtl ? "rotate-180" : ""}
                  `}
                />
              </Link>
            </motion.div>
          )}

          {/* =====================================================
              FEATURED PRODUCTS
          ===================================================== */}

          {!isPending && !isError && featured.length > 0 && (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
                lg:grid-cols-3
                lg:gap-6
              "
            >
              {featured.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{
                    opacity: 0,
                    y: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                    margin: "-60px",
                  }}
                  transition={{
                    delay: index * 0.07,
                    duration: 0.45,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <ProductCard
                    product={product}
                    onOpenModal={setSelectedProduct}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================================
          PRODUCT MODAL
      ========================================================== */}

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </>
  );
}
