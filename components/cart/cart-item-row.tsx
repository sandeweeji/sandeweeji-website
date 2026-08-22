"use client";

import Image from "next/image";
import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { Minus, Plus, Trash2, Pencil, Check } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import type { CartExtra, CartItem } from "@/lib/types";

const MAX_QTY = 20;

export function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, updateNotes } = useCartStore();
  const { locale } = useLocaleStore();

  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [draftNotes, setDraftNotes] = useState(item.notes ?? "");

  const name = locale === "ar" ? item.nameAr : item.nameEn || item.nameAr;
  const addedExtras = item.extras.filter((extra) => extra.type === "ADD");
  const removedExtras = item.extras.filter((extra) => extra.type === "REMOVE");
  const extrasTotal = item.extras.reduce(
    (sum: number, extra: CartExtra) => sum + Number(extra.price),
    0,
  );
  const itemTotal = (Number(item.price) + extrasTotal) * item.quantity;

  const saveNotes = () => {
    updateNotes(item.id, draftNotes.trim());
    setIsEditingNotes(false);
  };

  const vibrate = (ms: number) => {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate(ms);
    }
  };

  const handleDecrease = () => {
    if (item.quantity <= 1) {
      vibrate(12);
      removeItem(item.id);
      return;
    }
    updateQuantity(item.id, item.quantity - 1);
  };

  const handleIncrease = () => {
    if (item.quantity >= MAX_QTY) return;
    updateQuantity(item.id, item.quantity + 1);
  };

  // Swipe-to-delete
  const dragX = useMotionValue(0);
  const deleteBgOpacity = useTransform(dragX, [-96, -24, 0, 24, 96], [1, 0, 0, 0, 1]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (Math.abs(info.offset.x) > 90 || Math.abs(info.velocity.x) > 650) {
      vibrate(15);
      removeItem(item.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{
        opacity: 0,
        y: -10,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ duration: 0.22 }}
      className="py-3.5"
    >
      <div className="relative rounded-2xl overflow-hidden">
        {/* Swipe-to-delete backdrop */}
        <motion.div
          style={{ opacity: deleteBgOpacity }}
          className="absolute inset-0 rounded-2xl bg-red-500/90 flex items-center justify-between px-5 pointer-events-none"
        >
          <Trash2 className="w-5 h-5 text-white" />
          <Trash2 className="w-5 h-5 text-white" />
        </motion.div>

        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.6}
          style={{ x: dragX }}
          onDragEnd={handleDragEnd}
          className="relative rounded-2xl bg-[#242424] p-3 shadow-[0_8px_30px_rgba(0,0,0,0.18)] touch-pan-y"
        >
          <div className="flex gap-3">
            {/* Product image */}
            <div className="relative w-[72px] h-[72px] rounded-xl overflow-hidden shrink-0 bg-[#303030]">
              <Image
                src={item.image}
                alt={name}
                fill
                draggable={false}
                className="object-cover"
                sizes="72px"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* Name + delete */}
              <div className="flex items-start justify-between gap-2">
                <p className="text-[15px] font-extrabold text-white leading-snug">
                  {name}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    vibrate(12);
                    removeItem(item.id);
                  }}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-400/10 active:scale-90 transition-all"
                  aria-label={t("remove", locale)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Added extras */}
              {addedExtras.length > 0 && (
                <div className="mt-2 space-y-1">
                  {addedExtras.map((extra: CartExtra) => {
                    const extraName =
                      locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

                    return (
                      <div key={extra.id} className="flex items-center justify-between gap-2">
                        <p className="text-xs text-white/45">
                          <span className="text-primary font-bold">+</span> {extraName}
                        </p>

                        {Number(extra.price) > 0 && (
                          <span className="text-[11px] text-white/35 shrink-0">
                            +{formatPrice(Number(extra.price))}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Removed ingredients */}
              {removedExtras.length > 0 && (
                <div className="mt-2 space-y-1">
                  {removedExtras.map((extra: CartExtra) => {
                    const extraName =
                      locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

                    return (
                      <p key={extra.id} className="text-xs text-red-400/65">
                        <span className="font-bold">−</span> {extraName}
                      </p>
                    );
                  })}
                </div>
              )}

              {/* Notes */}
              {isEditingNotes ? (
                <div className="mt-3 space-y-2">
                  <Textarea
                    autoFocus
                    value={draftNotes}
                    onChange={(event) => setDraftNotes(event.target.value)}
                    placeholder={locale === "ar" ? "أضف ملاحظتك..." : "Add your note..."}
                    rows={2}
                    className="min-h-[70px] bg-[#1B1B1B] border-0 text-white placeholder:text-white/25 focus:ring-1 focus:ring-primary/40 resize-none rounded-xl text-base sm:text-xs"
                  />

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={saveNotes}
                      className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {locale === "ar" ? "حفظ" : "Save"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDraftNotes(item.notes ?? "");
                        setIsEditingNotes(false);
                      }}
                      className="h-8 px-3 rounded-lg bg-[#303030] text-white/45 text-xs font-semibold hover:text-white transition-colors"
                    >
                      {locale === "ar" ? "إلغاء" : "Cancel"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  {item.notes?.trim() ? (
                    <div className="flex items-start gap-2">
                      <p className="flex-1 min-w-0 text-xs text-white/40 italic">
                        📝 {item.notes}
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setDraftNotes(item.notes ?? "");
                          setIsEditingNotes(true);
                        }}
                        className="shrink-0 p-1 rounded-md text-white/30 hover:text-primary hover:bg-primary/10 transition-colors"
                        aria-label={locale === "ar" ? "تعديل الملاحظة" : "Edit note"}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDraftNotes("");
                        setIsEditingNotes(true);
                      }}
                      className="flex items-center gap-1.5 text-[11px] text-white/30 hover:text-primary transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                      {locale === "ar" ? "إضافة ملاحظة" : "Add note"}
                    </button>
                  )}
                </div>
              )}

              {/* Quantity + price */}
              <div className="flex items-center justify-between gap-3 mt-3">
                <div className="flex items-center gap-1 rounded-xl bg-[#1B1B1B] p-1">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={handleDecrease}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-[#303030] transition-colors"
                    aria-label={
                      item.quantity <= 1
                        ? locale === "ar"
                          ? "إزالة العنصر"
                          : "Remove item"
                        : locale === "ar"
                          ? "إنقاص الكمية"
                          : "Decrease quantity"
                    }
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </motion.button>

                  <span className="text-sm font-bold w-5 text-center text-white">
                    {item.quantity}
                  </span>

                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.85 }}
                    onClick={handleIncrease}
                    disabled={item.quantity >= MAX_QTY}
                    className="w-8 h-8 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-[#303030] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </motion.button>
                </div>

                <span className="text-[15px] font-extrabold text-primary">
                  {formatPrice(itemTotal)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
