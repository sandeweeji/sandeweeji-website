"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Loader2, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Category, ExtraType, Badge } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

// Keep English fields in the data model for future purposes.
// The current admin UI only displays and edits Arabic.

const BADGE_OPTIONS: {
  value: Badge;
  label: string;
}[] = [
  {
    value: "popular",
    label: "شعبي",
  },
  {
    value: "new",
    label: "جديد",
  },
  {
    value: "spicy",
    label: "🌶 حار",
  },
  {
    value: "meal",
    label: "وجبة",
  },
  {
    value: "bestseller",
    label: "الأكثر مبيعًا",
  },
  {
    value: "limited",
    label: "محدود",
  },
];

interface ExtraRow {
  key: string;
  id?: string;
  type: ExtraType;

  // Kept for future English support.
  // nameEn: string;

  nameAr: string;
  price: string;
}

export interface ProductFormPayload {
  id?: string;

  categoryId: string;

  // Kept for future English support.
  // nameEn: string;

  nameAr: string;

  // Kept for future English support.
  // descriptionEn: string;

  descriptionAr: string;

  price: number;
  image: string;
  calories: number | null;

  badges: Badge[];

  available: boolean;

  extras: {
    id?: string;
    type: ExtraType;

    // Kept for future English support.
    // nameEn?: string | null;

    nameAr: string;
    price: number;
  }[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;

  /** Existing product = edit mode. No product = create mode. */
  product?: Product | null;

  categories: Category[];

  onSave: (payload: ProductFormPayload) => Promise<void>;

  /** Only used in edit mode. */
  onDelete?: (productId: string) => Promise<void>;
}

/* -------------------------------------------------------------------------- */
/* Form state                                                                 */
/* -------------------------------------------------------------------------- */

interface ProductFormState {
  categoryId: string;

  // Kept for future English support.
  // nameEn: string;

  nameAr: string;

  // Kept for future English support.
  // descriptionEn: string;

  descriptionAr: string;

  price: string;
  image: string;
  calories: string;

  badges: Badge[];

  available: boolean;

