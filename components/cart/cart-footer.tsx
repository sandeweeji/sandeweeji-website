"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, Truck } from "lucide-react";

import whatsapp from "@/public/whatsapp.png";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";

type Step = "cart" | "checkout";

interface CartFooterProps {
  isRtl: boolean;
  locale: string;
  step: Step;
  total: number;
  deliveryFee: number;
  hasDestination: boolean;
  grandTotal: number;
  canSubmit: boolean;
  isSending: boolean;
  showClearConfirm: boolean;
  onContinue: () => void;
  onClearClick: () => void;
  onSendOrder: () => void;
  onBackToCart: () => void;
}

export function CartFooter({
  isRtl,
  locale,
  step,
  total,
  deliveryFee,
  hasDestination,
  grandTotal,
  canSubmit,
  isSending,
  showClearConfirm,
  onContinue,
  onClearClick,
  onSendOrder,
  onBackToCart,
}: CartFooterProps) {
  return (
    <div className="shrink-0 bg-[#202020] rounded-t-[28px] sm:rounded-none px-5 sm:px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_-15px_40px_rgba(0,0,0,0.22)]">
      {/* Totals */}
      <div className="pb-1">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/40">{t("subtotal", locale)}</span>
          <span className="text-sm font-semibold text-white/70">{formatPrice(total)}</span>
        </div>

        {hasDestination && (
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-white/40 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              {isRtl ? "رسم التوصيل" : "Delivery fee"}
            </span>
            <span className="text-sm font-semibold text-white/70">
              {deliveryFee > 0 ? formatPrice(deliveryFee) : isRtl ? "مجاني" : "Free"}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          <span className="text-base font-extrabold text-white">{t("total", locale)}</span>
          <span className="text-xl font-extrabold text-primary">{formatPrice(grandTotal)}</span>
        </div>
      </div>

      {step === "cart" ? (
        <>
          <motion.button
            type="button"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onContinue}
            className="w-full mt-3 h-13 rounded-2xl bg-primary text-primary-foreground font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
          >
            {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
          </motion.button>

          <button
            type="button"
            onClick={onClearClick}
            className={`w-full mt-2 py-1.5 text-[11px] font-medium transition-colors ${
              showClearConfirm ? "text-red-400 font-bold" : "text-white/25 hover:text-red-400"
            }`}
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
            whileHover={{ scale: canSubmit && !isSending ? 1.01 : 1 }}
            whileTap={{ scale: canSubmit && !isSending ? 0.98 : 1 }}
            onClick={onSendOrder}
            disabled={isSending}
            className="w-full mt-3 h-13 rounded-2xl bg-[#25D366] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_8px_25px_rgba(37,211,102,0.16)] hover:bg-[#1ebe5d] active:bg-[#19ad54] disabled:opacity-70 transition-colors"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Image src={whatsapp} alt="WhatsApp" className="w-6 h-6" />
            )}
            {t("sendOrder", locale)}
          </motion.button>

          <button
            type="button"
            onClick={onBackToCart}
            className="w-full mt-2 py-1.5 text-[11px] font-medium text-white/25 hover:text-white/50 transition-colors"
          >
            {isRtl ? "الرجوع للسلة" : "Back to cart"}
          </button>
        </>
      )}
    </div>
  );
}
