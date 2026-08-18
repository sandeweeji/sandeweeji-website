"use client";

import { motion } from "framer-motion";
import { Edit2, Plus, Trash2 } from "lucide-react";

import type { Category } from "@/lib/types";

interface CategoriesTabProps {
  categoriesLoading: boolean;
  categoriesError: boolean;
  sortedCategories: Category[];
  isSaving: boolean;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onRequestDelete: (category: Category) => void;
}

export function CategoriesTab({
  categoriesLoading,
  categoriesError,
  sortedCategories,
  isSaving,
  onAddCategory,
  onEditCategory,
  onRequestDelete,
}: CategoriesTabProps) {
  return (
    <motion.div
      key="categories"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-5"
    >
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onAddCategory}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`cat-loading-${index}`}
              className="h-24 bg-card border border-white/10 rounded-2xl animate-pulse"
            />
          ))}

        {!categoriesLoading &&
          sortedCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-xl bg-surface border border-white/10 flex items-center justify-center text-2xl shrink-0">
                {category.emoji}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-foreground truncate">
                  {category.nameAr}
                </p>
                <p className="text-xs text-muted-foreground">
                  {category._count?.products ?? 0} منتج ·{" "}
                  {category.visible ? "ظاهر" : "مخفي"}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => onEditCategory(category)}
                  disabled={isSaving}
                  className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                  aria-label="تعديل"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => onRequestDelete(category)}
                  disabled={isSaving}
                  className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                  aria-label="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

        {!categoriesLoading && !categoriesError && sortedCategories.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-sm text-muted-foreground">لا توجد تصنيفات بعد.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
