"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit2,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  Bell,
  ChefHat,
} from "lucide-react";
import Image from "next/image";

import { useMutation, useQuery } from "@tanstack/react-query";

import { axiosDelete, axiosGet, axiosPost, axiosPut } from "@/lib/axios";

import { formatPrice } from "@/lib/utils";

import type { Product, Category, Badge } from "@/lib/types";

import ProductFormModal, {
  type ProductFormPayload,
} from "@/components/admin/product-form-modal";

/* -------------------------------------------------------------------------- */
/* API response types                                                         */
/* -------------------------------------------------------------------------- */

interface ProductsResponse {
  products?: Product[];
}

interface CategoriesResponse {
  categories?: Category[];
}

/*
 * إذا كان الـ API يرجع array مباشرة:
 *
 * data: Product[]
 *
 * بدلاً من:
 *
 * data: { products: Product[] }
 *
 * الكود تحت يتعامل مع الحالتين.
 */

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const [productSearch, setProductSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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
  } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await axiosGet<Category[] | CategoriesResponse>(
        "categories",
      );

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

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  const isLoading = productsLoading || categoriesLoading;

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  const isError = productsError || categoriesError;

  /* ------------------------------------------------------------------------ */
  /* Search                                                                   */
  /* ------------------------------------------------------------------------ */

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return products;
    }

    return products.filter((product) => {
      return product.nameAr.toLowerCase().includes(search);

      /*
       * Future English support:
       *
       * ||
       * product.nameEn
       *   ?.toLowerCase()
       *   .includes(search)
       */
    });
  }, [products, productSearch]);

  /* ------------------------------------------------------------------------ */
  /* Open modal                                                               */
  /* ------------------------------------------------------------------------ */

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  /* ------------------------------------------------------------------------ */
  /* CREATE / UPDATE mutation                                                 */
  /* ------------------------------------------------------------------------ */

  const saveProductMutation = useMutation({
    mutationFn: async (payload: ProductFormPayload) => {
      /*
       * CREATE
       */
      if (!payload.id) {
        return axiosPost<ProductFormPayload, Product>("products", payload);
      }

      /*
       * UPDATE
       */
      return axiosPut<ProductFormPayload, Product>(
        `products/${payload.id}`,
        payload,
      );
    },

    onSuccess: async () => {
      /*
       * No queryClient.
       *
       * We simply refetch the useQuery.
       */
      await refetchProducts();

      handleCloseModal();
    },
  });

  /* ------------------------------------------------------------------------ */
  /* DELETE mutation                                                          */
  /* ------------------------------------------------------------------------ */

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return axiosDelete<Product>(`products/${productId}`);
    },

    onSuccess: async () => {
      await refetchProducts();

      handleCloseModal();
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Availability mutation                                                    */
  /* ------------------------------------------------------------------------ */

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({
      id,
      available,
    }: {
      id: string;
      available: boolean;
    }) => {
      /*
       * Only update the availability field.
       *
       * Your PUT /products/[id] route should accept
       * partial product updates.
       */
      return axiosPut<{ available: boolean }, Product>(`products/${id}`, {
        available,
      });
    },

    onSuccess: async () => {
      await refetchProducts();
    },
  });

  /* ------------------------------------------------------------------------ */
  /* Save handler                                                             */
  /* ------------------------------------------------------------------------ */

  const handleSaveProduct = async (
    payload: ProductFormPayload,
  ): Promise<void> => {
    await saveProductMutation.mutateAsync(payload);
  };

  /* ------------------------------------------------------------------------ */
  /* Delete handler                                                           */
  /* ------------------------------------------------------------------------ */

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    await deleteProductMutation.mutateAsync(productId);
  };

  /* ------------------------------------------------------------------------ */
  /* Availability handler                                                     */
  /* ------------------------------------------------------------------------ */

  const toggleAvailability = (product: Product) => {
    if (toggleAvailabilityMutation.isPending) {
      return;
    }

    toggleAvailabilityMutation.mutate({
      id: product.id,
      available: !product.available,
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Combined mutation state                                                  */
  /* ------------------------------------------------------------------------ */

  const isSaving =
    saveProductMutation.isPending || deleteProductMutation.isPending;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* ------------------------------------------------------------------ */}
        {/* Header                                                             */}
        {/* ------------------------------------------------------------------ */}

        <div className="flex items-center justify-between mb-8">
          <motion.div
            initial={{
              opacity: 0,
              y: 16,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
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

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <button
                type="button"
                className="w-10 h-10 rounded-xl bg-card border border-white/10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>

              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                3
              </span>
            </div>
          </motion.div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* Menu                                                               */}
        {/* ------------------------------------------------------------------ */}

        <div className="space-y-5">
          {/* Search + Add */}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 pl-11 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

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

          {/* ---------------------------------------------------------------- */}
          {/* Error                                                            */}
          {/* ---------------------------------------------------------------- */}

          {isError && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
              <p className="text-sm text-destructive">
                حدث خطأ أثناء تحميل البيانات.
              </p>

              <button
                type="button"
                onClick={() => refetchProducts()}
                className="mt-2 text-sm font-semibold text-destructive underline"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* Products table                                                   */}
          {/* ---------------------------------------------------------------- */}

          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
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
                  {/* Loading */}

                  {isLoading &&
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={`loading-${index}`}>
                        <td colSpan={5} className="px-5 py-4">
                          <div className="h-10 bg-white/5 rounded-lg animate-pulse" />
                        </td>
                      </tr>
                    ))}

                  {/* Data */}

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
                          {/* Product */}

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

                                {/*
                                  Future English support:

                                  <p className="text-xs text-muted-foreground truncate hidden md:block">
                                    {product.nameEn}
                                  </p>
                                */}
                              </div>
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-5 py-3.5 hidden sm:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {category
                                ? `${category.emoji} ${category.nameAr}`
                                : "—"}
                            </span>
                          </td>

                          {/* Price */}

                          <td className="px-5 py-3.5">
                            <span className="text-sm font-bold text-primary">
                              {formatPrice(product.price)}
                            </span>
                          </td>

                          {/* Availability */}

                          <td className="px-5 py-3.5">
                            <button
                              type="button"
                              onClick={() => toggleAvailability(product)}
                              disabled={toggleAvailabilityMutation.isPending}
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

                          {/* Actions */}

                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              {/* Edit */}

                              <button
                                type="button"
                                onClick={() => handleEditProduct(product)}
                                disabled={isSaving}
                                className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                                aria-label="تعديل"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}

                              <button
                                type="button"
                                onClick={() => handleDeleteProduct(product.id)}
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

                  {/* Empty */}

                  {!isLoading && !isError && filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                          لا توجد منتجات.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Product Form Modal                                                   */}
      {/* -------------------------------------------------------------------- */}

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
        categories={categories}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
      />
    </main>
  );
}
