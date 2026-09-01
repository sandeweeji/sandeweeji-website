"use client";

import { Fragment, useEffect, useMemo, useState } from "react";

import { motion } from "framer-motion";

import {
  Download,
  Edit2,
  GripVertical,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react";

import Image from "next/image";

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

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
  isReordering: boolean;
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onRequestDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
  onReorderProducts: (orderedProductIds: string[]) => void;
}

interface CategoryGroup {
  category: Category | null;
  products: Product[];
}

interface SortableProductRowProps {
  product: Product;
  category: Category | undefined;
  reorderEnabled: boolean;
  isSaving: boolean;
  isTogglingAvailability: boolean;
  onEditProduct: (product: Product) => void;
  onRequestDelete: (product: Product) => void;
  onToggleAvailability: (product: Product) => void;
}

function SortableProductRow({
  product,
  category,
  reorderEnabled,
  isSaving,
  isTogglingAvailability,
  onEditProduct,
  onRequestDelete,
  onToggleAvailability,
}: SortableProductRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: product.id,
    disabled: !reorderEnabled,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`group hover:bg-white/2 transition-colors ${
        isDragging ? "opacity-40 relative z-10" : ""
      }`}
    >
      {reorderEnabled && (
        <td className="w-8 px-2 py-3.5">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-2 -m-2 touch-none cursor-grab active:cursor-grabbing text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            aria-label="إعادة ترتيب المنتج"
          >
            <GripVertical className="w-4 h-4" />
          </button>
        </td>
      )}

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
          aria-label={product.available ? "إخفاء المنتج" : "إظهار المنتج"}
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
  isReordering,
  onAddProduct,
  onEditProduct,
  onRequestDelete,
  onToggleAvailability,
  onReorderProducts,
}: ProductsTabProps) {
  /*
   * Reordering is disabled while searching because a search result
   * represents only a partial list and therefore doesn't have a
   * meaningful global sort position.
   */
  const reorderEnabled = productSearch.trim() === "";

  const isGrouped = categoryFilter === "all";

  /*
   * Local order is used while dragging so the UI can update immediately,
   * without waiting for the parent query to refetch.
   */
  const [localOrder, setLocalOrder] = useState<Product[]>(filteredProducts);

  /*
   * Sensors:
   *
   * PointerSensor:
   * - Desktop mouse
   *
   * TouchSensor:
   * - Phones/tablets
   *
   * The delay prevents normal scrolling from accidentally becoming a drag.
   */
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),

    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  );

  /*
   * Keep local order synchronized with the parent's data.
   *
   * This happens after React Query refetches following a successful
   * reorder operation.
   */
  useEffect(() => {
    setLocalOrder(filteredProducts);
  }, [filteredProducts]);

  /*
   * Group products by category.
   *
   * When "all categories" is selected:
   * - Categories keep their existing category order.
   * - Products keep their local order inside each category.
   *
   * When a specific category is selected:
   * - The products are shown as one list.
   */
  const groups: CategoryGroup[] = useMemo(() => {
    if (!isGrouped) {
      return [
        {
          category: null,
          products: localOrder,
        },
      ];
    }

    const byCategory = new Map<string, Product[]>();

    for (const product of localOrder) {
      const list = byCategory.get(product.categoryId) ?? [];

      list.push(product);

      byCategory.set(product.categoryId, list);
    }

    const ordered: CategoryGroup[] = [];

    for (const category of sortedCategories) {
      const items = byCategory.get(category.id);

      if (items && items.length > 0) {
        ordered.push({
          category,
          products: items,
        });

        byCategory.delete(category.id);
      }
    }

    /*
     * Products whose category isn't present in sortedCategories.
     * This should normally never happen, but prevents products
     * from silently disappearing.
     */
    for (const [categoryId, items] of byCategory) {
      ordered.push({
        category:
          categories.find((category) => category.id === categoryId) ?? null,
        products: items,
      });
    }

    return ordered;
  }, [isGrouped, localOrder, sortedCategories, categories]);

  /*
   * Called when the drag finishes.
   *
   * We only allow reordering within the same category.
   */
  function handleDragEnd(event: DragEndEvent) {
    if (!reorderEnabled) {
      return;
    }

    const { active, over } = event;

    if (!over) {
      return;
    }

    if (active.id === over.id) {
      return;
    }

    const activeProduct = localOrder.find(
      (product) => product.id === active.id,
    );

    const overProduct = localOrder.find((product) => product.id === over.id);

    if (!activeProduct || !overProduct) {
      return;
    }

    /*
     * Don't allow a product to move into another category.
     */
    if (activeProduct.categoryId !== overProduct.categoryId) {
      return;
    }

    const oldIndex = localOrder.findIndex(
      (product) => product.id === active.id,
    );

    const newIndex = localOrder.findIndex((product) => product.id === over.id);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    /*
     * Reorder the complete local array.
     */
    const reordered = arrayMove(localOrder, oldIndex, newIndex);

    /*
     * Immediately update the UI.
     */
    setLocalOrder(reordered);

    /*
     * Only send the affected category's products to the parent.
     *
     * This preserves the ordering of all other categories.
     */
    const affectedCategoryId = activeProduct.categoryId;

    const reorderedCategoryProducts = reordered.filter(
      (product) => product.categoryId === affectedCategoryId,
    );

    onReorderProducts(reorderedCategoryProducts.map((product) => product.id));
  }

  const colSpan = reorderEnabled ? 6 : 5;

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

      {!reorderEnabled && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20 text-muted-foreground text-sm">
          امسح كلمة البحث لتتمكن من ترتيب المنتجات بالسحب والإفلات.
        </div>
      )}

      {/* Products table */}
      <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  {reorderEnabled && <th className="w-8 px-2 py-3.5" />}

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
                      <td colSpan={colSpan} className="px-5 py-4">
                        <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))}

                {!isLoading &&
                  groups.map((group) => (
                    <Fragment key={group.category?.id ?? "uncategorized"}>
                      {isGrouped && group.category && (
                        <tr className="bg-white/[0.03]">
                          <td
                            colSpan={colSpan}
                            className="px-5 py-2 text-xs font-bold text-muted-foreground"
                          >
                            {group.category.emoji} {group.category.nameAr}
                          </td>
                        </tr>
                      )}

                      <SortableContext
                        items={group.products.map((product) => product.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {group.products.map((product) => {
                          const category = categories.find(
                            (c) => c.id === product.categoryId,
                          );

                          return (
                            <SortableProductRow
                              key={product.id}
                              product={product}
                              category={category}
                              reorderEnabled={reorderEnabled}
                              isSaving={isSaving}
                              isTogglingAvailability={isTogglingAvailability}
                              onEditProduct={onEditProduct}
                              onRequestDelete={onRequestDelete}
                              onToggleAvailability={onToggleAvailability}
                            />
                          );
                        })}
                      </SortableContext>
                    </Fragment>
                  ))}

                {!isLoading && !isError && filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={colSpan} className="px-5 py-12 text-center">
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
          </DndContext>
        </div>
      </div>

      {isReordering && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          جاري حفظ الترتيب...
        </div>
      )}
    </motion.div>
  );
}
