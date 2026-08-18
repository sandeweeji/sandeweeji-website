"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
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

export default function ProductModal({ product, onClose }: Props) {
  const { locale } = useLocaleStore();
  const addItem = useCartStore((s) => s.addItem);

  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");
  const [selectedExtras, setSelectedExtras] = useState<CartExtra[]>([]);
  const [justAdded, setJustAdded] = useState(false);

  const isRtl = locale === "ar";

  /*
   * ---------------------------------------------------------
   * Lock the background page while the modal is open.
   * This is especially important on mobile.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!product) return;

    const body = document.body;
    const html = document.documentElement;

    const previousBodyOverflow = body.style.overflow;
    const previousBodyTouchAction = body.style.touchAction;
    const previousHtmlOverflow = html.style.overflow;

    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    html.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      body.style.touchAction = previousBodyTouchAction;
      html.style.overflow = previousHtmlOverflow;
    };
  }, [product]);

  /*
   * ---------------------------------------------------------
   * Close with Escape.
   * ---------------------------------------------------------
   */
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  const addOns = useMemo(
    () => product?.extras?.filter((e) => e.type === "ADD") ?? [],
    [product],
  );

  const removables = useMemo(
    () => product?.extras?.filter((e) => e.type === "REMOVE") ?? [],
    [product],
  );

  if (!product || typeof document === "undefined") {
    return null;
  }

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

  const toggleExtra = (extra: NonNullable<typeof product.extras>[number]) => {
    setSelectedExtras((prev) => {
      const exists = prev.some((item) => item.id === extra.id);

      if (exists) {
        return prev.filter((item) => item.id !== extra.id);
      }

      return [
        ...prev,
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
      onClose();

      setQty(1);
      setNotes("");
      setSelectedExtras([]);
    }, 700);
  };

  const modalContent = (
    <AnimatePresence>
      {product && (
        <div className="fixed inset-0 z-[9999]" dir={isRtl ? "rtl" : "ltr"}>
          {/* =====================================================
              BACKDROP
              ===================================================== */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="
              absolute
              inset-0
              bg-black/80
              backdrop-blur-md
              touch-none
            "
            aria-hidden="true"
          />

          {/* =====================================================
              MODAL POSITIONING CONTAINER

              The important part:
              - fixed fullscreen
              - flex
              - modal gets its own height
              - background cannot scroll
              ===================================================== */}
          <div
            className="
              absolute
              inset-0
              flex
              items-end
              justify-center
              sm:items-center
              sm:p-4
              pointer-events-none
            "
          >
            {/* ===================================================
                MODAL
                =================================================== */}
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
                mass: 0.8,
              }}
              onClick={(event) => event.stopPropagation()}
              className="
                pointer-events-auto

                relative
                flex
                flex-col

                w-full
                sm:w-[min(100%,32rem)]

                h-auto
                max-h-[94dvh]
                sm:max-h-[90dvh]

                overflow-hidden

                bg-card
                border
                border-white/10

                rounded-t-3xl
                sm:rounded-3xl

                shadow-2xl

                min-h-0

                transform-gpu
              "
            >
              {/* =================================================
                  SCROLLABLE AREA

                  THIS is the actual scroll container.
                  Do not put overflow-y-auto on the outer modal.
                  ================================================= */}
              <div
                className="
                  min-h-0
                  flex-1
                  overflow-y-auto
                  overflow-x-hidden

                  overscroll-contain
                  touch-pan-y

                  scrollbar-hide

                  [-webkit-overflow-scrolling:touch]
                "
              >
                {/* =================================================
                    IMAGE
                    ================================================= */}
                <div
                  className="
                    relative
                    h-52
                    sm:h-64
                    flex-shrink-0

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

                  <div
                    className="
                      absolute
                      inset-0
                      bg-gradient-to-t
                      from-card/95
                      via-card/10
                      to-transparent
                    "
                  />

                  {/* =================================================
                      BADGES
                      ================================================= */}
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
                      const b = BADGE_MAP[badge];

                      if (!b) return null;

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
                            ${b.cls}
                          `}
                        >
                          {locale === "ar" ? b.labelAr : b.labelEn}
                        </span>
                      );
                    })}
                  </div>

                  {/* =================================================
                      CLOSE BUTTON
                      ================================================= */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="
                      absolute
                      top-4
                      right-4

                      z-10

                      w-10
                      h-10

                      rounded-full

                      bg-black/55
                      backdrop-blur-md

                      border
                      border-white/10

                      flex
                      items-center
                      justify-center

                      text-white/80

                      hover:text-white
                      hover:bg-black/75

                      active:scale-95

                      transition-all
                    "
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* =================================================
                    CONTENT
                    ================================================= */}
                <div className="p-5 sm:p-6 space-y-6">
                  {/* =================================================
                      NAME + PRICE
                      ================================================= */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
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
                          <Flame className="w-3 h-3 flex-shrink-0" />
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

                  {/* =================================================
                      DESCRIPTION
                      ================================================= */}
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

                  {/* =================================================
                      PAID EXTRAS
                      ================================================= */}
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

                                    flex-shrink-0

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

                  {/* =================================================
                      REMOVE INGREDIENTS
                      ================================================= */}
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
                                  flex-shrink-0
                                "
                              />

                              {isRtl ? `بدون ${extraName}` : `No ${extraName}`}
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* =================================================
                      NOTES
                      ================================================= */}
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
                      onChange={(e) => setNotes(e.target.value)}
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
                      "
                    />
                  </div>

                  {/* =================================================
                      BOTTOM ACTIONS
                      ================================================= */}
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
                    {/* Quantity */}
                    <div
                      className="
                        flex
                        items-center
                        justify-center
                        gap-3

                        sm:justify-start
                      "
                    >
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.85 }}
                        onClick={() =>
                          setQty((current) => Math.max(1, current - 1))
                        }
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
                        aria-label="Decrease quantity"
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
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </motion.button>
                    </div>

                    {/* Add to cart */}
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={handleAdd}
                      disabled={justAdded}
                      className={`
                        flex-1

                        flex
                        items-center
                        justify-center
                        gap-2

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
                          <ShoppingCart className="w-4 h-4" />

                          {t("addToCart", locale)}

                          <span>·</span>

                          {formatPrice(total)}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );

  /*
   * ---------------------------------------------------------
   * Render directly under <body>.
   *
   * This prevents parent layout/stacking/transform issues
   * from interfering with fixed positioning on mobile.
   * ---------------------------------------------------------
   */
  return createPortal(modalContent, document.body);
}
