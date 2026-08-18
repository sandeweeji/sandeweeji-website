"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, X } from "lucide-react";

import type {
  DeliveryDestination,
  DeliveryFormState,
} from "@/components/admin/types";

interface DeliveryDestinationModalProps {
  isOpen: boolean;
  selectedDeliveryDestination: DeliveryDestination | null;
  deliveryForm: DeliveryFormState;
  onFormChange: (updater: (current: DeliveryFormState) => DeliveryFormState) => void;
  deliveryFormError: string | null;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function DeliveryDestinationModal({
  isOpen,
  selectedDeliveryDestination,
  deliveryForm,
  onFormChange,
  deliveryFormError,
  isSaving,
  onClose,
  onSave,
}: DeliveryDestinationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              onClose();
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="w-full max-w-lg bg-card border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {selectedDeliveryDestination
                    ? "تعديل منطقة التوصيل"
                    : "إضافة منطقة توصيل"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  حدد اسم المنطقة ورسم التوصيل.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="w-9 h-9 rounded-xl hover:bg-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="إغلاق"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {deliveryFormError && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 px-4 py-3 text-sm text-destructive">
                  {deliveryFormError}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  الاسم بالعربية
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={deliveryForm.nameAr}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      nameAr: event.target.value,
                    }))
                  }
                  placeholder="مثلاً: الحمرا"
                  className="w-full h-11 bg-background border border-white/10 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    رسم التوصيل
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      L.L
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={deliveryForm.deliveryFee}
                      onChange={(event) =>
                        onFormChange((current) => ({
                          ...current,
                          deliveryFee: event.target.value,
                        }))
                      }
                      placeholder="100000"
                      className="w-full h-11 bg-background border border-white/10 rounded-xl pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-white/3 border border-white/10 px-4 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    متاحة للعملاء
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    المناطق المتوقفة لن تظهر أثناء الطلب.
                  </p>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={deliveryForm.isActive}
                  onClick={() =>
                    onFormChange((current) => ({
                      ...current,
                      isActive: !current.isActive,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    deliveryForm.isActive ? "bg-emerald-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      deliveryForm.isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-5 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-white/5 text-foreground text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>

              <button
                type="button"
                onClick={onSave}
                disabled={isSaving}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ الحفظ...
                  </>
                ) : selectedDeliveryDestination ? (
                  "حفظ التعديلات"
                ) : (
                  "إضافة المنطقة"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
