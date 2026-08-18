"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, Flame, Ban, ShoppingCart } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import type { Product, CartExtra } from "@/lib/types";
import { BADGE_MAP } from "@/lib/data";

interface Props {
  product: Product | null;
  onClose: () => void;
}

interface ProductModalContentProps {
  product: Product;
  locale: "ar";
  onClose: () => void;
}

function ProductModalContent({
  product,
  locale,
  onClose,
}: ProductModalContentProps) {
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  const isRtl = locale === "ar";

  /*
   * Lock the page behind the modal.
   *
   * This is important on mobile because overflow-y-auto on the modal
   * alone does NOT reliably prevent the body from scrolling.
   */
  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverscrollBehavior = html.style.overscrollBehavior;

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      html.style.overscrollBehavior = previousHtmlOverscrollBehavior;
    };
  }, []);

  /*
   * Reset modal state when the product changes.
   */
  useEffect(() => {
    setQty(1);
    setNotes("");
    setSelectedExtras([]);
    setJustAdded(false);
  }, [product.id]);

  const addOns = useMemo(
    () => product.extras?.filter((extra) => extra.type === "ADD") ?? [],
    [product.extras],
  );

  const removables = useMemo(
    () => product.extras?.filter((extra) => extra.type === "REMOVE") ?? [],
    [product.extras],
  );

  const name =
    locale === "ar" ? product.nameAr : (product.nameEn ?? product.nameAr);

  const desc =
    locale === "ar"
      ? product.descriptionAr
      : (product.descriptionEn ?? product.descriptionAr);

  const extrasTotal = selectedExtras.reduce(
    (sum, extra) => sum + extra.price,
    0,
  );

  const total = (product.price + extrasTotal) * qty;

  const toggleExtra = (extra: NonNullable<Product["extras"]>[number]) => {
    setSelectedExtras((previous) => {
      const exists = previous.some((item) => item.id === extra.id);

      if (exists) {
        return previous.filter((item) => item.id !== extra.id);
      }

      return [
        ...previous,
        {
          id: extra.id,
          type: extra.type,
          nameEn: extra.nameEn,
          nameAr: extra.nameAr,
          price: extra.price,
        },
      ];
    });
  };

  const handleAdd = () => {
    addItem({
      productId: product.id,
      nameEn: product.nameEn ?? product.nameAr,
      nameAr: product.nameAr,
      price: product.price,
      image: product.image,
      quantity: qty,
      notes: notes.trim(),
      extras: selectedExtras,
    });

    setJustAdded(true);

    setTimeout(() => {
      setJustAdded(false);

      setQty(1);
      setNotes("");
      setSelectedExtras([]);

      onClose();
    }, 700);
  };

  return (
    <>
      {/* =========================================================
          BACKDROP
          ========================================================= */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="
          fixed
          inset-0
          z-40

          bg-black/75
          backdrop-blur-sm

          touch-none
        "
        aria-hidden="true"
      />

      {/* =========================================================
          MODAL
          ========================================================= */}
      <motion.div
        initial={{
          opacity: 0,
          y: 50,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        exit={{
          opacity: 0,
          y: 50,
        }}
        transition={{
          type: "spring",
          stiffness: 320,
          damping: 32,
        }}
        className="
          fixed
          z-50

          inset-x-0
          bottom-0

          w-full
          max-h-[92dvh]

          flex
          flex-col

          bg-card

          border
          border-white/10

          rounded-t-3xl

          shadow-2xl

          overflow-hidden

          overscroll-contain

          sm:inset-x-auto
          sm:bottom-auto
          sm:top-1/2
          sm:left-1/2

          sm:-translate-x-1/2
          sm:-translate-y-1/2

          sm:w-[calc(100%-2rem)]
          sm:max-w-lg

          sm:max-h-[90dvh]

          sm:rounded-3xl
        "
        dir={isRtl ? "rtl" : "ltr"}
        role="dialog"
        aria-modal="true"
        aria-label={name}
      >
        {/* =======================================================
            PRODUCT IMAGE / HEADER
            ======================================================= */}
        <div
          className="
            relative
            h-48
            sm:h-64

            shrink-0

            overflow-hidden

            rounded-t-3xl

            bg-surface
          "
        >
          <Image
            src={product.image}
            alt={name}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 512px"
          />

          {/* Image gradient */}
          <div
            className="
              absolute
              inset-0

              bg-gradient-to-t
              from-card/90
              via-transparent
              to-transparent
            "
          />

          {/* =====================================================
              BADGES
              ===================================================== */}
          <div
            className={`
              absolute
              top-4

              ${isRtl ? "right-4" : "left-4"}

              flex
              flex-wrap
              gap-1.5

              max-w-[70%]
            `}
          >
            {product.badges.map((badge) => {
              const badgeData = BADGE_MAP[badge];

              if (!badgeData) {
                return null;
              }

              return (
                <span
                  key={badge}
                  className={`
                    px-2.5
                    py-1

                    rounded-full

                    text-xs
                    font-semibold

                    border

                    ${badgeData.cls}
                  `}
                >
                  {locale === "ar" ? badgeData.labelAr : badgeData.labelEn}
                </span>
              );
            })}
          </div>

          {/* =====================================================
              CLOSE BUTTON
              ===================================================== */}
          <button
            type="button"
            onClick={onClose}
            className={`
              absolute
              top-4

              ${isRtl ? "left-4" : "right-4"}

              w-9
              h-9

              rounded-full

              bg-black/50
              backdrop-blur-sm

              border
              border-white/10

              flex
              items-center
              justify-center

              text-white/80

              hover:text-white
              hover:bg-black/70

              active:scale-95

              transition-all

              z-10
            `}
            aria-label={locale === "ar" ? "إغلاق" : "Close"}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =======================================================
            SCROLLABLE CONTENT
            ======================================================= */}
        <div
          className="
            flex-1
            min-h-0

            overflow-y-auto

            overscroll-contain

            touch-pan-y

            scrollbar-hide

            p-5
            sm:p-6

            space-y-6
          "
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {/* =====================================================
              NAME + PRICE
              ===================================================== */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h2
                className="
                  text-xl
                  sm:text-2xl

                  font-extrabold

                  text-foreground

                  leading-tight

                  break-words
                "
              >
                {name}
              </h2>

              {product.calories && (
                <p
                  className="
                    text-xs
                    text-muted-foreground

                    mt-1.5

                    flex
                    items-center
                    gap-1
                  "
                >
                  <Flame className="w-3 h-3 shrink-0" />
                  {product.calories} {t("calories", locale)}
                </p>
              )}
            </div>

            <p
              className="
                text-xl
                sm:text-2xl

                font-extrabold

                text-primary

                whitespace-nowrap
              "
            >
              {formatPrice(product.price)}
            </p>
          </div>

          {/* =====================================================
              DESCRIPTION
              ===================================================== */}
          {desc && (
            <p
              className="
                text-sm

                text-muted-foreground

                leading-relaxed
              "
            >
              {desc}
            </p>
          )}

          {/* =====================================================
              PAID EXTRAS
              ===================================================== */}
          {addOns.length > 0 && (
            <div className="space-y-3">
              <h3
                className="
                  text-sm
                  font-bold
                  text-foreground
                "
              >
                {t("extras", locale)}
              </h3>

              <div className="grid gap-2">
                {addOns.map((extra) => {
                  const selected = selectedExtras.some(
                    (item) => item.id === extra.id,
                  );

                  const extraName =
                    locale === "ar"
                      ? extra.nameAr
                      : (extra.nameEn ?? extra.nameAr);

                  return (
                    <motion.button
                      key={extra.id}
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={() => toggleExtra(extra)}
                      className={`
                        w-full

                        flex
                        items-center
                        justify-between

                        gap-3

                        px-4
                        py-3

                        rounded-xl

                        border

                        text-sm

                        transition-all

                        ${
                          selected
                            ? `
                              border-primary/50
                              bg-primary/10
                              text-foreground
                            `
                            : `
                              border-white/10
                              bg-surface
                              text-muted-foreground

                              hover:border-primary/30
                            `
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2

                          min-w-0
                        "
                      >
                        <div
                          className={`
                            w-4
                            h-4

                            rounded-sm

                            border-2

                            flex
                            items-center
                            justify-center

                            shrink-0

                            ${
                              selected
                                ? `
                                  border-primary
                                  bg-primary
                                `
                                : `
                                  border-white/30
                                `
                            }
                          `}
                        >
                          {selected && (
                            <span
                              className="
                                text-[8px]
                                text-primary-foreground
                                font-bold
                              "
                            >
                              ✓
                            </span>
                          )}
                        </div>

                        <span className="truncate">{extraName}</span>
                      </div>

                      <span
                        className={`
                          font-semibold
                          whitespace-nowrap

                          ${selected ? "text-primary" : ""}
                        `}
                      >
                        +{formatPrice(extra.price)}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              REMOVABLE INGREDIENTS
              ===================================================== */}
          {removables.length > 0 && (
            <div className="space-y-3">
              <h3
                className="
                  text-sm
                  font-bold
                  text-foreground
                "
              >
                {isRtl ? "إزالة مكونات" : "Remove ingredients"}
              </h3>

              <div className="flex flex-wrap gap-2">
                {removables.map((extra) => {
                  const selected = selectedExtras.some(
                    (item) => item.id === extra.id,
                  );

                  const extraName =
                    locale === "ar"
                      ? extra.nameAr
                      : (extra.nameEn ?? extra.nameAr);

                  return (
                    <motion.button
                      key={extra.id}
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={() => toggleExtra(extra)}
                      className={`
                        flex
                        items-center
                        gap-1.5

                        px-3
                        py-2.5

                        rounded-xl

                        border

                        text-xs
                        font-semibold

                        transition-all

                        ${
                          selected
                            ? `
                              border-red-500/40
                              bg-red-500/10
                              text-red-400
                            `
                            : `
                              border-white/10
                              bg-surface
                              text-muted-foreground

                              hover:border-red-500/30
                            `
                        }
                      `}
                    >
                      <Ban
                        className="
                          w-3.5
                          h-3.5
                          shrink-0
                        "
                      />

                      {isRtl ? `بدون ${extraName}` : `No ${extraName}`}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          )}

          {/* =====================================================
              NOTES
              ===================================================== */}
          <div className="space-y-2">
            <label
              className="
                text-sm
                font-bold
                text-foreground
              "
            >
              {t("specialNotes", locale)}
            </label>

            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("notesPlaceholder", locale)}
              rows={3}
              className="
                bg-surface

                border-white/10

                text-foreground

                placeholder:text-muted-foreground/50

                focus:border-primary/50

                resize-none

                rounded-xl

                text-sm

                min-h-[88px]
              "
            />
          </div>

          {/* =====================================================
              BOTTOM ACTIONS
              ===================================================== */}
          <div
            className="
              flex
              flex-col
              sm:flex-row

              items-stretch
              sm:items-center

              gap-3

              pt-1

              pb-1
            "
          >
            {/* ===================================================
                QUANTITY
                =================================================== */}
            <div
              className="
                flex
                items-center
                justify-center

                gap-3

                sm:justify-start

                shrink-0
              "
            >
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setQty((current) => Math.max(1, current - 1))}
                className="
                  w-10
                  h-10

                  rounded-xl

                  bg-surface

                  border
                  border-white/10

                  flex
                  items-center
                  justify-center

                  text-foreground/70

                  hover:text-foreground
                  hover:border-primary/40

                  active:scale-95

                  transition-all
                "
                aria-label={
                  locale === "ar" ? "إنقاص الكمية" : "Decrease quantity"
                }
              >
                <Minus className="w-4 h-4" />
              </motion.button>

              <span
                className="
                  text-lg
                  font-bold

                  text-foreground

                  w-8

                  text-center
                "
              >
                {qty}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => setQty((current) => current + 1)}
                className="
                  w-10
                  h-10

                  rounded-xl

                  bg-surface

                  border
                  border-white/10

                  flex
                  items-center
                  justify-center

                  text-foreground/70

                  hover:text-foreground
                  hover:border-primary/40

                  active:scale-95

                  transition-all
                "
                aria-label={
                  locale === "ar" ? "زيادة الكمية" : "Increase quantity"
                }
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            </div>

            {/* ===================================================
                ADD TO CART
                =================================================== */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={handleAdd}
              disabled={justAdded}
              className={`
                flex-1

                min-h-[48px]

                flex
                items-center
                justify-center

                gap-2

                px-4
                py-3.5

                rounded-xl

                font-bold
                text-sm

                transition-all

                ${
                  justAdded
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

                      glow-brand
                    `
                }
              `}
            >
              {justAdded ? (
                <>✓ {t("added", locale)}</>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 shrink-0" />

                  <span className="truncate">
                    {t("addToCart", locale)} · {formatPrice(total)}
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default function ProductModal({ product, onClose }: Props) {
  const { locale } = useLocaleStore();

  return (
    <AnimatePresence mode="wait">
      {product && (
        <ProductModalContent
          key={product.id}
          product={product}
          locale={locale}
          onClose={onClose}
        />
      )}
    </AnimatePresence>
  );
}
