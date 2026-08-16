"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Flame, Ban } from "lucide-react";
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

  const addOns = useMemo(
    () => product?.extras?.filter((e) => e.type === "ADD") ?? [],
    [product],
  );

  const removables = useMemo(
    () => product?.extras?.filter((e) => e.type === "REMOVE") ?? [],
    [product],
  );

  if (!product) return null;

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

      // Reset the modal for the next product
      setQty(1);
      setNotes("");
      setSelectedExtras([]);
    }, 700);
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            className="
              fixed z-50
              inset-x-3 bottom-0
              sm:inset-auto
              sm:top-1/2 sm:left-1/2
              sm:-translate-x-1/2 sm:-translate-y-1/2
              w-auto sm:w-full sm:max-w-lg
              max-h-[94vh]
              overflow-y-auto
              bg-card
              border border-white/10
              rounded-t-3xl sm:rounded-3xl
              shadow-2xl
              scrollbar-hide
            "
            dir={isRtl ? "rtl" : "ltr"}
          >
            {/* Image */}
            <div className="relative h-52 sm:h-64 overflow-hidden rounded-t-3xl bg-surface">
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 512px"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent" />

              {/* Badges */}
              <div
                className={`absolute top-4 ${
                  isRtl ? "right-4" : "left-4"
                } flex flex-wrap gap-1.5 max-w-[70%]`}
              >
                {product.badges.map((badge) => {
                  const b = BADGE_MAP[badge];

                  if (!b) return null;

                  return (
                    <span
                      key={badge}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${b.cls}`}
                    >
                      {locale === "ar" ? b.labelAr : b.labelEn}
                    </span>
                  );
                })}
              </div>

              {/* Close */}
              <button
                onClick={onClose}
                className="
                  absolute top-4 right-4
                  w-9 h-9
                  rounded-full
                  bg-black/50
                  backdrop-blur-sm
                  border border-white/10
                  flex items-center justify-center
                  text-white/80
                  hover:text-white
                  hover:bg-black/70
                  transition-colors
                "
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6 space-y-6">
              {/* Name + Price */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                    {name}
                  </h2>

                  {product.calories && (
                    <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {product.calories} {t("calories", locale)}
                    </p>
                  )}
                </div>

                <p className="text-xl sm:text-2xl font-extrabold text-primary whitespace-nowrap">
                  {formatPrice(product.price)}
                </p>
              </div>

              {/* Description */}
              {desc && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              )}

              {/* Paid Extras */}
              {addOns.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">
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
                            flex items-center justify-between
                            gap-3
                            px-4 py-3
                            rounded-xl
                            border
                            text-sm
                            transition-all
                            ${
                              selected
                                ? "border-primary/50 bg-primary/10 text-foreground"
                                : "border-white/10 bg-surface text-muted-foreground hover:border-primary/30"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`
                                w-4 h-4
                                rounded-sm
                                border-2
                                flex items-center justify-center
                                flex-shrink-0
                                ${
                                  selected
                                    ? "border-primary bg-primary"
                                    : "border-white/30"
                                }
                              `}
                            >
                              {selected && (
                                <span className="text-[8px] text-primary-foreground font-bold">
                                  ✓
                                </span>
                              )}
                            </div>

                            <span className="truncate">{extraName}</span>
                          </div>

                          <span
                            className={`font-semibold whitespace-nowrap ${
                              selected ? "text-primary" : ""
                            }`}
                          >
                            +{formatPrice(extra.price)}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Removable Ingredients */}
              {removables.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-foreground">
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
                            flex items-center gap-1.5
                            px-3 py-2.5
                            rounded-xl
                            border
                            text-xs font-semibold
                            transition-all
                            ${
                              selected
                                ? "border-red-500/40 bg-red-500/10 text-red-400"
                                : "border-white/10 bg-surface text-muted-foreground hover:border-red-500/30"
                            }
                          `}
                        >
                          <Ban className="w-3.5 h-3.5 flex-shrink-0" />

                          {isRtl ? `بدون ${extraName}` : `No ${extraName}`}
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground">
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

              {/* Bottom Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                {/* Quantity */}
                <div className="flex items-center justify-center gap-3 sm:justify-start">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() =>
                      setQty((current) => Math.max(1, current - 1))
                    }
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-surface
                      border border-white/10
                      flex items-center justify-center
                      text-foreground/70
                      hover:text-foreground
                      hover:border-primary/40
                      transition-colors
                    "
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>

                  <span className="text-lg font-bold text-foreground w-8 text-center">
                    {qty}
                  </span>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={() => setQty((current) => current + 1)}
                    className="
                      w-10 h-10
                      rounded-xl
                      bg-surface
                      border border-white/10
                      flex items-center justify-center
                      text-foreground/70
                      hover:text-foreground
                      hover:border-primary/40
                      transition-colors
                    "
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>

                {/* Add */}
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={handleAdd}
                  disabled={justAdded}
                  className={`
                    flex-1
                    flex items-center justify-center
                    gap-2
                    py-3.5
                    rounded-xl
                    font-bold
                    text-sm
                    transition-all
                    ${
                      justAdded
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-primary text-primary-foreground hover:bg-primary/90 glow-brand"
                    }
                  `}
                >
                  {justAdded ? (
                    <>✓ {t("added", locale)}</>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      {t("addToCart", locale)} · {formatPrice(total)}
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
