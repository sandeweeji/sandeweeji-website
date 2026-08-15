"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertTriangle } from "lucide-react";
import type { Category } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Common emoji shortlist — Youssef can still type any emoji manually.       */
/* -------------------------------------------------------------------------- */

const EMOJI_SUGGESTIONS = [
  "🍔", "🍕", "🌯", "🍗", "🥗", "🍟", "🥤", "🍰", "🍝", "🍣", "🥙", "🍛",
];

export interface CategoryFormPayload {
  id?: string;
  nameAr: string;
  nameEn: string;
  emoji: string;
  visible: boolean;
  sortOrder: number;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSave: (payload: CategoryFormPayload) => Promise<void>;
}

interface CategoryFormState {
  nameAr: string;
  nameEn: string;
  emoji: string;
  visible: boolean;
  sortOrder: string;
}

function buildInitialState(category?: Category | null): CategoryFormState {
  return {
    nameAr: category?.nameAr ?? "",
    nameEn: category?.nameEn ?? "",
    emoji: category?.emoji ?? "",
    visible: category?.visible ?? true,
    sortOrder:
      category?.sortOrder !== undefined ? String(category.sortOrder) : "0",
  };
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  category,
  onSave,
}: CategoryFormModalProps) {
  const isEditMode = Boolean(category?.id);

  const [form, setForm] = useState<CategoryFormState>(() =>
    buildInitialState(category),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setForm(buildInitialState(category));
    setErrors({});
    setSubmitError(null);
  }, [isOpen, category]);

  const update = <K extends keyof CategoryFormState>(
    key: K,
    value: CategoryFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.nameAr.trim()) {
      next.nameAr = "اسم التصنيف مطلوب";
    }

    if (!form.emoji.trim()) {
      next.emoji = "الرمز التعبيري مطلوب";
    }

    if (form.sortOrder.trim() && Number.isNaN(Number(form.sortOrder))) {
      next.sortOrder = "أدخل رقمًا صحيحًا";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSave({
        id: category?.id,
        nameAr: form.nameAr.trim(),
        nameEn: form.nameEn.trim(),
        emoji: form.emoji.trim(),
        visible: form.visible,
        sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
      });

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "حدث خطأ. حاول مرة أخرى.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && onClose()}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            dir="rtl"
            className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl scrollbar-hide"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-card/95 backdrop-blur-sm border-b border-white/5">
              <h2 className="text-lg font-extrabold text-foreground">
                {isEditMode ? "تعديل التصنيف" : "إضافة تصنيف جديد"}
              </h2>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Emoji + name preview */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-white/10">
                <div className="w-12 h-12 rounded-xl bg-card border border-white/10 flex items-center justify-center text-2xl shrink-0">
                  {form.emoji || "❓"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {form.nameAr || "اسم التصنيف"}
                  </p>
                  <p className="text-xs text-muted-foreground">معاينة</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  الرمز التعبيري
                </label>

                <input
                  value={form.emoji}
                  onChange={(event) => update("emoji", event.target.value)}
                  placeholder="🍔"
                  className={inputCls(errors.emoji)}
                />

                <div className="flex flex-wrap gap-2 pt-1">
                  {EMOJI_SUGGESTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => update("emoji", emoji)}
                      className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center border transition-colors ${
                        form.emoji === emoji
                          ? "bg-primary/20 border-primary/40"
                          : "bg-surface border-white/10 hover:border-primary/30"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {errors.emoji && (
                  <p className="text-xs text-destructive">{errors.emoji}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  اسم التصنيف
                </label>
                <input
                  value={form.nameAr}
                  onChange={(event) => update("nameAr", event.target.value)}
                  placeholder="مثال: مشاوي"
                  className={inputCls(errors.nameAr)}
                />
                {errors.nameAr && (
                  <p className="text-xs text-destructive">{errors.nameAr}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  الاسم بالإنكليزية (اختياري)
                </label>
                <input
                  dir="ltr"
                  value={form.nameEn}
                  onChange={(event) => update("nameEn", event.target.value)}
                  placeholder="Grills"
                  className={inputCls()}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    ترتيب العرض
                  </label>
                  <input
                    inputMode="numeric"
                    value={form.sortOrder}
                    onChange={(event) => update("sortOrder", event.target.value)}
                    placeholder="0"
                    className={inputCls(errors.sortOrder)}
                  />
                  {errors.sortOrder && (
                    <p className="text-xs text-destructive">{errors.sortOrder}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">
                    الظهور في القائمة
                  </label>
                  <button
                    type="button"
                    onClick={() => update("visible", !form.visible)}
                    className={`w-full h-11 flex items-center justify-between px-4 rounded-xl border transition-colors ${
                      form.visible
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "bg-surface border-white/10 text-muted-foreground"
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      {form.visible ? "ظاهر" : "مخفي"}
                    </span>
                    <span
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        form.visible ? "bg-primary" : "bg-white/10"
                      }`}
                    >
                      <motion.span
                        layout
                        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow"
                        style={{ left: form.visible ? 18 : 2 }}
                      />
                    </span>
                  </button>
                </div>
              </div>

              {submitError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {submitError}
                </div>
              )}

              <motion.button
                type="button"
                whileTap={{ scale: 0.97 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors glow-brand disabled:opacity-60"
              >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditMode ? "حفظ التعديلات" : "إضافة التصنيف"}
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function inputCls(error?: string) {
  return `w-full h-11 bg-surface border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 px-4 focus:outline-none transition-colors ${
    error
      ? "border-destructive/60 focus:border-destructive"
      : "border-white/10 focus:border-primary/50"
  }`;
}
