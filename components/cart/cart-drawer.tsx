"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  MapPin,
  User,
  Phone,
  Pencil,
  Check,
  Loader2,
  StickyNote,
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

const MAX_QTY = 20;
const CONTACT_STORAGE_KEY = "sandweeji_checkout_info";

type ContactInfo = {
  name: string;
  phone: string;
  address: string;
};

function loadSavedContact(): Partial<ContactInfo> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(CONTACT_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);

    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      address: typeof parsed.address === "string" ? parsed.address : "",
    };
  } catch {
    return {};
  }
}

function saveContact(info: ContactInfo) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(info));
  } catch {
    // Storage unavailable (private mode, quota, etc). Non-fatal.
  }
}

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
  const deleteBgOpacity = useTransform(
    dragX,
    [-96, -24, 0, 24, 96],
    [1, 0, 0, 0, 1],
  );

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
          className="
            absolute
            inset-0
            rounded-2xl
            bg-red-500/90
            flex
            items-center
            justify-between
            px-5
            pointer-events-none
          "
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
          className="
            relative
            rounded-2xl
            bg-[#242424]
            p-3
            shadow-[0_8px_30px_rgba(0,0,0,0.18)]
            touch-pan-y
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
                      text-base
                      sm:text-xs
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
                    onClick={handleDecrease}
                    className="
                      w-8
                      h-8
                      sm:w-7
                      sm:h-7
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-white/50
                      hover:text-white
                      hover:bg-[#303030]
                      transition-colors
                    "
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
                    className="
                      w-8
                      h-8
                      sm:w-7
                      sm:h-7
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      text-white/50
                      hover:text-white
                      hover:bg-[#303030]
                      transition-colors
                      disabled:opacity-30
                      disabled:hover:bg-transparent
                    "
                    aria-label={
                      locale === "ar" ? "زيادة الكمية" : "Increase quantity"
                    }
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

/* =========================================================
   Cart Drawer
========================================================= */

type Step = "cart" | "checkout";
type FieldErrors = Partial<Record<"address" | "name" | "phone", string>>;

export default function CartDrawer() {
  const { items, isOpen, closeCart, clearCart, subtotal } = useCartStore();

  const { locale } = useLocaleStore();

  const isRtl = locale === "ar";
  const total = subtotal();
  const totalQuantity = items.reduce(
    (sum: number, item: CartItem) => sum + item.quantity,
    0,
  );

  const [step, setStep] = useState<Step>("cart");
  const [isMobile, setIsMobile] = useState(false);

  const [address, setAddress] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const clearConfirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  // Track viewport for the mobile bottom-sheet vs. desktop side-drawer split.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");

    const update = () => setIsMobile(mq.matches);

    update();
    mq.addEventListener("change", update);

    return () => mq.removeEventListener("change", update);
  }, []);

  // Prefill contact info from the last successful order.
  useEffect(() => {
    const saved = loadSavedContact();

    if (saved.name) setName(saved.name);
    if (saved.phone) setPhone(saved.phone);
    if (saved.address) setAddress(saved.address);
  }, []);

  // Always land on the cart step when the drawer opens.
  useEffect(() => {
    if (isOpen) setStep("cart");
  }, [isOpen]);

  // If the cart empties out while reviewing delivery details, bounce back.
  useEffect(() => {
    if (items.length === 0 && step === "checkout") setStep("cart");
  }, [items.length, step]);

  // Lock page scroll while the drawer is open.
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

  // Close on Escape.
  useEffect(() => {
    if (!isOpen) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  useEffect(() => {
    return () => {
      if (clearConfirmTimeout.current) {
        clearTimeout(clearConfirmTimeout.current);
      }
    };
  }, []);

  const clearFieldError = (field: keyof FieldErrors) => {
    setFieldErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const validate = (): boolean => {
    const errors: FieldErrors = {};

    if (!address.trim()) {
      errors.address = isRtl
        ? "يرجى إدخال عنوان التوصيل."
        : "Please enter your delivery address.";
    }

    if (!name.trim()) {
      errors.name = isRtl ? "يرجى إدخال الاسم." : "Please enter your name.";
    }

    const digitsOnly = phone.replace(/\D/g, "");

    if (!phone.trim()) {
      errors.phone = isRtl
        ? "يرجى إدخال رقم الهاتف."
        : "Please enter your phone number.";
    } else if (digitsOnly.length < 7) {
      errors.phone = isRtl
        ? "رقم الهاتف يبدو غير مكتمل."
        : "That phone number looks incomplete.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const handleContinue = () => {
    setStep("checkout");
  };

  const handleClearClick = () => {
    if (showClearConfirm) {
      if (clearConfirmTimeout.current) {
        clearTimeout(clearConfirmTimeout.current);
      }

      clearCart();
      setShowClearConfirm(false);
      setStep("cart");
      return;
    }

    setShowClearConfirm(true);

    clearConfirmTimeout.current = setTimeout(() => {
      setShowClearConfirm(false);
    }, 3000);
  };

  const canSubmit = useMemo(
    () =>
      address.trim().length > 0 &&
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      items.length > 0,
    [address, name, phone, items.length],
  );

  const handleWhatsAppOrder = () => {
    if (!validate() || items.length === 0 || isSending) return;

    const cleanAddress = address.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanOrderNotes = orderNotes.trim();

    setIsSending(true);

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

    if (cleanOrderNotes) {
      message +=
        locale === "ar"
          ? `\nملاحظات إضافية: ${cleanOrderNotes}`
          : `\nOrder notes: ${cleanOrderNotes}`;
    }

    message += locale === "ar" ? "\n\nشكراً!" : "\n\nThank you!";

    const phoneNumber = RESTAURANT_SETTINGS.whatsappNumber.replace(/\D/g, "");

    const waUrl =
      `https://wa.me/${phoneNumber}` + `?text=${encodeURIComponent(message)}`;

    saveContact({ name: cleanName, phone: cleanPhone, address: cleanAddress });

    // Some mobile browsers block window.open outside a direct tap handler,
    // so fall back to a same-tab navigation if the popup didn't take.
    const opened = window.open(waUrl, "_blank", "noopener,noreferrer");

    window.setTimeout(() => {
      setIsSending(false);

      if (!opened || opened.closed) {
        window.location.href = waUrl;
      }
    }, 350);
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
              Drawer / bottom sheet
          ================================================= */}
          <motion.aside
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={(_event, info) => {
              if (!isMobile) return;

              if (info.offset.y > 120 || info.velocity.y > 500) {
                closeCart();
              }
            }}
            initial={isMobile ? { y: "100%" } : { x: isRtl ? "-100%" : "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: isRtl ? "-100%" : "100%" }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 35,
            }}
            className={`
              fixed
              inset-x-0
              bottom-0
              top-auto
              z-[70]
              w-full
              max-h-[92dvh]
              flex
              flex-col
              overflow-hidden
              bg-[#1B1B1B]
              rounded-t-[28px]
              shadow-[0_-20px_60px_rgba(0,0,0,0.35)]
              sm:inset-y-0
              sm:top-0
              sm:bottom-0
              sm:max-h-none
              sm:h-full
              sm:max-w-[430px]
              sm:rounded-none
              sm:shadow-[-20px_0_60px_rgba(0,0,0,0.35)]
              ${isRtl ? "sm:left-0" : "sm:right-0"}
            `}
            style={{
              overscrollBehavior: "contain",
            }}
            dir={isRtl ? "rtl" : "ltr"}
            onWheel={(event) => {
              event.stopPropagation();
            }}
            onTouchMove={(event) => {
              event.stopPropagation();
            }}
            role="dialog"
            aria-modal="true"
            aria-label={t("yourCart", locale)}
          >
            {/* Drag handle (mobile only) */}
            <div className="shrink-0 pt-2.5 pb-1 sm:hidden">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-white/15" />
            </div>

            {/* =================================================
                Header
            ================================================= */}
            <div
              className="
                shrink-0
                px-5
                sm:px-6
                pt-2
                sm:pt-5
                pb-4
                bg-[#1B1B1B]
              "
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {step === "checkout" ? (
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="
                        w-11
                        h-11
                        rounded-2xl
                        bg-primary/10
                        flex
                        items-center
                        justify-center
                        shrink-0
                        text-primary
                        hover:bg-primary/15
                        active:scale-90
                        transition-all
                      "
                      aria-label={isRtl ? "الرجوع للسلة" : "Back to cart"}
                    >
                      {isRtl ? (
                        <ArrowRight className="w-5 h-5" />
                      ) : (
                        <ArrowLeft className="w-5 h-5" />
                      )}
                    </button>
                  ) : (
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
                  )}

                  <div className="min-w-0">
                    <h2 className="text-lg font-extrabold text-white truncate">
                      {step === "checkout"
                        ? isRtl
                          ? "معلومات التوصيل"
                          : "Delivery details"
                        : t("yourCart", locale)}
                    </h2>

                    <p className="text-xs text-white/35 mt-0.5">
                      {step === "checkout"
                        ? isRtl
                          ? `الخطوة ٢ من ٢`
                          : "Step 2 of 2"
                        : `${totalQuantity} ${t("cartItems", locale)}`}
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
              ) : step === "cart" ? (
                <AnimatePresence mode="popLayout">
                  {items.map((item: CartItem) => (
                    <CartItemRow key={item.id} item={item} />
                  ))}
                </AnimatePresence>
              ) : (
                <motion.div
                  initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="py-4 space-y-4"
                >
                  {/* Compact order summary */}
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="
                      w-full
                      flex
                      items-center
                      justify-between
                      gap-3
                      rounded-2xl
                      bg-[#242424]
                      px-4
                      py-3
                      text-left
                      rtl:text-right
                      hover:bg-[#282828]
                      transition-colors
                    "
                  >
                    <span className="text-xs text-white/45">
                      {totalQuantity} {t("cartItems", locale)} ·{" "}
                      <span className="text-primary font-bold">
                        {formatPrice(total)}
                      </span>
                    </span>

                    <span className="text-[11px] font-semibold text-white/40 shrink-0">
                      {isRtl ? "تعديل" : "Edit"}
                    </span>
                  </button>

                  {/* Address */}
                  <div>
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
                          clearFieldError("address");
                        }}
                        placeholder={
                          isRtl ? "عنوان التوصيل *" : "Delivery address *"
                        }
                        required
                        className={`
                          w-full
                          h-12
                          sm:h-11
                          rounded-xl
                          bg-[#292929]
                          border-0
                          text-white
                          text-base
                          sm:text-sm
                          outline-none
                          placeholder:text-white/25
                          focus:ring-1
                          focus:ring-primary/50
                          transition-all
                          ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                          ${fieldErrors.address ? "ring-1 ring-red-400/60" : ""}
                        `}
                      />
                    </div>

                    {fieldErrors.address && (
                      <p className="text-xs font-semibold text-red-400 mt-1.5 px-1">
                        {fieldErrors.address}
                      </p>
                    )}
                  </div>

                  {/* Name */}
                  <div>
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
                          clearFieldError("name");
                        }}
                        placeholder={isRtl ? "الاسم *" : "Name *"}
                        required
                        className={`
                          w-full
                          h-12
                          sm:h-11
                          rounded-xl
                          bg-[#292929]
                          border-0
                          text-white
                          text-base
                          sm:text-sm
                          outline-none
                          placeholder:text-white/25
                          focus:ring-1
                          focus:ring-primary/50
                          transition-all
                          ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                          ${fieldErrors.name ? "ring-1 ring-red-400/60" : ""}
                        `}
                      />
                    </div>

                    {fieldErrors.name && (
                      <p className="text-xs font-semibold text-red-400 mt-1.5 px-1">
                        {fieldErrors.name}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
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
                        inputMode="tel"
                        value={phone}
                        onChange={(event) => {
                          setPhone(event.target.value);
                          clearFieldError("phone");
                        }}
                        placeholder={isRtl ? "الهاتف *" : "Phone *"}
                        required
                        className={`
                          w-full
                          h-12
                          sm:h-11
                          rounded-xl
                          bg-[#292929]
                          border-0
                          text-white
                          text-base
                          sm:text-sm
                          outline-none
                          placeholder:text-white/25
                          focus:ring-1
                          focus:ring-primary/50
                          transition-all
                          ${isRtl ? "pr-10 pl-3" : "pl-10 pr-3"}
                          ${fieldErrors.phone ? "ring-1 ring-red-400/60" : ""}
                        `}
                      />
                    </div>

                    {fieldErrors.phone && (
                      <p className="text-xs font-semibold text-red-400 mt-1.5 px-1">
                        {fieldErrors.phone}
                      </p>
                    )}
                  </div>

                  {/* Order notes (optional) */}
                  <div className="relative">
                    <StickyNote
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

                    <Textarea
                      value={orderNotes}
                      onChange={(event) => setOrderNotes(event.target.value)}
                      placeholder={
                        isRtl
                          ? "ملاحظات إضافية (اختياري)"
                          : "Order notes — optional"
                      }
                      rows={2}
                      className={`
                        w-full
                        min-h-[64px]
                        rounded-xl
                        bg-[#292929]
                        border-0
                        text-white
                        text-base
                        sm:text-sm
                        outline-none
                        placeholder:text-white/25
                        focus:ring-1
                        focus:ring-primary/50
                        resize-none
                        transition-all
                        ${isRtl ? "pr-10 pl-3 pt-3" : "pl-10 pr-3 pt-3"}
                      `}
                    />
                  </div>
                </motion.div>
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
                  sm:rounded-none
                  px-5
                  sm:px-6
                  pt-4
                  pb-[max(1rem,env(safe-area-inset-bottom))]
                  shadow-[0_-15px_40px_rgba(0,0,0,0.22)]
                "
              >
                {/* Totals */}
                <div className="pb-1">
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

                {step === "cart" ? (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleContinue}
                      className="
                        w-full
                        mt-3
                        h-13
                        rounded-2xl
                        bg-primary
                        text-primary-foreground
                        font-extrabold
                        text-sm
                        sm:text-base
                        flex
                        items-center
                        justify-center
                        gap-2
                        hover:opacity-90
                        transition-opacity
                      "
                    >
                      {isRtl ? (
                        <ArrowLeft className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </motion.button>

                    <button
                      type="button"
                      onClick={handleClearClick}
                      className={`
                        w-full
                        mt-2
                        py-1.5
                        text-[11px]
                        font-medium
                        transition-colors
                        ${
                          showClearConfirm
                            ? "text-red-400 font-bold"
                            : "text-white/25 hover:text-red-400"
                        }
                      `}
                    >
                      {showClearConfirm
                        ? isRtl
                          ? "اضغط مرة أخرى للتأكيد"
                          : "Tap again to confirm"
                        : isRtl
                          ? "مسح السلة"
                          : "Clear cart"}
                    </button>
                  </>
                ) : (
                  <>
                    <motion.button
                      type="button"
                      whileHover={{
                        scale: canSubmit && !isSending ? 1.01 : 1,
                      }}
                      whileTap={{
                        scale: canSubmit && !isSending ? 0.98 : 1,
                      }}
                      onClick={handleWhatsAppOrder}
                      disabled={isSending}
                      className="
                        w-full
                        mt-3
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
                        disabled:opacity-70
                        transition-colors
                      "
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5" />
                      )}

                      {t("sendOrder", locale)}
                    </motion.button>

                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="
                        w-full
                        mt-2
                        py-1.5
                        text-[11px]
                        font-medium
                        text-white/25
                        hover:text-white/50
                        transition-colors
                      "
                    >
                      {isRtl ? "الرجوع للسلة" : "Back to cart"}
                    </button>
                  </>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
