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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

import type { CartExtra } from "@/lib/types";

/* =========================================================
   Local cart types
   CartItem is not exported from @/lib/types, so we define
   the shape used by the cart store here.
========================================================= */

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
   Cart Item Row
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
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{
        opacity: 0,
        x: -30,
        height: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }}
      transition={{ duration: 0.22 }}
      className="py-4 border-b border-white/5 last:border-b-0"
    >
      <div className="flex gap-3">
        {/* Product image */}
        <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden shrink-0 bg-surface">
          <Image
            src={item.image}
            alt={name}
            fill
            className="object-cover"
            sizes="72px"
          />
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Product name + delete */}
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm sm:text-[15px] font-bold text-foreground leading-snug wrap-break-word">
              {name}
            </p>

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              className="
                shrink-0
                p-1.5
                rounded-lg
                text-muted-foreground/50
                hover:text-destructive
                hover:bg-destructive/10
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
              <p className="text-[11px] font-semibold text-primary/70">
                {locale === "ar" ? "الإضافات" : "Add-ons"}
              </p>

              {addedExtras.map((extra: CartExtra) => {
                const extraName =
                  locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

                return (
                  <div
                    key={extra.id}
                    className="flex items-center justify-between gap-2"
                  >
                    <p className="text-xs text-primary/80 wrap-break-word">
                      <span className="font-bold">+</span> {extraName}
                    </p>

                    {Number(extra.price) > 0 && (
                      <span className="text-[11px] text-primary/60 shrink-0">
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
              <p className="text-[11px] font-semibold text-red-400/70">
                {locale === "ar" ? "بدون مكونات" : "Without"}
              </p>

              {removedExtras.map((extra: CartExtra) => {
                const extraName =
                  locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

                return (
                  <p
                    key={extra.id}
                    className="text-xs text-red-400/80 wrap-break-word"
                  >
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
                  bg-surface
                  border-white/10
                  text-foreground
                  placeholder:text-muted-foreground/50
                  focus:border-primary/50
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
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-1.5
                    hover:bg-primary/90
                    transition-colors
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
                    bg-surface
                    border
                    border-white/10
                    text-muted-foreground
                    text-xs
                    font-semibold
                    hover:text-foreground
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
                  <p className="flex-1 min-w-0 text-xs text-muted-foreground italic wrap-break-word">
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
                      text-muted-foreground/60
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
                    text-muted-foreground/60
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
            {/* Quantity */}
            <div className="flex items-center gap-2">
              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="
                  w-7 h-7
                  rounded-lg
                  bg-surface-elevated
                  border border-white/10
                  flex items-center justify-center
                  text-foreground/70
                  hover:text-foreground
                  hover:border-primary/40
                  active:bg-primary/10
                  transition-colors
                "
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3" />
              </motion.button>

              <span className="text-sm font-bold w-5 text-center text-foreground">
                {item.quantity}
              </span>

              <motion.button
                type="button"
                whileTap={{ scale: 0.85 }}
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="
                  w-7 h-7
                  rounded-lg
                  bg-surface-elevated
                  border border-white/10
                  flex items-center justify-center
                  text-foreground/70
                  hover:text-foreground
                  hover:border-primary/40
                  active:bg-primary/10
                  transition-colors
                "
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>

            {/* Item price */}
            <span className="text-sm font-extrabold text-primary whitespace-nowrap">
              {formatPrice(itemTotal)}
            </span>
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

  /*
   * Prevent the page behind the drawer from scrolling.
   * This is important on mobile where the drawer can otherwise
   * scroll the underlying document.
   */
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

  /*
   * Also clear errors when the user starts entering the
   * required address.
   */
  const canSubmit = useMemo(
    () => address.trim().length > 0 && items.length > 0,
    [address, items.length],
  );

  const handleWhatsAppOrder = () => {
    const cleanAddress = address.trim();

    /*
     * Address is the ONLY required customer field.
     */
    if (!cleanAddress) {
      setError(
        isRtl
          ? "يرجى إدخال عنوان التوصيل."
          : "Please enter your delivery address.",
      );
      return;
    }

    if (!name.trim()) {
      setError(isRtl ? "يرجى إدخال الاسم." : "Please enter your name .");
      return;
    }

    if (!phone.trim()) {
      setError(
        isRtl ? "يرجى إدخال رقم الهاتف." : "Please enter your phone number.",
      );
      return;
    }

    if (items.length === 0) {
      return;
    }

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

      /*
       * Add-ons
       *
       * IMPORTANT:
       * No IDs are included in the WhatsApp message.
       * The restaurant receives human-readable names only.
       */
      if (addedExtras.length > 0) {
        message += locale === "ar" ? "\n  الإضافات:" : "\n  Add-ons:";

        addedExtras.forEach((extra: CartExtra) => {
          const extraName =
            locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

          message += `\n  + ${extraName}`;
        });
      }

      /*
       * Removed ingredients
       *
       * Again: names only, never database IDs.
       */
      if (removedExtras.length > 0) {
        message += locale === "ar" ? "\n  بدون:" : "\n  Without:";

        removedExtras.forEach((extra: CartExtra) => {
          const extraName =
            locale === "ar" ? extra.nameAr : extra.nameEn || extra.nameAr;

          message += `\n  - ${extraName}`;
        });
      }

      /*
       * Notes
       */
      if (item.notes?.trim()) {
        message +=
          locale === "ar"
            ? `\n  ملاحظات: ${item.notes.trim()}`
            : `\n  Notes: ${item.notes.trim()}`;
      }

      message += "\n";
    });

    /*
     * Total
     */
    message +=
      locale === "ar"
        ? `\nالمجموع: ${formatPrice(total)}`
        : `\nTotal: ${formatPrice(total)}`;

    /*
     * Address — required
     */
    message +=
      locale === "ar"
        ? `\nعنوان التوصيل: ${cleanAddress}`
        : `\nDelivery address: ${cleanAddress}`;

    /*
     * Name — optional
     */
    if (name.trim()) {
      message +=
        locale === "ar" ? `\nالاسم: ${name.trim()}` : `\nName: ${name.trim()}`;
    }

    /*
     * Phone — optional
     */
    if (phone.trim()) {
      message +=
        locale === "ar"
          ? `\nرقم الهاتف: ${phone.trim()}`
          : `\nPhone: ${phone.trim()}`;
    }

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
              bg-black/70
              backdrop-blur-sm
              touch-none
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
              sm:max-w-md
              flex
              flex-col
              overflow-hidden
              bg-card
              shadow-2xl
              ${isRtl ? "left-0 border-r" : "right-0 border-l"}
              border-white/10
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
                flex
                items-center
                justify-between
                px-4
                sm:px-6
                py-4
                border-b
                border-white/10
                bg-card
              "
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="
                    w-10
                    h-10
                    rounded-xl
                    bg-primary/15
                    border
                    border-primary/20
                    flex
                    items-center
                    justify-center
                    shrink-0
                  "
                >
                  <ShoppingBag className="w-5 h-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-extrabold text-foreground">
                    {t("yourCart", locale)}
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    {items.length} {t("cartItems", locale)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeCart}
                className="
                  shrink-0
                  p-2
                  rounded-xl
                  text-muted-foreground
                  hover:text-foreground
                  hover:bg-white/5
                  active:scale-90
                  transition-all
                "
                aria-label={locale === "ar" ? "إغلاق السلة" : "Close cart"}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* =================================================
                Scrollable content
            ================================================= */}
            <div
              className="
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
                px-4
                sm:px-6
                scrollbar-hide
              "
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {items.length === 0 ? (
                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
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
                      w-20
                      h-20
                      rounded-2xl
                      bg-surface
                      border
                      border-white/10
                      flex
                      items-center
                      justify-center
                    "
                  >
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/40" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-foreground">
                      {t("cartEmpty", locale)}
                    </p>

                    <p className="text-sm text-muted-foreground mt-1 max-w-xs">
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
                    "
                  >
                    {t("browseMenu", locale)}

                    <ArrowRight
                      className={`
                        w-4 h-4
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
                This section stays visible while cart items
                scroll independently.
            ================================================= */}
            {items.length > 0 && (
              <div
                className="
                  shrink-0
                  border-t
                  border-white/10
                  bg-card
                  px-4
                  sm:px-6
                  pt-4
                  pb-[max(1rem,env(safe-area-inset-bottom))]
                "
              >
                {/* Delivery section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm sm:text-[15px] font-extrabold text-foreground">
                        {isRtl ? "معلومات التوصيل" : "Delivery information"}
                      </h3>

                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {isRtl
                          ? "العنوان مطلوب، الاسم والهاتف اختياريان"
                          : "Address is required. Name and phone are optional."}
                      </p>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="relative">
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
                        bg-surface
                        border
                        text-foreground
                        text-sm
                        outline-none
                        placeholder:text-muted-foreground/50
                        focus:border-primary/50
                        focus:ring-1
                        focus:ring-primary/20
                        transition-all
                        ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                      `}
                    />
                  </div>

                  {/* Name + phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Name */}
                    <div className="relative">
                      <User
                        className={`
                          absolute
                          top-3.5
                          ${isRtl ? "right-3" : "left-3"}
                          w-4
                          h-4
                          text-muted-foreground
                          
                          pointer-events-none
                          z-10
                        `}
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder={
                          isRtl ? "الاسم (مطلوب)" : "Name (required)"
                        }
                        className={`
                          w-full
                          h-11
                          rounded-xl
                          bg-surface
                          border
                          border-white/10
                          text-foreground
                          text-sm
                          outline-none
                          placeholder:text-muted-foreground/50
                          focus:border-primary/50
                          focus:ring-1
                          focus:ring-primary/20
                          transition-all
                          ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                        `}
                      />
                    </div>

                    {/* Phone */}
                    <div className="relative">
                      <Phone
                        className={`
                          absolute
                          top-3.5
                          ${isRtl ? "right-3" : "left-3"}
                          w-4
                          h-4
                          text-muted-foreground
                          pointer-events-none
                          z-10
                        `}
                      />

                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder={
                          isRtl ? "الهاتف (مطلوب)" : "Phone (required)"
                        }
                        className={`
                          w-full
                          h-11
                          rounded-xl
                          bg-surface
                          border
                          border-white/10
                          text-foreground
                          text-sm
                          outline-none
                          placeholder:text-muted-foreground/50
                          focus:border-primary/50
                          focus:ring-1
                          focus:ring-primary/20
                          transition-all
                          ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                        `}
                      />
                    </div>
                  </div>

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
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
                        className="text-xs font-semibold text-red-400"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Divider */}
                <Separator className="my-3 bg-white/5" />

                {/* Totals */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {t("subtotal", locale)}
                    </span>

                    <span className="font-semibold text-foreground">
                      {formatPrice(total)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-base font-extrabold text-foreground">
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
                    h-12
                    sm:h-13
                    rounded-xl
                    bg-[#25D366]
                    text-white
                    font-extrabold
                    text-sm
                    sm:text-base
                    flex
                    items-center
                    justify-center
                    gap-2.5
                    shadow-lg
                    shadow-black/10
                    hover:bg-[#1ebe5d]
                    active:bg-[#19ad54]
                    transition-colors
                  "
                >
                  <MessageCircle className="w-5 h-5" />

                  {t("sendOrder", locale)}
                </motion.button>

                {/* Clear cart */}
                <button
                  type="button"
                  onClick={clearCart}
                  className="
                    w-full
                    mt-2
                    py-1.5
                    text-[11px]
                    font-medium
                    text-muted-foreground/70
                    hover:text-destructive
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
