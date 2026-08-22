"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { X, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

import { axiosGet } from "@/lib/axios";
import { useCartStore } from "@/lib/cart-store";
import { useLocaleStore } from "@/lib/locale-store";
import { t } from "@/lib/i18n";
import { RESTAURANT_SETTINGS } from "@/lib/data";
import {
  loadSavedContact,
  saveContact,
  loadSavedDestinationId,
  saveDestinationId,
  loadSavedSubDestinationId,
  saveSubDestinationId,
} from "@/lib/checkout-storage";
import {
  getActiveSubDestinations,
  getEffectiveDeliveryFee,
  requiresSubDestination,
} from "@/lib/delivery";
import { buildOrderMessage } from "@/lib/build-order-message";
import type {
  CartItem,
  DeliveryDestination,
  DeliverySubDestination,
} from "@/lib/types";

import { CartList } from "@/components/cart/cart-list";
import {
  CheckoutForm,
  type FieldErrors,
} from "@/components/cart/checkout-form";
import { CartFooter } from "@/components/cart/cart-footer";

type Step = "cart" | "checkout";

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

  const [destinationId, setDestinationId] = useState<string | null>(null);
  const [subDestinationId, setSubDestinationId] = useState<string | null>(null);

  const clearConfirmTimeout = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  /* ------------------------------------------------------------------------ */
  /* Delivery destinations                                                    */
  /* ------------------------------------------------------------------------ */

  const {
    data: destinationsResponse,
    isLoading: destinationsLoading,
    isError: destinationsError,
  } = useQuery({
    queryKey: ["delivery-destinations"],
    queryFn: async () => {
      const response = await axiosGet<DeliveryDestination[]>("destinations");

      if (!response.data) {
        throw new Error(response.message || "Failed to fetch delivery areas");
      }

      return response.data;
    },
    enabled: isOpen,
    staleTime: 5 * 60 * 1000,
  });

  const destinations = destinationsResponse ?? [];

  const selectedDestination = useMemo(
    () => destinations.find((d) => d.id === destinationId) ?? null,
    [destinations, destinationId],
  );

  const selectedSubDestination = useMemo(() => {
    if (!selectedDestination) return null;
    return (
      getActiveSubDestinations(selectedDestination).find(
        (s) => s.id === subDestinationId,
      ) ?? null
    );
  }, [selectedDestination, subDestinationId]);

  const deliveryFee = getEffectiveDeliveryFee(
    selectedDestination,
    subDestinationId,
  );
  const grandTotal = total + deliveryFee;

  const hasCompleteDestination = Boolean(
    selectedDestination && selectedSubDestination,
  );

  // Track viewport for the mobile bottom-sheet vs. desktop side-drawer split.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Prefill contact info + delivery area from the last successful order.
  useEffect(() => {
    const saved = loadSavedContact();
    if (saved.name) setName(saved.name);
    if (saved.phone) setPhone(saved.phone);
    if (saved.address) setAddress(saved.address);

    const savedDestinationId = loadSavedDestinationId();
    if (savedDestinationId) setDestinationId(savedDestinationId);

    const savedSubDestinationId = loadSavedSubDestinationId();
    if (savedSubDestinationId) setSubDestinationId(savedSubDestinationId);
  }, []);

  // If a previously-saved destination (or sub-destination) was deactivated
  // or removed, drop it once the live list comes back instead of silently
  // charging a stale fee.
  useEffect(() => {
    if (!destinationId || destinationsLoading) return;

    const destination = destinations.find((d) => d.id === destinationId);

    if (!destination || !destination.isActive) {
      setDestinationId(null);
      setSubDestinationId(null);
      return;
    }

    if (requiresSubDestination(destination) && subDestinationId) {
      const stillValidSub = getActiveSubDestinations(destination).some(
        (s) => s.id === subDestinationId,
      );
      if (!stillValidSub) setSubDestinationId(null);
    }
  }, [destinationId, subDestinationId, destinations, destinationsLoading]);

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

    if (!selectedDestination) {
      errors.destination = isRtl
        ? "يرجى اختيار منطقة التوصيل."
        : "Please select a delivery area.";
    } else if (!selectedSubDestination) {
      errors.subDestination = isRtl
        ? "يرجى اختيار المنطقة الفرعية."
        : "Please select a specific sub-area.";
    }

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

  const handleClearClick = () => {
    if (showClearConfirm) {
      if (clearConfirmTimeout.current)
        clearTimeout(clearConfirmTimeout.current);
      clearCart();
      setShowClearConfirm(false);
      setStep("cart");
      return;
    }

    setShowClearConfirm(true);
    clearConfirmTimeout.current = setTimeout(
      () => setShowClearConfirm(false),
      3000,
    );
  };

  const handleSelectDestination = (destination: DeliveryDestination) => {
    setDestinationId(destination.id);
    saveDestinationId(destination.id);

    if (destination.id !== destinationId) {
      setSubDestinationId(null);
      saveSubDestinationId(null);
    }

    clearFieldError("destination");
    clearFieldError("subDestination");
  };

  const handleSelectSubDestination = (sub: DeliverySubDestination) => {
    setSubDestinationId(sub.id);
    saveSubDestinationId(sub.id);
    clearFieldError("subDestination");
  };

  const handleClearDestination = () => {
    setDestinationId(null);
    setSubDestinationId(null);
    saveDestinationId(null);
    saveSubDestinationId(null);
  };

  const canSubmit = useMemo(
    () =>
      hasCompleteDestination &&
      address.trim().length > 0 &&
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      items.length > 0,
    [hasCompleteDestination, address, name, phone, items.length],
  );

  const handleWhatsAppOrder = () => {
    if (!validate() || items.length === 0 || isSending) return;

    const cleanAddress = address.trim();
    const cleanName = name.trim();
    const cleanPhone = phone.trim();
    const cleanOrderNotes = orderNotes.trim();

    setIsSending(true);

    const message = buildOrderMessage({
      items,
      locale,
      total,
      destination: selectedDestination,
      subDestination: selectedSubDestination,
      address: cleanAddress,
      name: cleanName,
      phone: cleanPhone,
      orderNotes: cleanOrderNotes,
    });

    const phoneNumber = RESTAURANT_SETTINGS.whatsappNumber.replace(/\D/g, "");
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    // Contact + delivery area are kept for next time (repeat-order
    // convenience); only the cart itself needs to empty.
    saveContact({ name: cleanName, phone: cleanPhone, address: cleanAddress });

    // Some mobile browsers block window.open outside a direct tap handler,
    // so fall back to a same-tab navigation if the popup didn't take.
    const opened = window.open(waUrl, "_blank", "noopener,noreferrer");

    clearCart();
    setOrderNotes("");
    closeCart();

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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60] bg-black/75 backdrop-blur-[6px]"
          />

          {/* Drawer / bottom sheet */}
          <motion.aside
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.55 }}
            onDragEnd={(_event, info) => {
              if (!isMobile) return;
              if (info.offset.y > 120 || info.velocity.y > 500) closeCart();
            }}
            initial={isMobile ? { y: "100%" } : { x: isRtl ? "-100%" : "100%" }}
            animate={isMobile ? { y: 0 } : { x: 0 }}
            exit={isMobile ? { y: "100%" } : { x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 35 }}
            className={`fixed inset-x-0 bottom-0 top-auto z-[70] w-full max-h-[92dvh] flex flex-col overflow-hidden bg-[#1B1B1B] rounded-t-[28px] shadow-[0_-20px_60px_rgba(0,0,0,0.35)] sm:inset-y-0 sm:top-0 sm:bottom-0 sm:max-h-none sm:h-full sm:max-w-[430px] sm:rounded-none sm:shadow-[-20px_0_60px_rgba(0,0,0,0.35)] ${
              isRtl ? "sm:left-0" : "sm:right-0"
            }`}
            style={{ overscrollBehavior: "contain" }}
            dir={isRtl ? "rtl" : "ltr"}
            onWheel={(event) => event.stopPropagation()}
            onTouchMove={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t("yourCart", locale)}
          >
            {/* Drag handle (mobile only) */}
            <div className="shrink-0 pt-2.5 pb-1 sm:hidden">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-white/15" />
            </div>

            {/* Header */}
            <div className="shrink-0 px-5 sm:px-6 pt-2 sm:pt-5 pb-4 bg-[#1B1B1B]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {step === "checkout" ? (
                    <button
                      type="button"
                      onClick={() => setStep("cart")}
                      className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 text-primary hover:bg-primary/15 active:scale-90 transition-all"
                      aria-label={isRtl ? "الرجوع للسلة" : "Back to cart"}
                    >
                      {isRtl ? (
                        <ArrowRight className="w-5 h-5" />
                      ) : (
                        <ArrowLeft className="w-5 h-5" />
                      )}
                    </button>
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
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
                          ? "الخطوة ٢ من ٢"
                          : "Step 2 of 2"
                        : `${totalQuantity} ${t("cartItems", locale)}`}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-10 h-10 rounded-xl bg-[#252525] flex items-center justify-center text-white/50 hover:text-white hover:bg-[#303030] active:scale-90 transition-all"
                  aria-label={locale === "ar" ? "إغلاق السلة" : "Close cart"}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 sm:px-5 scrollbar-hide"
              style={{
                WebkitOverflowScrolling: "touch",
                overscrollBehavior: "contain",
              }}
            >
              {step === "cart" ? (
                <CartList
                  items={items}
                  locale={locale}
                  isRtl={isRtl}
                  onBrowseMenu={closeCart}
                />
              ) : (
                <CheckoutForm
                  isRtl={isRtl}
                  totalQuantity={totalQuantity}
                  total={total}
                  onEditCart={() => setStep("cart")}
                  destinations={destinations}
                  destinationsLoading={destinationsLoading}
                  destinationsError={destinationsError}
                  destinationId={destinationId}
                  subDestinationId={subDestinationId}
                  onSelectDestination={handleSelectDestination}
                  onSelectSubDestination={handleSelectSubDestination}
                  onClearDestination={handleClearDestination}
                  address={address}
                  onAddressChange={(value) => {
                    setAddress(value);
                    clearFieldError("address");
                  }}
                  name={name}
                  onNameChange={(value) => {
                    setName(value);
                    clearFieldError("name");
                  }}
                  phone={phone}
                  onPhoneChange={(value) => {
                    setPhone(value);
                    clearFieldError("phone");
                  }}
                  orderNotes={orderNotes}
                  onOrderNotesChange={setOrderNotes}
                  fieldErrors={fieldErrors}
                />
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <CartFooter
                isRtl={isRtl}
                locale={locale}
                step={step}
                total={total}
                deliveryFee={deliveryFee}
                hasDestination={Boolean(selectedDestination)}
                grandTotal={grandTotal}
                canSubmit={canSubmit}
                isSending={isSending}
                showClearConfirm={showClearConfirm}
                onContinue={() => setStep("checkout")}
                onClearClick={handleClearClick}
                onSendOrder={handleWhatsAppOrder}
                onBackToCart={() => setStep("cart")}
              />
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
