"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Edit2, Loader2, Plus, Trash2, X } from "lucide-react";

import { axiosGet, axiosPost, axiosPatch, axiosDelete } from "@/lib/axios";
import { formatPrice } from "@/lib/utils";
import type { DeliverySubDestination } from "@/lib/types";

interface SubDestinationManagerProps {
  destinationId: string;
  destinationName: string;
}

type SubFormState = {
  nameAr: string;
  nameEn: string;
  deliveryFee: string;
  isActive: boolean;
};

const EMPTY_FORM: SubFormState = {
  nameAr: "",
  nameEn: "",
  deliveryFee: "",
  isActive: true,
};

/**
 * Expandable, self-contained CRUD panel for the sub-destinations of a
 * single delivery destination. Fully independent of the parent admin
 * panel's hook — drop it inside any row.
 */
export function SubDestinationManager({
  destinationId,
  destinationName,
}: SubDestinationManagerProps) {
  const queryClient = useQueryClient();

  const [editingSub, setEditingSub] = useState<DeliverySubDestination | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState<SubFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const queryKey = ["delivery-sub-destinations", destinationId];

  const {
    data: subDestinationsResponse,
    isLoading,
    isError,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await axiosGet<DeliverySubDestination[]>(
        `destinations/${destinationId}/sub-destinations`,
      );
      if (!response.data) {
        throw new Error(response.message || "Failed to fetch sub-destinations");
      }
      return response.data;
    },
  });

  const subDestinations = subDestinationsResponse ?? [];

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    // Storefront cart uses this key — keep it fresh too.
    queryClient.invalidateQueries({ queryKey: ["delivery-destinations"] });
  };

  const createMutation = useMutation({
    mutationFn: async (payload: SubFormState) =>
      axiosPost(`destinations/${destinationId}/sub-destinations`, {
        nameAr: payload.nameAr.trim(),
        nameEn: payload.nameEn.trim() || null,
        deliveryFee: Number(payload.deliveryFee),
        isActive: payload.isActive,
      }),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) =>
      setFormError(error.message || "Failed to save sub-destination"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: SubFormState;
    }) =>
      axiosPatch(`destinations/${destinationId}/sub-destinations/${id}`, {
        nameAr: payload.nameAr.trim(),
        nameEn: payload.nameEn.trim() || null,
        deliveryFee: Number(payload.deliveryFee),
        isActive: payload.isActive,
      }),
    onSuccess: () => {
      invalidate();
      closeForm();
    },
    onError: (error: Error) =>
      setFormError(error.message || "Failed to update sub-destination"),
  });

  const toggleMutation = useMutation({
    mutationFn: async (sub: DeliverySubDestination) =>
      axiosPatch(`destinations/${destinationId}/sub-destinations/${sub.id}`, {
        isActive: !sub.isActive,
      }),
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) =>
      axiosDelete(`destinations/${destinationId}/sub-destinations/${id}`),
    onMutate: (id: string) => setPendingDeleteId(id),
    onSuccess: () => {
      invalidate();
      setPendingDeleteId(null);
    },
    onError: () => setPendingDeleteId(null),
  });

  const openAddForm = () => {
    setEditingSub(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (sub: DeliverySubDestination) => {
    setEditingSub(sub);
    setForm({
      nameAr: sub.nameAr,
      nameEn: sub.nameEn ?? "",
      deliveryFee: String(sub.deliveryFee),
      isActive: sub.isActive,
    });
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingSub(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  };

  const handleSave = () => {
    if (!form.nameAr.trim()) {
      setFormError("الاسم مطلوب");
      return;
    }

    if (!form.deliveryFee.trim()) {
      setFormError("رسم التوصيل مطلوب");
      return;
    }

    const fee = Number(form.deliveryFee);
    if (Number.isNaN(fee) || fee < 0) {
      setFormError("رسم التوصيل غير صالح");
      return;
    }

    if (editingSub) {
      updateMutation.mutate({ id: editingSub.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="bg-background/40 border border-white/5 rounded-xl px-4 py-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-foreground">
          المناطق الفرعية — {destinationName}
        </p>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة منطقة فرعية
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={`sub-loading-${index}`}
              className="h-10 bg-white/5 rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : isError ? (
        <p className="text-xs text-destructive">تعذر تحميل المناطق الفرعية.</p>
      ) : subDestinations.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          لا توجد مناطق فرعية. إذا لم تُضِف أياً منها، سيُستخدم رسم التوصيل
          العام لهذه المنطقة.
        </p>
      ) : (
        <div className="space-y-1.5">
          {subDestinations.map((sub) => (
            <div
              key={sub.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/3 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {sub.nameAr}
                </p>
                {sub.nameEn && (
                  <p className="text-xs text-muted-foreground truncate">
                    {sub.nameEn}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-bold text-primary">
                  {formatPrice(sub.deliveryFee)}
                </span>

                <button
                  type="button"
                  onClick={() => toggleMutation.mutate(sub)}
                  disabled={toggleMutation.isPending}
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                    sub.isActive
                      ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                      : "bg-white/5 text-muted-foreground hover:bg-white/10"
                  }`}
                >
                  {sub.isActive ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                  {sub.isActive ? "فعال" : "متوقف"}
                </button>

                <button
                  type="button"
                  onClick={() => openEditForm(sub)}
                  className="w-7 h-7 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                  aria-label="تعديل"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => deleteMutation.mutate(sub.id)}
                  disabled={deleteMutation.isPending}
                  className="w-7 h-7 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  aria-label="حذف"
                >
                  {deleteMutation.isPending && pendingDeleteId === sub.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl border border-white/10 bg-white/3 p-4 space-y-3 mt-1">
              {formError && (
                <p className="text-xs text-destructive font-semibold">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  dir="rtl"
                  value={form.nameAr}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      nameAr: event.target.value,
                    }))
                  }
                  placeholder="الاسم بالعربية"
                  className="h-10 bg-background border border-white/10 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                />

                {/* <input
                  type="text"
                  value={form.nameEn}
                  onChange={(event) => setForm((current) => ({ ...current, nameEn: event.target.value }))}
                  placeholder="English name (optional)"
                  className="h-10 bg-background border border-white/10 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                /> */}
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  step="0.25"
                  value={form.deliveryFee}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      deliveryFee: event.target.value,
                    }))
                  }
                  placeholder="رسم التوصيل"
                  className="h-10 flex-1 bg-background border border-white/10 rounded-lg px-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50"
                />

                <button
                  type="button"
                  role="switch"
                  aria-checked={form.isActive}
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      isActive: !current.isActive,
                    }))
                  }
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    form.isActive ? "bg-emerald-500" : "bg-white/10"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                      form.isActive ? "left-6" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="h-9 px-4 rounded-lg bg-white/5 text-foreground text-xs font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {editingSub ? "حفظ التعديلات" : "إضافة"}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
