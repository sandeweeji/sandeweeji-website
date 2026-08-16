"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  ImageOff,
  Upload,
  Link as LinkIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import type { Product, Category, ExtraType, Badge } from "@/lib/types";
import { BADGE_MAP } from "@/lib/data";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface ExtraRow {
  key: string;
  id?: string;
  type: ExtraType;
  nameAr: string;
  price: string;
}

export interface ProductFormPayload {
  id?: string;
  categoryId: string;
  nameAr: string;
  descriptionAr: string;
  price: number;
  image: string;
  calories: number | null;
  badges: Badge[];
  available: boolean;
  extras: {
    id?: string;
    type: ExtraType;
    nameAr: string;
    price: number;
  }[];
}

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
  categories: Category[];
  onSave: (payload: ProductFormPayload) => Promise<void>;
  onDelete?: (productId: string) => Promise<void>;
}

interface ProductFormState {
  categoryId: string;
  nameAr: string;
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
  nameAr: "",
  price: "",
});

function buildInitialState(product?: Product | null): ProductFormState {
  return {
    categoryId: product?.categoryId ?? "",
    nameAr: product?.nameAr ?? "",
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
  const [imageBroken, setImageBroken] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showManualUrl, setShowManualUrl] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ------------------------------ Reset ---------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    setForm(buildInitialState(product));
    setErrors({});
    setSubmitError(null);
    setConfirmingDelete(false);
    setImageBroken(false);

    const focusTimer = setTimeout(() => nameInputRef.current?.focus(), 150);
    return () => clearTimeout(focusTimer);
  }, [isOpen, product]);

  /* --------------------------- Esc to close -------------------------------- */

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSubmitting && !isDeleting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, isDeleting, onClose]);

  /* --------------------------- Update helpers ------------------------------ */

  const update = <K extends keyof ProductFormState>(
    key: K,
    value: ProductFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
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
        row.key === key ? { ...row, [field]: value } : row,
      ),
    }));
  };

  const removeExtraRow = (key: string) => {
    setForm((prev) => ({
      ...prev,
      extras: prev.extras.filter((row) => row.key !== key),
    }));
  };

  /* --------------------------- Image upload -------------------------------- */

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "تعذر رفع الصورة.");
      }

      update("image", json.data.url as string);
      setImageBroken(false);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "تعذر رفع الصورة.",
      );
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  /* ------------------------------ Validation -------------------------------- */

  const validate = () => {
    const next: Record<string, string> = {};

    if (!form.nameAr.trim()) next.nameAr = "الاسم مطلوب";
    if (!form.categoryId) next.categoryId = "التصنيف مطلوب";
    //  if (!form.image.trim()) next.image = "رابط الصورة مطلوب";

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

  /* -------------------------------- Submit ---------------------------------- */

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await onSave({
        id: product?.id,
        categoryId: form.categoryId,
        nameAr: form.nameAr.trim(),
        descriptionAr: form.descriptionAr.trim(),
        price: Number(form.price),
        image: form.image.trim(),
        calories: form.calories.trim() ? Number(form.calories) : null,
        badges: form.badges,
        available: form.available,
        extras: form.extras.map((row) => ({
          id: row.id,
          type: row.type,
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

  /* -------------------------------- Delete ----------------------------------- */

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

  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  /* -------------------------------- Render ------------------------------------ */

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !isSubmitting && !isDeleting && onClose()}
            className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            dir="rtl"
            className="fixed z-50 inset-x-4 bottom-0 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 w-auto sm:w-full sm:max-w-xl max-h-[92vh] overflow-y-auto bg-card border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl scrollbar-hide"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-5 bg-card/95 backdrop-blur-sm border-b border-white/10">
              <div>
                <h2 className="text-lg font-extrabold text-foreground">
                  {isEditMode ? "تعديل المنتج" : "إضافة منتج جديد"}
                </h2>
                {selectedCategory && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedCategory.emoji} {selectedCategory.nameAr}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting || isDeleting}
                className="w-9 h-9 rounded-full bg-surface border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Name */}
              <Field label="اسم المنتج" error={errors.nameAr}>
                <input
                  ref={nameInputRef}
                  value={form.nameAr}
                  onChange={(event) => update("nameAr", event.target.value)}
                  placeholder="مثال: شاورما دجاج"
                  className={inputCls(errors.nameAr)}
                />
              </Field>

              {/* Description */}
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
                <p className="text-xs text-muted-foreground text-left">
                  {form.descriptionAr.length} حرف
                </p>
              </Field>

              {/* Category / Price / Calories */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="التصنيف" error={errors.categoryId}>
                  {categories.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic px-1">
                      أضف تصنيفًا أولاً.
                    </p>
                  ) : (
                    <select
                      value={form.categoryId}
                      onChange={(event) =>
                        update("categoryId", event.target.value)
                      }
                      className={
                        inputCls(errors.categoryId) + " appearance-none"
                      }
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
                  )}
                </Field>

                <Field label="السعر" error={errors.price}>
                  <div className="relative">
                    <input
                      inputMode="decimal"
                      value={form.price}
                      onChange={(event) => update("price", event.target.value)}
                      placeholder="0.00"
                      className={inputCls(errors.price) + " pl-4 pr-4"}
                    />
                  </div>
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
              <Field label="صورة المنتج" error={errors.image}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="relative w-20 h-20 rounded-xl overflow-hidden bg-surface border border-white/10 shrink-0 flex items-center justify-center group disabled:opacity-70"
                  >
                    {form.image && !imageBroken ? (
                      <img
                        src={form.image}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={() => setImageBroken(true)}
                        onLoad={() => setImageBroken(false)}
                      />
                    ) : (
                      <ImageOff className="w-5 h-5 text-muted-foreground" />
                    )}

                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isUploadingImage ? (
                        <Loader2 className="w-5 h-5 text-white animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </button>

                  <div className="flex-1 min-w-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full h-11 flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 text-sm font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-60"
                    >
                      {isUploadingImage ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جارٍ الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          {form.image ? "استبدال الصورة" : "رفع صورة"}
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowManualUrl((prev) => !prev)}
                      className="flex items-center gap-1.5 text-xs text-foreground/70 hover:text-primary transition-colors"
                    >
                      <LinkIcon className="w-3 h-3" />
                      {showManualUrl
                        ? "إخفاء إدخال الرابط"
                        : "أو أدخل رابط الصورة يدويًا"}
                    </button>
                  </div>
                </div>

                {showManualUrl && (
                  <input
                    dir="ltr"
                    value={form.image}
                    onChange={(event) => {
                      update("image", event.target.value);
                      setImageBroken(false);
                    }}
                    placeholder="https://..."
                    className={inputCls(errors.image) + " mt-2"}
                  />
                )}

                {uploadError && (
                  <p className="text-xs text-destructive">{uploadError}</p>
                )}

                {form.image && imageBroken && !isUploadingImage && (
                  <p className="text-xs text-amber-400">
                    تعذر تحميل الصورة من هذا الرابط.
                  </p>
                )}
              </Field>

              {/* Badges */}
              <Field label="الشارات">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(BADGE_MAP).map(([key, label]) => {
                    const selected = form.badges.includes(key as Badge);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => toggleBadge(key as Badge)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                          selected
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "bg-surface text-muted-foreground border-white/10 hover:border-primary/30"
                        }`}
                      >
                        {label.labelAr}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Available */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface border border-white/10">
                <div>
                  <span className="text-sm font-semibold text-foreground block">
                    متاح على القائمة
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {form.available ? "يظهر للزبائن حاليًا" : "مخفي عن الزبائن"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => update("available", !form.available)}
                  className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                    form.available ? "bg-primary" : "bg-white/10"
                  }`}
                >
                  <motion.span
                    layout
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow"
                    style={{ left: form.available ? 22 : 2 }}
                  />
                </button>
              </div>

              {/* Paid Extras */}
              <ExtrasGroup
                title="الإضافات"
                hint="إضافات مدفوعة مثل: جبنة إضافية"
                type="ADD"
                rows={form.extras.filter((row) => row.type === "ADD")}
                errors={errors}
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
                errors={errors}
                onAdd={() => addExtraRow("REMOVE")}
                onUpdate={updateExtraRow}
                onRemove={removeExtraRow}
                showPrice={false}
              />

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
                    whileTap={{ scale: 0.96 }}
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
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting || isDeleting || isUploadingImage}
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
  errors,
  onAdd,
  onUpdate,
  onRemove,
  showPrice,
}: {
  title: string;
  hint: string;
  type: ExtraType;
  rows: ExtraRow[];
  errors: Record<string, string>;
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
        <p className="text-xs text-muted-foreground italic">
          {type === "ADD"
            ? "لا توجد إضافات لهذا المنتج."
            : "لا توجد مكونات قابلة للإزالة."}
        </p>
      )}

      <div className="space-y-2">
        {rows.map((row) => {
          const rowError = errors[`extra-${row.key}`];

          return (
            <div key={row.key} className="space-y-1">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-surface border border-white/10">
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
                    className={`h-9 bg-card border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 px-3 focus:outline-none transition-colors ${
                      rowError
                        ? "border-destructive/60 focus:border-destructive"
                        : "border-white/10 focus:border-primary/50"
                    }`}
                  />

                  {showPrice && (
                    <input
                      inputMode="decimal"
                      value={row.price}
                      onChange={(event) =>
                        onUpdate(row.key, "price", event.target.value)
                      }
                      placeholder="السعر"
                      className={`h-9 bg-card border rounded-lg text-xs text-foreground placeholder:text-muted-foreground/50 px-3 focus:outline-none transition-colors ${
                        rowError
                          ? "border-destructive/60 focus:border-destructive"
                          : "border-white/10 focus:border-primary/50"
                      }`}
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => onRemove(row.key)}
                  className="w-9 h-9 shrink-0 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {rowError && (
                <p className="text-xs text-destructive px-1">{rowError}</p>
              )}
            </div>
          );
        })}
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
