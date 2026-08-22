"use client";

import { Fragment, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Edit2,
  Loader2,
  MapPin,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { formatPrice } from "@/lib/utils";
import type { DeliveryDestination } from "@/components/admin/types";
import { SubDestinationManager } from "@/components/admin/sub-destination-manager";

interface DeliveryTabProps {
  deliveryDestinationsLoading: boolean;
  deliveryDestinationsError: boolean;
  sortedDeliveryDestinations: DeliveryDestination[];
  isDeliveryActionPending: boolean;
  deliveryDestinationPendingDeleteId: string | null;
  isDeletingDestination: boolean;
  onAdd: () => void;
  onEdit: (destination: DeliveryDestination) => void;
  onToggle: (destination: DeliveryDestination) => void;
  onRequestDelete: (destination: DeliveryDestination) => void;
  onRetry: () => void;
}

export function DeliveryTab({
  deliveryDestinationsLoading,
  deliveryDestinationsError,
  sortedDeliveryDestinations,
  isDeliveryActionPending,
  deliveryDestinationPendingDeleteId,
  isDeletingDestination,
  onAdd,
  onEdit,
  onToggle,
  onRequestDelete,
  onRetry,
}: DeliveryTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  return (
    <motion.div
      key="delivery"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-extrabold text-foreground">
            مناطق التوصيل
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة مناطق التوصيل ورسوم كل منطقة. اضغط على السهم لإدارة المناطق
            الفرعية.
          </p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={isDeliveryActionPending}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          إضافة منطقة
        </button>
      </div>

      {deliveryDestinationsLoading ? (
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`delivery-loading-${index}`}
                className="h-16 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      ) : deliveryDestinationsError ? (
        <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
          <p className="text-sm text-destructive">
            حدث خطأ أثناء تحميل مناطق التوصيل.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 text-sm font-semibold text-destructive underline"
          >
            إعادة المحاولة
          </button>
        </div>
      ) : sortedDeliveryDestinations.length === 0 ? (
        <div className="bg-card border border-white/10 rounded-2xl px-6 py-14 text-center">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            لا توجد مناطق توصيل بعد
          </h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
            أضف المناطق التي يصل إليها المطعم وحدد رسم التوصيل لكل منطقة.
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            إضافة أول منطقة
          </button>
        </div>
      ) : (
        <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-8" />
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    المنطقة
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    رسم التوصيل
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    الحالة
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    الترتيب
                  </th>
                  <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                    الإجراءات
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {sortedDeliveryDestinations.map((destination) => {
                  const isExpanded = expandedId === destination.id;

                  return (
                    <Fragment key={destination.id}>
                      <tr
                        key={destination.id}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        <td className="px-2 py-4">
                          <button
                            type="button"
                            onClick={() => toggleExpanded(destination.id)}
                            className="w-7 h-7 rounded-lg hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="إدارة المناطق الفرعية"
                          >
                            <ChevronDown
                              className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                            />
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                              <MapPin className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground truncate">
                                {destination.nameAr}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {destination.nameEn}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(Number(destination.deliveryFee))}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={() => onToggle(destination)}
                            disabled={isDeliveryActionPending}
                            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                              destination.isActive
                                ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                                : "bg-white/5 text-muted-foreground hover:bg-white/10"
                            }`}
                          >
                            {destination.isActive ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                فعال
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                متوقف
                              </>
                            )}
                          </button>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-muted-foreground">
                            {destination.sortOrder}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onEdit(destination)}
                              disabled={isDeliveryActionPending}
                              className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                              aria-label="تعديل"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => onRequestDelete(destination)}
                              disabled={isDeliveryActionPending}
                              className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                              aria-label="حذف"
                            >
                              {isDeletingDestination &&
                              deliveryDestinationPendingDeleteId ===
                                destination.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr key={`${destination.id}-expanded`}>
                          <td colSpan={6} className="px-5 pb-5 pt-0 bg-white/2">
                            <AnimatePresence>
                              <motion.div
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                              >
                                <SubDestinationManager
                                  destinationId={destination.id}
                                  destinationName={destination.nameAr}
                                />
                              </motion.div>
                            </AnimatePresence>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </motion.div>
  );
}
