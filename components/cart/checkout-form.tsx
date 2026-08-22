"use client";

import { motion } from "framer-motion";
import { MapPin, Phone, StickyNote, User } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/utils";
import type { DeliveryDestination, DeliverySubDestination } from "@/lib/types";
import { DeliveryAreaPicker } from "./delivery-area-picker";

export type FieldErrors = Partial<
  Record<"address" | "name" | "phone" | "destination", string>
>;

interface CheckoutFormProps {
  isRtl: boolean;
  totalQuantity: number;
  total: number;
  onEditCart: () => void;

  destinations: DeliveryDestination[];
  destinationsLoading: boolean;
  destinationsError: boolean;
  destinationId: string | null;
  subDestinationId: string | null;
  onSelectDestination: (destination: DeliveryDestination) => void;
  onSelectSubDestination: (sub: DeliverySubDestination) => void;
  onClearDestination: () => void;

  address: string;
  onAddressChange: (value: string) => void;
  name: string;
  onNameChange: (value: string) => void;
  phone: string;
  onPhoneChange: (value: string) => void;
  orderNotes: string;
  onOrderNotesChange: (value: string) => void;

  fieldErrors: FieldErrors;
}

export function CheckoutForm({
  isRtl,
  totalQuantity,
  total,
  onEditCart,
  destinations,
  destinationsLoading,
  destinationsError,
  destinationId,
  subDestinationId,
  onSelectDestination,
  onSelectSubDestination,
  onClearDestination,
  address,
  onAddressChange,
  name,
  onNameChange,
  phone,
  onPhoneChange,
  orderNotes,
  onOrderNotesChange,
  fieldErrors,
}: CheckoutFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: isRtl ? -16 : 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className="py-4 space-y-4"
    >
      {/* Compact order summary */}
      <button
        type="button"
        onClick={onEditCart}
        className="w-full flex items-center justify-between gap-3 rounded-2xl bg-[#242424] px-4 py-3 text-left rtl:text-right hover:bg-[#282828] transition-colors"
      >
        <span className="text-xs text-white/45">
          {totalQuantity} {isRtl ? "عناصر" : "items"} ·{" "}
          <span className="text-primary font-bold">{formatPrice(total)}</span>
        </span>

        <span className="text-[11px] font-semibold text-white/40 shrink-0">
          {isRtl ? "تعديل" : "Edit"}
        </span>
      </button>

      {/* Delivery area */}
      <div>
        <p className="text-xs font-bold text-white/50 mb-2 px-1">
          {isRtl ? "منطقة التوصيل *" : "Delivery area *"}
        </p>

        <DeliveryAreaPicker
          isRtl={isRtl}
          destinations={destinations}
          isLoading={destinationsLoading}
          isError={destinationsError}
          destinationId={destinationId}
          subDestinationId={subDestinationId}
          onSelectDestination={onSelectDestination}
          onSelectSubDestination={onSelectSubDestination}
          onClear={onClearDestination}
          errorMessage={fieldErrors.destination}
        />
      </div>

      {/* Address details */}
      <div>
        <div className="relative">
          <MapPin
            className={`absolute top-3.5 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-primary pointer-events-none z-10`}
          />
          <input
            type="text"
            value={address}
            onChange={(event) => onAddressChange(event.target.value)}
            placeholder={
              isRtl
                ? "تفاصيل العنوان (شارع، مبنى، طابق) *"
                : "Address details (street, building, floor) *"
            }
            required
            className={`w-full h-12 sm:h-11 rounded-xl bg-[#292929] border-0 text-white text-base sm:text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${
              isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
            } ${fieldErrors.address ? "ring-1 ring-red-400/60" : ""}`}
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
            className={`absolute top-3.5 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-white/30 pointer-events-none z-10`}
          />
          <input
            type="text"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder={isRtl ? "الاسم *" : "Name *"}
            required
            className={`w-full h-12 sm:h-11 rounded-xl bg-[#292929] border-0 text-white text-base sm:text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${
              isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
            } ${fieldErrors.name ? "ring-1 ring-red-400/60" : ""}`}
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
            className={`absolute top-3.5 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-white/30 pointer-events-none z-10`}
          />
          <input
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(event) => onPhoneChange(event.target.value)}
            placeholder={isRtl ? "الهاتف *" : "Phone *"}
            required
            className={`w-full h-12 sm:h-11 rounded-xl bg-[#292929] border-0 text-white text-base sm:text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 transition-all ${
              isRtl ? "pr-10 pl-3" : "pl-10 pr-3"
            } ${fieldErrors.phone ? "ring-1 ring-red-400/60" : ""}`}
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
          className={`absolute top-3.5 ${isRtl ? "right-3" : "left-3"} w-4 h-4 text-white/30 pointer-events-none z-10`}
        />
        <Textarea
          value={orderNotes}
          onChange={(event) => onOrderNotesChange(event.target.value)}
          placeholder={
            isRtl ? "ملاحظات إضافية (اختياري)" : "Order notes — optional"
          }
          rows={2}
          className={`w-full min-h-[64px] rounded-xl bg-[#292929] border-0 text-white text-base sm:text-sm outline-none placeholder:text-white/25 focus:ring-1 focus:ring-primary/50 resize-none transition-all ${
            isRtl ? "pr-10 pl-3 pt-3" : "pl-10 pr-3 pt-3"
          }`}
        />
      </div>
    </motion.div>
  );
}
