"use client";

import { motion } from "framer-motion";
import { Download, Edit2, Loader2, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import Image from "next/image";

import { formatPrice } from "@/lib/utils";
import type { Category, Product } from "@/lib/types";
import sandeweeji from "@/public/sandeweeji.jpg";

interface ProductsTabProps {
  isLoading: boolean;
  isError: boolean;
  products: Product[];
  filteredProducts: Product[];
  categories: Category[];
  sortedCategories: Category[];
  productSearch: string;
  onSearchChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  isExporting: boolean;
  exportError: string | null;
  onExport: () => void;
  isSaving: boolean;
  isTogglingAvailability: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onRequestDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
}

export function ProductsTab({
  isLoading,
  isError,
  products,
  filteredProducts,
  categories,
  sortedCategories,
  productSearch,
  onSearchChange,
  categoryFilter,
  onCategoryFilterChange,
  isExporting,
  exportError,
  onExport,
  isSaving,
  isTogglingAvailability,
  onAddProduct,
  onEditProduct,
  onRequestDelete,
  onToggleAvailability,
}: ProductsTabProps) {
  return (
    <motion.div
      key="products"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="space-y-5"
    >
      {/* Search + Filter + Add */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-50">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={productSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="w-full h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 pl-11 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          className="h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground px-4 focus:outline-none focus:border-primary/50 transition-colors appearance-none"
        >
          <option value="all">كل التصنيفات</option>
          {sortedCategories.map((category) => (
            <option key={category.id} value={category.id} className="bg-card">
              {category.emoji} {category.nameAr}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={onExport}
          disabled={isExporting || products.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-card border border-white/10 text-foreground text-sm font-bold hover:border-primary/40 hover:text-primary transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          تصدير Excel
        </button>

        <button
          type="button"
          onClick={onAddProduct}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          إضافة منتج
        </button>
      </div>

      {exportError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
          {exportError}
        </div>
      )}

      {/* Products table */}
      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  المنتج
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                  التصنيف
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  السعر
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  متاح
                </th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                  الإجراءات
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={`loading-${index}`}>
                    <td colSpan={5} className="px-5 py-4">
                      <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                    </td>
                  </tr>
                ))}

              {!isLoading &&
                filteredProducts.map((product) => {
                  const category = categories.find(
                    (c) => c.id === product.categoryId,
                  );

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface shrink-0">
                            <Image
                              src={product.image ? product.image : sandeweeji}
                              alt={product.nameAr}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {product.nameAr}
                            </p>
                            {product.badges.length > 0 && (
                              <p className="text-xs text-muted-foreground truncate">
                                {product.badges.length} شارة
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <span className="text-sm text-muted-foreground">
                          {category ? `${category.emoji} ${category.nameAr}` : "—"}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="text-sm font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <button
                          type="button"
                          onClick={() => onToggleAvailability(product)}
                          disabled={isTogglingAvailability}
                          className="transition-colors disabled:opacity-50"
                          aria-label={
                            product.available ? "إخفاء المنتج" : "إظهار المنتج"
                          }
                        >
                          {product.available ? (
                            <ToggleRight className="w-6 h-6 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                          )}
                        </button>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            disabled={isSaving}
                            className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                            aria-label="تعديل"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onRequestDelete(product)}
                            disabled={isSaving}
                            className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                            aria-label="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

              {!isLoading && !isError && filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center">
                    <p className="text-sm text-muted-foreground">
                      {products.length === 0
                        ? "لا توجد منتجات بعد."
                        : "لا توجد نتائج مطابقة."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
