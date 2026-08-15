"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  ChefHat,
  Tag,
  Package,
  EyeOff,
  Eye,
  LayoutGrid,
  Download,
  Loader2,
} from "lucide-react";
import Image from "next/image";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosPut,
} from "@/lib/axios";

import { formatPrice } from "@/lib/utils";

import type { Product, Category } from "@/lib/types";

import ProductFormModal, {
  type ProductFormPayload,
} from "@/components/admin/product-form-modal";
import CategoryFormModal, {
  type CategoryFormPayload,
} from "@/components/admin/category-form-modal";
import ConfirmDialog from "@/components/admin/confirm-dialog";

/* -------------------------------------------------------------------------- */
/* API response types                                                         */
/* -------------------------------------------------------------------------- */

interface ProductsResponse {
  products?: Product[];
}

interface CategoriesResponse {
  categories?: Category[];
}

type Tab = "products" | "categories";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<Tab>("products");

  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );

  const [productPendingDelete, setProductPendingDelete] =
    useState<Product | null>(null);
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<Category | null>(null);
  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Products query                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: productsResponse,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await axiosGet<Product[] | ProductsResponse>("products");

      if (!response.data) {
        throw new Error(response.message || "Failed to fetch products");
      }

      return response.data;
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Categories query                                                         */
  /* ------------------------------------------------------------------------ */

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosGet<Category[] | CategoriesResponse>(
        "categories",
      );

      if (!response.data) {
        throw new Error(response.message || "Failed to fetch categories");
      }

      return response.data;
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Normalize API data                                                       */
  /* ------------------------------------------------------------------------ */

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse?.products ?? []);

  const categories: Category[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : (categoriesResponse?.categories ?? []);

  const isLoading = productsLoading || categoriesLoading;
  const isError = productsError || categoriesError;

  /* ------------------------------------------------------------------------ */
  /* Stats                                                                    */
  /* ------------------------------------------------------------------------ */

  const stats = useMemo(
    () => ({
      totalProducts: products.length,
      availableProducts: products.filter((p) => p.available).length,
      hiddenProducts: products.filter((p) => !p.available).length,
      totalCategories: categories.length,
    }),
    [products, categories],
  );

  /* ------------------------------------------------------------------------ */
  /* Filtering                                                                */
  /* ------------------------------------------------------------------------ */

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !search || product.nameAr.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [products, productSearch, categoryFilter]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  /* ------------------------------------------------------------------------ */
  /* Product modal handlers                                                   */
  /* ------------------------------------------------------------------------ */

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Category modal handlers                                                  */
  /* ------------------------------------------------------------------------ */

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsCategoryModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setSelectedCategory(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Product mutations                                                        */
  /* ------------------------------------------------------------------------ */

  const saveProductMutation = useMutation({
    mutationFn: async (payload: ProductFormPayload) => {
      if (!payload.id) {
        return axiosPost<ProductFormPayload, Product>("products", payload);
      }
      return axiosPut<ProductFormPayload, Product>(
        `products/${payload.id}`,
        payload,
      );
    },
    onSuccess: async () => {
      await refetchProducts();
      handleCloseProductModal();
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return axiosDelete<Product>(`products/${productId}`);
    },
    onSuccess: async () => {
      await refetchProducts();
      setProductPendingDelete(null);
      setDeleteErrorMessage(null);
    },
    onError: (error: Error) => {
      setDeleteErrorMessage(error.message);
    },
  });

  /* FIX: partial availability update now uses PATCH (only sends `available`)
     instead of PUT, which required the full product payload and would 400. */
  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({
      id,
      available,
    }: {
      id: string;
      available: boolean;
    }) => {
      return axiosPatch<{ available: boolean }, Product>(`products/${id}`, {
        available,
      });
    },
    onSuccess: async () => {
      await refetchProducts();
    },
  });

  const handleSaveProduct = async (payload: ProductFormPayload) => {
    await saveProductMutation.mutateAsync(payload);
  };

  const handleConfirmDeleteProduct = () => {
    if (!productPendingDelete) return;
    deleteProductMutation.mutate(productPendingDelete.id);
  };

  const toggleAvailability = (product: Product) => {
    if (toggleAvailabilityMutation.isPending) return;

    toggleAvailabilityMutation.mutate({
      id: product.id,
      available: !product.available,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Category mutations                                                       */
  /* ------------------------------------------------------------------------ */

  const saveCategoryMutation = useMutation({
    mutationFn: async (payload: CategoryFormPayload) => {
      if (!payload.id) {
        return axiosPost<CategoryFormPayload, Category>("categories", payload);
      }
      return axiosPut<CategoryFormPayload, Category>(
        `categories/${payload.id}`,
        payload,
      );
    },
    onSuccess: async () => {
      await refetchCategories();
      handleCloseCategoryModal();
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: string) => {
      return axiosDelete<Category>(`categories/${categoryId}`);
    },
    onSuccess: async () => {
      await refetchCategories();
      setCategoryPendingDelete(null);
      setDeleteErrorMessage(null);
    },
    onError: (error: Error) => {
      setDeleteErrorMessage(error.message);
    },
  });

  const handleSaveCategory = async (payload: CategoryFormPayload) => {
    await saveCategoryMutation.mutateAsync(payload);
  };

  const handleConfirmDeleteCategory = () => {
    if (!categoryPendingDelete) return;
    deleteCategoryMutation.mutate(categoryPendingDelete.id);
  };

  const handleExportExcel = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      const response = await fetch("/api/products/export");

      if (!response.ok) {
        throw new Error("تعذر تصدير الملف.");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `menu-export-${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      setExportError(
        error instanceof Error ? error.message : "تعذر تصدير الملف.",
      );
    } finally {
      setIsExporting(false);
    }
  };

  const isSaving =
    saveProductMutation.isPending ||
    deleteProductMutation.isPending ||
    saveCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">
                Admin Panel
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-foreground">
              إدارة القائمة
            </h1>
          </motion.div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard
            icon={<Package className="w-4 h-4" />}
            label="إجمالي المنتجات"
            value={stats.totalProducts}
          />
          <StatCard
            icon={<Eye className="w-4 h-4" />}
            label="متاح"
            value={stats.availableProducts}
            tone="positive"
          />
          <StatCard
            icon={<EyeOff className="w-4 h-4" />}
            label="مخفي"
            value={stats.hiddenProducts}
            tone="muted"
          />
          <StatCard
            icon={<LayoutGrid className="w-4 h-4" />}
            label="التصنيفات"
            value={stats.totalCategories}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-white/10">
          <TabButton
            active={activeTab === "products"}
            onClick={() => setActiveTab("products")}
            icon={<Package className="w-4 h-4" />}
            label="المنتجات"
          />
          <TabButton
            active={activeTab === "categories"}
            onClick={() => setActiveTab("categories")}
            icon={<Tag className="w-4 h-4" />}
            label="التصنيفات"
          />
        </div>

        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm text-destructive">
              حدث خطأ أثناء تحميل البيانات.
            </p>
            <button
              type="button"
              onClick={() => {
                refetchProducts();
                refetchCategories();
              }}
              className="mt-2 text-sm font-semibold text-destructive underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {activeTab === "products" ? (
            <motion.div
              key="products"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              {/* Search + Filter + Add */}
              <div className="flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <input
                    type="search"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="ابحث عن منتج..."
                    className="w-full h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 pl-11 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground px-4 focus:outline-none focus:border-primary/50 transition-colors appearance-none"
                >
                  <option value="all">كل التصنيفات</option>
                  {sortedCategories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                      className="bg-card"
                    >
                      {category.emoji} {category.nameAr}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleExportExcel}
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
                  onClick={handleAddProduct}
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
                              className="hover:bg-white/[0.02] transition-colors group"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface shrink-0">
                                    <Image
                                      src={product.image}
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
                                  {category
                                    ? `${category.emoji} ${category.nameAr}`
                                    : "—"}
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
                                  onClick={() => toggleAvailability(product)}
                                  disabled={
                                    toggleAvailabilityMutation.isPending
                                  }
                                  className="transition-colors disabled:opacity-50"
                                  aria-label={
                                    product.available
                                      ? "إخفاء المنتج"
                                      : "إظهار المنتج"
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
                                    onClick={() => handleEditProduct(product)}
                                    disabled={isSaving}
                                    className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                                    aria-label="تعديل"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeleteErrorMessage(null);
                                      setProductPendingDelete(product);
                                    }}
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

                      {!isLoading &&
                        !isError &&
                        filteredProducts.length === 0 && (
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
          ) : (
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
                  onClick={handleAddCategory}
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
                          onClick={() => handleEditCategory(category)}
                          disabled={isSaving}
                          className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                          aria-label="تعديل"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErrorMessage(null);
                            setCategoryPendingDelete(category);
                          }}
                          disabled={isSaving}
                          className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                          aria-label="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}

                {!categoriesLoading &&
                  !categoriesError &&
                  sortedCategories.length === 0 && (
                    <div className="col-span-full text-center py-12">
                      <p className="text-sm text-muted-foreground">
                        لا توجد تصنيفات بعد.
                      </p>
                    </div>
                  )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product form modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={selectedProduct}
        categories={sortedCategories}
        onSave={handleSaveProduct}
      />

      {/* Category form modal */}
      <CategoryFormModal
        isOpen={isCategoryModalOpen}
        onClose={handleCloseCategoryModal}
        category={selectedCategory}
        onSave={handleSaveCategory}
      />

      {/* Delete product confirm */}
      <ConfirmDialog
        isOpen={Boolean(productPendingDelete)}
        title="حذف المنتج"
        description={
          productPendingDelete
            ? `هل أنت متأكد من حذف "${productPendingDelete.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف"
        isLoading={deleteProductMutation.isPending}
        errorMessage={deleteErrorMessage}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => {
          setProductPendingDelete(null);
          setDeleteErrorMessage(null);
        }}
      />

      {/* Delete category confirm */}
      <ConfirmDialog
        isOpen={Boolean(categoryPendingDelete)}
        title="حذف التصنيف"
        description={
          categoryPendingDelete
            ? `هل أنت متأكد من حذف "${categoryPendingDelete.nameAr}"؟${
                (categoryPendingDelete._count?.products ?? 0) > 0
                  ? " يحتوي هذا التصنيف على منتجات مرتبطة به."
                  : ""
              }`
            : ""
        }
        confirmLabel="حذف"
        isLoading={deleteCategoryMutation.isPending}
        errorMessage={deleteErrorMessage}
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => {
          setCategoryPendingDelete(null);
          setDeleteErrorMessage(null);
        }}
      />
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon,
  label,
  value,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "default" | "positive" | "muted";
}) {
  const toneCls =
    tone === "positive"
      ? "text-emerald-400"
      : tone === "muted"
        ? "text-muted-foreground"
        : "text-primary";

  return (
    <div className="bg-card border border-white/10 rounded-2xl p-4 flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-lg bg-surface border border-white/10 flex items-center justify-center shrink-0 ${toneCls}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-extrabold text-foreground leading-none">
          {value}
        </p>
        <p className="text-xs text-muted-foreground mt-1 truncate">{label}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tab Button                                                                 */
/* -------------------------------------------------------------------------- */

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {icon}
      {label}
      {active && (
        <motion.div
          layoutId="admin-tab-underline"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
        />
      )}
    </button>
  );
}
