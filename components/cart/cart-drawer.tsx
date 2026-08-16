"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  MapPin,
  User,
  Phone,
  Pencil,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

import type { CartExtra } from "@/lib/types";

type CartItem = {
  id: string;
  productId: string;
  nameEn: string;
  nameAr: string;
  price: number;
  image: string;
  quantity: number;
  notes: string;
  extras: CartExtra[];
};

/* =========================================================
   Cart Item
========================================================= */

function CartItemRow({ item }: { item: CartItem }) {
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
      <div
        className="
          relative
          rounded-2xl
          bg-[#242424]
          p-3
          shadow-[0_8px_30px_rgba(0,0,0,0.18)]
        "
      >
        <div className="flex gap-3">
          {/* Product image */}
          <div
            className="
              relative
              w-[72px]
              h-[72px]
              rounded-xl
              overflow-hidden
              shrink-0
              bg-[#303030]
            "
          >
            <Image
              src={item.image}
              alt={name}
              fill
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
                onClick={() => removeItem(item.id)}
                className="
                  shrink-0
                  w-8
                  h-8
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  text-white/30
                  hover:text-red-400
                  hover:bg-red-400/10
                  active:scale-90
                  transition-all
                "
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
                    locale === "ar"
                      ? extra.nameAr
                      : extra.nameEn || extra.nameAr;

                  return (
                    <div
                      key={extra.id}
                      className="flex items-center justify-between gap-2"
                    >
                      <p className="text-xs text-white/45">
                        <span className="text-primary font-bold">+</span>{" "}
                        {extraName}
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
                    locale === "ar"
                      ? extra.nameAr
                      : extra.nameEn || extra.nameAr;

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
                  placeholder={
                    locale === "ar" ? "أضف ملاحظتك..." : "Add your note..."
                  }
                  rows={2}
                  className="
                    min-h-[70px]
                    bg-[#1B1B1B]
                    border-0
                    text-white
                    placeholder:text-white/25
                    focus:ring-1
                    focus:ring-primary/40
                    resize-none
                    rounded-xl
                    text-xs
                  "
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveNotes}
                    className="
                      flex-1
                      h-8
                      rounded-lg
                      bg-primary
                      text-primary-foreground
                      text-xs
                      font-bold
                      flex
                      items-center
                      justify-center
                      gap-1.5
                      hover:opacity-90
                      transition-opacity
                    "
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
                    className="
                      h-8
                      px-3
                      rounded-lg
                      bg-[#303030]
                      text-white/45
                      text-xs
                      font-semibold
                      hover:text-white
                      transition-colors
                    "
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
                      className="
                        shrink-0
                        p-1
                        rounded-md
                        text-white/30
                        hover:text-primary
                        hover:bg-primary/10
                        transition-colors
                      "
                      aria-label={
                        locale === "ar" ? "تعديل الملاحظة" : "Edit note"
                      }
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
                    className="
                      flex
                      items-center
                      gap-1.5
                      text-[11px]
                      text-white/30
                      hover:text-primary
                      transition-colors
                    "
                  >
                    <Pencil className="w-3 h-3" />
                    {locale === "ar" ? "إضافة ملاحظة" : "Add note"}
                  </button>
                )}
              </div>
            )}

            {/* Quantity + price */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <div
                className="
                  flex
                  items-center
                  gap-1
                  rounded-xl
                  bg-[#1B1B1B]
                  p-1
                "
              >
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="
                    w-7
                    h-7
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-white/50
                    hover:text-white
                    hover:bg-[#303030]
                    transition-colors
                  "
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </motion.button>

                <span className="text-sm font-bold w-5 text-center text-white">
                  {item.quantity}
                </span>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.85 }}
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="
                    w-7
                    h-7
                    rounded-lg
                    flex
                    items-center
                    justify-center
                    text-white/50
                    hover:text-white
                    hover:bg-[#303030]
                    transition-colors
                  "
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </motion.button>
              </div>

              <span className="text-[15px] font-extrabold text-primary">
                {formatPrice(itemTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================
   Cart Drawer
========================================================= */

export default function CartDrawer() {
  const { items, isOpen, closeCart, clearCart, subtotal } = useCartStore();

  const { locale } = useLocaleStore();

  const isRtl = locale === "ar";
  const total = subtotal();

  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.touchAction = "none";

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isOpen]);

  const canSubmit = useMemo(
    () =>
      address.trim().length > 0 &&
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      items.length > 0,
    [address, name, phone, items.length],
  );

  const handleWhatsAppOrder = () => {
    const cleanAddress = address.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();

    if (!cleanAddress) {
      setError(
        isRtl
          ? "يرجى إدخال عنوان التوصيل."
          : "Please enter your delivery address.",
      );
      return;
    }

    if (!cleanName) {
      setError(isRtl ? "يرجى إدخال الاسم." : "Please enter your name.");
      return;
    }

    if (!cleanPhone) {
      setError(
        isRtl ? "يرجى إدخال رقم الهاتف." : "Please enter your phone number.",
      );
      return;
    }

    if (items.length === 0) return;

    setError("");

    let message =
      locale === "ar"
        ? "مرحباً، أريد طلب:\n"
        : "Hello, I would like to place an order:\n";

    items.forEach((item: CartItem) => {
      const itemName =
        locale === "ar" ? item.nameAr : item.nameEn || item.nameAr;

      const addedExtras = item.extras.filter(
        (extra: CartExtra) => extra.type === "ADD",
      );

      const removedExtras = item.extras.filter(
        (extra: CartExtra) => extra.type === "REMOVE",
      );

      message += `\n• ${item.quantity}x ${itemName}`;

      if (addedExtras.length > 0) {
        message += locale === "ar" ? "\n  الإضافات:" : "\n  Add-ons:";

        addedExtras.forEach((extra: CartExtra) => {
          const extraName =
            locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

          message += `\n  + ${extraName}`;
        });
      }

      if (removedExtras.length > 0) {
        message += locale === "ar" ? "\n  بدون:" : "\n  Without:";

        removedExtras.forEach((extra: CartExtra) => {
          const extraName =
            locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

          message += `\n  - ${extraName}`;
        });
      }

      if (item.notes?.trim()) {
        message +=
          locale === "ar"
            ? `\n  ملاحظات: ${item.notes.trim()}`
            : `\n  Notes: ${item.notes.trim()}`;
      }

      message += "\n";
    });

    message +=
      locale === "ar"
        ? `\nالمجموع: ${formatPrice(total)}`
        : `\nTotal: ${formatPrice(total)}`;

    message +=
      locale === "ar"
        ? `\nعنوان التوصيل: ${cleanAddress}`
        : `\nDelivery address: ${cleanAddress}`;

    message +=
      locale === "ar" ? `\nالاسم: ${cleanName}` : `\nName: ${cleanName}`;

    message +=
      locale === "ar"
        ? `\nرقم الهاتف: ${cleanPhone}`
        : `\nPhone: ${cleanPhone}`;

    message += locale === "ar" ? "\n\nشكراً!" : "\n\nThank you!";

    const phoneNumber = RESTAURANT_SETTINGS.whatsappNumber.replace(/\D/g, "");

    const waUrl =
      `https://wa.me/${phoneNumber}` + `?text=${encodeURIComponent(message)}`;

    window.open(waUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* =================================================
              Backdrop
          ================================================= */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="
              fixed
              inset-0
              z-[60]
              bg-black/75
              backdrop-blur-[6px]
            "
          />

          {/* =================================================
              Drawer
          ================================================= */}
          <motion.aside
            initial={{
              x: isRtl ? "-100%" : "100%",
            }}
            animate={{ x: 0 }}
            exit={{
              x: isRtl ? "-100%" : "100%",
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 35,
            }}
            className={`
              fixed
              inset-y-0
              z-[70]
              w-full
              sm:max-w-[430px]
              flex
              flex-col
              overflow-hidden
              bg-[#1B1B1B]
              shadow-[-20px_0_60px_rgba(0,0,0,0.35)]
              ${isRtl ? "left-0" : "right-0"}
            `}
            style={{
              height: "100dvh",
              maxHeight: "100dvh",
              overscrollBehavior: "contain",
            }}
            dir={isRtl ? "rtl" : "ltr"}
            onWheel={(event) => {
              event.stopPropagation();
            }}
            onTouchMove={(event) => {
              event.stopPropagation();
            }}
          >
            {/* =================================================
                Header
            ================================================= */}
            <div
              className="
                shrink-0
                px-5
                sm:px-6
                pt-5
                pb-4
                bg-[#1B1B1B]
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="
                      w-11
                      h-11
                      rounded-2xl
                      bg-primary/10
                      flex
                      items-center
                      justify-center
                      shrink-0
                    "
                  >
                    <ShoppingBag className="w-5 h-5 text-primary" />
                  </div>

                  <div>
                    <h2 className="text-lg font-extrabold text-white">
                      {t("yourCart", locale)}
                    </h2>

                    <p className="text-xs text-white/35 mt-0.5">
                      {items.length} {t("cartItems", locale)}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-[#252525]
                    flex
                    items-center
                    justify-center
                    text-white/50
                    hover:text-white
                    hover:bg-[#303030]
                    active:scale-90
                    transition-all
                  "
                  aria-label={locale === "ar" ? "إغلاق السلة" : "Close cart"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* =================================================
                Content
            ================================================= */}
            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
                px-4
                sm:px-5
                scrollbar-hide
              "
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    flex
                    flex-col
                    items-center
                    justify-center
                    min-h-full
                    gap-4
                    py-16
                    text-center
                  "
                >
                  <div
                    className="
                      w-24
                      h-24
                      rounded-[28px]
                      bg-[#242424]
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ShoppingBag className="w-10 h-10 text-white/15" />
                  </div>

                  <div>
                    <p className="text-base font-extrabold text-white">
                      {t("cartEmpty", locale)}
                    </p>

                    <p className="text-sm text-white/35 mt-1 max-w-xs">
                      {t("cartEmptyDesc", locale)}
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={closeCart}
                    className="
                      bg-primary
                      text-primary-foreground
                      hover:bg-primary/90
                      rounded-xl
                      px-5
                      h-11
                      font-bold
                    "
                  >
                    {t("browseMenu", locale)}

                    <ArrowRight
                      className={`
                        w-4
                        h-4
                        ${isRtl ? "mr-2 rotate-180" : "ml-2"}
                      `}
                    />
                  </Button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {items.map((item: CartItem) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* =================================================
                Footer
            ================================================= */}
            {items.length > 0 && (
              <div
                className="
                  shrink-0
                  bg-[#202020]
                  rounded-t-[28px]
                  px-5
                  sm:px-6
                  pt-5
                  pb-[max(1rem,env(safe-area-inset-bottom))]
                  shadow-[0_-15px_40px_rgba(0,0,0,0.22)]
                "
              >
                {/* Delivery heading */}
                <div className="mb-3">
                  <h3 className="text-sm font-extrabold text-white">
                    {isRtl ? "معلومات التوصيل" : "Delivery information"}
                  </h3>

                  <p className="text-[11px] text-white/30 mt-1">
                    {isRtl
                      ? "جميع المعلومات مطلوبة لإتمام الطلب"
                      : "All information is required to place your order."}
                  </p>
                </div>

                {/* Address */}
                <div className="relative mb-2">
                  <MapPin
                    className={`
                      absolute
                      top-3.5
                      ${isRtl ? "right-3" : "left-3"}
                      w-4
                      h-4
                      text-primary
                      pointer-events-none
                      z-10
                    `}
                  />

                  <input
                    type="text"
                    value={address}
                    onChange={(event) => {
                      setAddress(event.target.value);

                      if (error) {
                        setError("");
                      }
                    }}
                    placeholder={
                      isRtl ? "عنوان التوصيل *" : "Delivery address *"
                    }
                    required
                    className={`
                      w-full
                      h-11
                      rounded-xl
                      bg-[#292929]
                      border-0
                      text-white
                      text-sm
                      outline-none
                      placeholder:text-white/25
                      focus:ring-1
                      focus:ring-primary/50
                      transition-all
                      ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                    `}
                  />
                </div>

                {/* Name + Phone */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <User
                      className={`
                        absolute
                        top-3.5
                        ${isRtl ? "right-3" : "left-3"}
                        w-4
                        h-4
                        text-white/30
                        pointer-events-none
                        z-10
                      `}
                    />

                    <input
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(event.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder={isRtl ? "الاسم *" : "Name *"}
                      required
                      className={`
                        w-full
                        h-11
                        rounded-xl
                        bg-[#292929]
                        border-0
                        text-white
                        text-sm
                        outline-none
                        placeholder:text-white/25
                        focus:ring-1
                        focus:ring-primary/50
                        transition-all
                        ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                      `}
                    />
                  </div>

                  <div className="relative">
                    <Phone
                      className={`
                        absolute
                        top-3.5
                        ${isRtl ? "right-3" : "left-3"}
                        w-4
                        h-4
                        text-white/30
                        pointer-events-none
                        z-10
                      `}
                    />

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) => {
                        setPhone(event.target.value);

                        if (error) {
                          setError("");
                        }
                      }}
                      placeholder={isRtl ? "الهاتف *" : "Phone *"}
                      required
                      className={`
                        w-full
                        h-11
                        rounded-xl
                        bg-[#292929]
                        border-0
                        text-white
                        text-sm
                        outline-none
                        placeholder:text-white/25
                        focus:ring-1
                        focus:ring-primary/50
                        transition-all
                        ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                      `}
                    />
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{
                        opacity: 0,
                        height: 0,
                      }}
                      animate={{
                        opacity: 1,
                        height: "auto",
                      }}
                      exit={{
                        opacity: 0,
                        height: 0,
                      }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs font-semibold text-red-400 mt-2">
                        {error}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Totals */}
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/40">
                      {t("subtotal", locale)}
                    </span>

                    <span className="text-sm font-semibold text-white/70">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className="text-base font-extrabold text-white">
                      {t("total", locale)}
                    </span>

                    <span className="text-xl font-extrabold text-primary">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* WhatsApp CTA */}
                <motion.button
                  type="button"
                  whileHover={{
                    scale: canSubmit ? 1.01 : 1,
                  }}
                  whileTap={{
                    scale: canSubmit ? 0.98 : 1,
                  }}
                  onClick={handleWhatsAppOrder}
                  className="
                    w-full
                    mt-4
                    h-13
                    rounded-2xl
                    bg-[#25D366]
                    text-white
                    font-extrabold
                    text-sm
                    sm:text-base
                    flex
                    items-center
                    justify-center
                    gap-2.5
                    shadow-[0_8px_25px_rgba(37,211,102,0.16)]
                    hover:bg-[#1ebe5d]
                    active:bg-[#19ad54]
                    transition-colors
                  "
                >
                  <MessageCircle className="w-5 h-5" />

                  {t("sendOrder", locale)}
                </motion.button>

                {/* Clear */}
                <button
                  type="button"
                  onClick={clearCart}
                  className="
                    w-full
                    mt-2
                    py-1.5
                    text-[11px]
                    font-medium
                    text-white/25
                    hover:text-red-400
                    transition-colors
                  "
                >
                  {isRtl ? "مسح السلة" : "Clear cart"}
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