  extras: ExtraRow[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const emptyExtraRow = (type: ExtraType): ExtraRow => ({
  key: crypto.randomUUID(),
  type,

  // Future English support:
  // nameEn: "",

  nameAr: "",

  price: "",
});

function buildInitialState(product?: Product | null): ProductFormState {
  return {
    categoryId: product?.categoryId ?? "",

    // Future English support:
    // nameEn: product?.nameEn ?? "",

    nameAr: product?.nameAr ?? "",

    // Future English support:
    // descriptionEn: product?.descriptionEn ?? "",

    descriptionAr: product?.descriptionAr ?? "",

    price:
      product?.price !== undefined && product?.price !== null
        ? String(product.price)
        : "",

    image: product?.image ?? "",

    calories:
      product?.calories !== undefined && product?.calories !== null
        ? String(product.calories)
        : "",

    badges: product?.badges ?? [],

    available: product?.available ?? true,

    extras: (product?.extras ?? []).map((extra) => ({
      key: crypto.randomUUID(),
      id: extra.id,
      type: extra.type,

      // Future English support:
      // nameEn: extra.nameEn ?? "",

      nameAr: extra.nameAr,
      price: String(extra.price ?? 0),
    })),
  };
}

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function ProductFormModal({
  isOpen,
  onClose,
  product,
  categories,
  onSave,
  onDelete,
}: ProductFormModalProps) {
  const isEditMode = Boolean(product?.id);

  const [form, setForm] = useState<ProductFormState>(() =>
    buildInitialState(product),
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  /* ------------------------------------------------------------------------ */
  /* Reset                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!isOpen) return;

    setForm(buildInitialState(product));
    setErrors({});
    setSubmitError(null);
    setConfirmingDelete(false);
  }, [isOpen, product]);

  /* ------------------------------------------------------------------------ */
  /* Update helpers                                                           */
  /* ------------------------------------------------------------------------ */

  const update = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleBadge = (badge: Badge) => {
    setForm((prev) => ({
      ...prev,

      badges: prev.badges.includes(badge)
        ? prev.badges.filter((item) => item !== badge)
        : [...prev.badges, badge],
    }));
  };

  const addExtraRow = (type: ExtraType) => {
    setForm((prev) => ({
      ...prev,
      extras: [...prev.extras, emptyExtraRow(type)],
    }));
  };

  const updateExtraRow = (
    key: string,
    field: keyof ExtraRow,
    value: string,
  ) => {
    setForm((prev) => ({
      ...prev,

      extras: prev.extras.map((row) =>
        row.key === key
          ? {
              ...row,
              [field]: value,
            }
          : row,
      ),
    }));
  };

  const removeExtraRow = (key: string) => {
    setForm((prev) => ({
      ...prev,

      extras: prev.extras.filter((row) => row.key !== key),
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.nameAr.trim()) {
      next.nameAr = "الاسم مطلوب";
    }

    if (!form.categoryId) {
      next.categoryId = "التصنيف مطلوب";
    }

    if (!form.image.trim()) {
      next.image = "رابط الصورة مطلوب";
    }

    const priceNumber = Number(form.price);

    if (!form.price.trim() || Number.isNaN(priceNumber) || priceNumber < 0) {
      next.price = "أدخل سعرًا صحيحًا";
    }

    if (
      form.calories.trim() &&
      (Number.isNaN(Number(form.calories)) || Number(form.calories) < 0)
    ) {
      next.calories = "أدخل رقمًا صحيحًا";
    }

    form.extras.forEach((row) => {
      if (!row.nameAr.trim()) {
        next[`extra-${row.key}`] = "اسم الخيار مطلوب";
      }

      if (
        row.type === "ADD" &&
        row.price.trim() &&
        (Number.isNaN(Number(row.price)) || Number(row.price) < 0)
      ) {
        next[`extra-${row.key}`] = "السعر غير صحيح";
      }
    });

    setErrors(next);

    return Object.keys(next).length === 0;
  };

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSave({
        id: product?.id,

        categoryId: form.categoryId,

        // Future English support:
        // nameEn: form.nameEn.trim(),

        nameAr: form.nameAr.trim(),

        // Future English support:
        // descriptionEn: form.descriptionEn.trim(),

        descriptionAr: form.descriptionAr.trim(),

        price: Number(form.price),

        image: form.image.trim(),

        calories: form.calories.trim() ? Number(form.calories) : null,

        badges: form.badges,

        available: form.available,

        extras: form.extras.map((row) => ({
          id: row.id,

          type: row.type,

          // Future English support:
          // nameEn: row.nameEn.trim(),

          nameAr: row.nameAr.trim(),

          price: row.type === "REMOVE" ? 0 : Number(row.price) || 0,
        })),
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

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDeleteClick = async () => {
    if (!product?.id || !onDelete) return;

    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    setIsDeleting(true);
    setSubmitError(null);

    try {
      await onDelete(product.id);

      onClose();
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "تعذر حذف المنتج.",
      );

      setIsDeleting(false);
      setConfirmingDelete(false);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && !isDeleting && onClose()}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          />

          {/* Modal */}

          <motion.div
            initial={{
              opacity: 0,
              y: 60,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 60,
              scale: 0.95,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            dir="rtl"
            className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl scrollbar-hide"
          >
            {/* Header */}

            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-card/95 backdrop-blur-sm border-b border-white/5">
              <h2 className="text-lg font-extrabold text-foreground">
                {isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}

            <div className="p-6 space-y-6">
              {/* Arabic Name */}

              <Field label="اسم المنتج" error={errors.nameAr}>
                <input
                  value={form.nameAr}
                  onChange={(event) => update("nameAr", event.target.value)}
                  placeholder="مثال: شاورما دجاج"
                  className={inputCls(errors.nameAr)}
                />
              </Field>

              {/* Future English name */}

              {/*
              <Field label="Name (English)">
                <input
                  value={form.nameEn}
                  onChange={(event) =>
                    update("nameEn", event.target.value)
                  }
                />
              </Field>
              */}

              {/* Arabic Description */}

              <Field label="وصف المنتج">
                <Textarea
                  value={form.descriptionAr}
                  onChange={(event) =>
                    update("descriptionAr", event.target.value)
                  }
                  rows={4}
                  placeholder="اكتب وصف المنتج..."
                  className="bg-surface border-white/10 text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 resize-none rounded-xl text-sm"
                />
              </Field>

              {/* Future English description */}

              {/*
              <Field label="Description (English)">
                <Textarea
                  value={form.descriptionEn}
                  onChange={(event) =>
                    update("descriptionEn", event.target.value)
                  }
                />
              </Field>
              */}

              {/* Category / Price / Calories */}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="التصنيف" error={errors.categoryId}>
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      update("categoryId", event.target.value)
                    }
                    className={inputCls(errors.categoryId) + " appearance-none"}
                  >
                    <option value="" disabled>
                      اختر التصنيف
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                        className="bg-card"
                      >
                        {category.emoji} {category.nameAr}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="السعر" error={errors.price}>
                  <input
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) => update("price", event.target.value)}
                    placeholder="0.00"
                    className={inputCls(errors.price)}
                  />
                </Field>

                <Field label="السعرات الحرارية" error={errors.calories}>
                  <input
                    inputMode="numeric"
                    value={form.calories}
                    onChange={(event) => update("calories", event.target.value)}
                    placeholder="اختياري"
                    className={inputCls(errors.calories)}
                  />
                </Field>
              </div>

              {/* Image */}

              <Field label="رابط الصورة" error={errors.image}>
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface border border-white/10 shrink-0">
                    {form.image && (
                      <img
                        src={form.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(event) => {
                          (event.target as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                    )}
                  </div>

                  <input
                    dir="ltr"
                    value={form.image}
                    onChange={(event) => update("image", event.target.value)}
                    placeholder="https://..."
                    className={inputCls(errors.image) + " flex-1"}
                  />
                </div>
              </Field>

              {/* Badges */}

              <Field label="الشارات">
                <div className="flex flex-wrap gap-2">
                  {BADGE_OPTIONS.map((badge) => {
                    const selected = form.badges.includes(badge.value);

                    return (
                      <button
                        key={badge.value}
                        type="button"
                        onClick={() => toggleBadge(badge.value)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "bg-surface text-muted-foreground border-white/10 hover:border-primary/30"
                        }`}
                      >
                        {badge.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Available */}

              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-white/10">
                <span className="text-sm font-semibold text-foreground">
                  متاح على القائمة
                </span>

                <button
                  type="button"
                  onClick={() => update("available", !form.available)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.available ? "bg-primary" : "bg-white/10"
                  }`}
                >
                  <motion.span
                    layout
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                    style={{
                      left: form.available ? 22 : 2,
                    }}
                  />
                </button>
              </div>

              {/* Paid Extras */}

              <ExtrasGroup
                title="الإضافات"
                hint="إضافات مدفوعة مثل: جبنة إضافية"
                type="ADD"
                rows={form.extras.filter((row) => row.type === "ADD")}
                onAdd={() => addExtraRow("ADD")}
                onUpdate={updateExtraRow}
                onRemove={removeExtraRow}
                showPrice
              />

              {/* Removable Ingredients */}

              <ExtrasGroup
                title="المكونات القابلة للإزالة"
                hint="خيارات مجانية مثل: بدون بصل، بدون مخلل"
                type="REMOVE"
                rows={form.extras.filter((row) => row.type === "REMOVE")}
                onAdd={() => addExtraRow("REMOVE")}
                onUpdate={updateExtraRow}
                onRemove={removeExtraRow}
                showPrice={false}
              />

              {/* Extra validation */}

              {Object.keys(errors).some((key) => key.startsWith("extra-")) && (
                <p className="text-xs text-destructive -mt-3">
                  كل خيار يجب أن يحتوي على اسم. الإضافات المدفوعة يجب أن تحتوي
                  على سعر صحيح.
                </p>
              )}

              {/* Submit error */}

              {submitError && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />

                  {submitError}
                </div>
              )}

              {/* Footer */}

              <div className="flex items-center gap-3 pt-2">
                {isEditMode && onDelete && (
                  <motion.button
                    type="button"
                    whileTap={{
                      scale: 0.96,
                    }}
                    onClick={handleDeleteClick}
                    disabled={isSubmitting || isDeleting}
                    className={`flex items-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 ${
                      confirmingDelete
                        ? "bg-destructive text-white"
                        : "bg-destructive/10 text-destructive border border-destructive/30 hover:bg-destructive/20"
                    }`}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}

                    {confirmingDelete ? "تأكيد الحذف" : "حذف"}
                  </motion.button>
                )}

                <motion.button
                  type="button"
                  whileTap={{
                    scale: 0.97,
                  }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors glow-brand disabled:opacity-60"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}

                  {isEditMode ? "حفظ التعديلات" : "إضافة المنتج"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Extras Group                                                               */
/* -------------------------------------------------------------------------- */

function ExtrasGroup({
  title,
  hint,
  type,
  rows,
  onAdd,
  onUpdate,
  onRemove,
  showPrice,
}: {
  title: string;
  hint: string;
  type: ExtraType;
  rows: ExtraRow[];
  onAdd: () => void;
  onUpdate: (key: string, field: keyof ExtraRow, value: string) => void;
  onRemove: (key: string) => void;
  showPrice: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-semibold text-foreground">
            {title}
          </label>

          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>

        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          إضافة
        </button>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground/70 italic">
          {type === "ADD"
            ? "لا توجد إضافات لهذا المنتج."
            : "لا توجد مكونات قابلة للإزالة."}
        </p>
      )}

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start gap-2 p-3 rounded-xl bg-surface border border-white/10"
          >
            <div
              className={`grid grid-cols-1 ${
                showPrice ? "sm:grid-cols-2" : "sm:grid-cols-1"
              } gap-2 flex-1`}
            >
              <input
                value={row.nameAr}
                onChange={(event) =>
                  onUpdate(row.key, "nameAr", event.target.value)
                }
                placeholder="اسم الخيار"
                className="h-9 bg-card border border-white/10 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 px-3 focus:outline-none focus:border-primary/50"
              />

              {showPrice && (
                <input
                  inputMode="decimal"
                  value={row.price}
                  onChange={(event) =>
                    onUpdate(row.key, "price", event.target.value)
                  }
                  placeholder="السعر"
                  className="h-9 bg-card border border-white/10 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 px-3 focus:outline-none focus:border-primary/50"
                />
              )}

              {/*
                Future English support:

                <input
                  value={row.nameEn}
                  onChange={(event) =>
                    onUpdate(
                      row.key,
                      "nameEn",
                      event.target.value
                    )
                  }
                  placeholder="Name (English)"
                />
              */}
            </div>

            <button
              type="button"
              onClick={() => onRemove(row.key)}
              className="w-9 h-9 shrink-0 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Field                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-muted-foreground">
        {label}
      </label>

      {children}

      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Input class                                                                */
/* -------------------------------------------------------------------------- */

function inputCls(error?: string) {
  return `w-full h-11 bg-surface border rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 px-4 focus:outline-none transition-colors ${
    error
      ? "border-destructive/60 focus:border-destructive"
      : "border-white/10 focus:border-primary/50"
  }`;
}
