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
  LogOut,
  MapPin,
  Check,
  X,
} from "lucide-react";
import Image from "next/image";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
import sandeweeji from "@/public/sandeweeji.jpg";

/* -------------------------------------------------------------------------- */
/* API response types                                                         */
/* -------------------------------------------------------------------------- */

interface ProductsResponse {
  products?: Product[];
}

interface CategoriesResponse {
  categories?: Category[];
}

interface DeliveryDestination {
  id: string;
  nameAr: string;
  nameEn: string;
  deliveryFee: string | number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface DeliveryDestinationFormPayload {
  id?: string;
  nameAr: string;
  nameEn: string;
  deliveryFee: number;
  isActive: boolean;
  sortOrder: number;
}

type Tab = "products" | "categories" | "delivery";

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function AdminPage() {
  const queryClient = useQueryClient();

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

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDeliveryDestination, setSelectedDeliveryDestination] =
    useState<DeliveryDestination | null>(null);
  const [
    deliveryDestinationPendingDelete,
    setDeliveryDestinationPendingDelete,
  ] = useState<DeliveryDestination | null>(null);
  const [deliveryForm, setDeliveryForm] = useState({
    nameAr: "",
    nameEn: "",
    deliveryFee: "",
    isActive: true,
    sortOrder: "0",
  });
  const [deliveryFormError, setDeliveryFormError] = useState<string | null>(
    null,
  );

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
  /* Delivery destinations query                                              */
  /* ------------------------------------------------------------------------ */

  const {
    data: deliveryDestinationsResponse,
    isLoading: deliveryDestinationsLoading,
    isError: deliveryDestinationsError,
    refetch: refetchDeliveryDestinations,
  } = useQuery({
    queryKey: ["delivery-destinations"],
    queryFn: async () => {
      const response = await axiosGet<DeliveryDestination[]>("destinations");

      if (!response.data) {
        throw new Error(
          response.message || "Failed to fetch delivery destinations",
        );
      }

      return response.data;
    },
  });

  console.log("destinations", deliveryDestinationsResponse);

  /* ------------------------------------------------------------------------ */
  /* Normalize API data                                                       */
  /* ------------------------------------------------------------------------ */

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse?.products ?? []);

  const categories: Category[] = Array.isArray(categoriesResponse)
    ? categoriesResponse
    : (categoriesResponse?.categories ?? []);

  const deliveryDestinations: DeliveryDestination[] =
    deliveryDestinationsResponse ?? [];

  const isLoading = productsLoading || categoriesLoading;
  const isError = productsError || categoriesError || deliveryDestinationsError;

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

  const sortedDeliveryDestinations = useMemo(
    () => [...deliveryDestinations].sort((a, b) => a.sortOrder - b.sortOrder),
    [deliveryDestinations],
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
  /* Delivery destination modal handlers                                      */
  /* ------------------------------------------------------------------------ */

  const handleAddDeliveryDestination = () => {
    setSelectedDeliveryDestination(null);
    setDeliveryFormError(null);
    setDeliveryForm({
      nameAr: "",
      nameEn: "",
      deliveryFee: "",
      isActive: true,
      sortOrder: String(deliveryDestinations.length),
    });
    setIsDeliveryModalOpen(true);
  };

  const handleEditDeliveryDestination = (destination: DeliveryDestination) => {
    setSelectedDeliveryDestination(destination);
    setDeliveryFormError(null);
    setDeliveryForm({
      nameAr: destination.nameAr,
      nameEn: destination.nameEn,
      deliveryFee: String(destination.deliveryFee),
      isActive: destination.isActive,
      sortOrder: String(destination.sortOrder),
    });
    setIsDeliveryModalOpen(true);
  };

  const handleCloseDeliveryModal = () => {
    setIsDeliveryModalOpen(false);
    setSelectedDeliveryDestination(null);
    setDeliveryFormError(null);
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

  /* ------------------------------------------------------------------------ */
  /* Delivery destination mutations                                           */
  /* ------------------------------------------------------------------------ */

  const saveDeliveryDestinationMutation = useMutation({
    mutationFn: async (payload: DeliveryDestinationFormPayload) => {
      if (!payload.id) {
        return axiosPost<DeliveryDestinationFormPayload, DeliveryDestination>(
          "destinations",
          payload,
        );
      }
      // No PUT route exists for destinations, only PATCH — it accepts a
      // partial body, and sending all fields on edit is still valid.
      return axiosPatch<DeliveryDestinationFormPayload, DeliveryDestination>(
        `destinations/${payload.id}`,
        payload,
      );
    },
    onSuccess: async () => {
      await refetchDeliveryDestinations();
      handleCloseDeliveryModal();
    },
    onError: (error: Error) => {
      setDeliveryFormError(error.message);
    },
  });

  const toggleDeliveryDestinationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return axiosPatch<{ isActive: boolean }, DeliveryDestination>(
        `destinations/${id}`,
        { isActive },
      );
    },
    onSuccess: async () => {
      await refetchDeliveryDestinations();
    },
  });

  const deleteDeliveryDestinationMutation = useMutation({
    mutationFn: async (destinationId: string) => {
      return axiosDelete<DeliveryDestination>(`destinations/${destinationId}`);
    },
    onSuccess: async () => {
      await refetchDeliveryDestinations();
      setDeliveryDestinationPendingDelete(null);
      setDeleteErrorMessage(null);
    },
    onError: (error: Error) => {
      setDeleteErrorMessage(error.message);
    },
  });

  const handleToggleDeliveryDestination = (
    destination: DeliveryDestination,
  ) => {
    if (isDeliveryActionPending) return;

    toggleDeliveryDestinationMutation.mutate({
      id: destination.id,
      isActive: !destination.isActive,
    });
  };

  const handleDeleteDeliveryDestination = (
    destination: DeliveryDestination,
  ) => {
    setDeleteErrorMessage(null);
    setDeliveryDestinationPendingDelete(destination);
  };

  const handleConfirmDeleteDeliveryDestination = () => {
    if (!deliveryDestinationPendingDelete) return;
    deleteDeliveryDestinationMutation.mutate(
      deliveryDestinationPendingDelete.id,
    );
  };

  const handleSaveDeliveryDestination = () => {
    const trimmedNameAr = deliveryForm.nameAr.trim();
    const trimmedNameEn = deliveryForm.nameEn.trim();
    const parsedFee = Number(deliveryForm.deliveryFee);
    const parsedSortOrder = Number(deliveryForm.sortOrder);

    if (!trimmedNameAr) {
      setDeliveryFormError("يرجى إدخال اسم المنطقة .");
      return;
    }

    if (Number.isNaN(parsedFee) || parsedFee < 0) {
      setDeliveryFormError("يرجى إدخال رسم توصيل صالح.");
      return;
    }

    setDeliveryFormError(null);

    saveDeliveryDestinationMutation.mutate({
      id: selectedDeliveryDestination?.id,
      nameAr: trimmedNameAr,
      nameEn: trimmedNameEn,
      deliveryFee: parsedFee,
      isActive: deliveryForm.isActive,
      sortOrder: Number.isNaN(parsedSortOrder) ? 0 : parsedSortOrder,
    });
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

  const isSavingDeliveryDestination = saveDeliveryDestinationMutation.isPending;

  const isDeliveryActionPending =
    isSavingDeliveryDestination ||
    toggleDeliveryDestinationMutation.isPending ||
    deleteDeliveryDestinationMutation.isPending;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-border/40 pb-6">
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

          {/* Logout Button positioned on the opposite side */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <form action="/admin/logout" method="POST">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-destructive hover:text-destructive-foreground bg-destructive/10 hover:bg-destructive rounded-xl transition-all duration-200 border border-destructive/20 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-destructive/30"
              >
                <LogOut className="w-4 h-4" />
                <span>تسجيل الخروج</span>
              </button>
            </form>
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
          <TabButton
            active={activeTab === "delivery"}
            onClick={() => setActiveTab("delivery")}
            icon={<MapPin className="w-4 h-4" />}
            label="التوصيل"
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
                refetchDeliveryDestinations();
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
                <div className="relative flex-1 min-w-50">
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
                              className="hover:bg-white/2 transition-colors group"
                            >
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface shrink-0">
                                    <Image
                                      src={
                                        product.image
                                          ? product.image
                                          : sandeweeji
                                      }
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
          ) : activeTab === "categories" ? (
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
          ) : (
            <motion.div
              key="delivery"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">
                    مناطق التوصيل
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    إدارة مناطق التوصيل ورسوم كل منطقة.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddDeliveryDestination}
                  disabled={isDeliveryActionPending}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4" />
                  إضافة منطقة
                </button>
              </div>

              {deliveryDestinationsLoading ? (
                <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                  <div className="p-5 space-y-3">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <div
                        key={`delivery-loading-${index}`}
                        className="h-16 bg-white/5 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : deliveryDestinationsError ? (
                <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3">
                  <p className="text-sm text-destructive">
                    حدث خطأ أثناء تحميل مناطق التوصيل.
                  </p>
                  <button
                    type="button"
                    onClick={() => refetchDeliveryDestinations()}
                    className="mt-2 text-sm font-semibold text-destructive underline"
                  >
                    إعادة المحاولة
                  </button>
                </div>
              ) : sortedDeliveryDestinations.length === 0 ? (
                <div className="bg-card border border-white/10 rounded-2xl px-6 py-14 text-center">
                  <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">
                    لا توجد مناطق توصيل بعد
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                    أضف المناطق التي يصل إليها المطعم وحدد رسم التوصيل لكل
                    منطقة.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddDeliveryDestination}
                    className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    إضافة أول منطقة
                  </button>
                </div>
              ) : (
                <div className="bg-card border border-white/10 rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-180">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                            المنطقة
                          </th>
                          <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                            رسم التوصيل
                          </th>
                          <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                            الحالة
                          </th>
                          <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                            الترتيب
                          </th>
                          <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                            الإجراءات
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/5">
                        {sortedDeliveryDestinations.map((destination) => (
                          <tr
                            key={destination.id}
                            className="hover:bg-white/2 transition-colors group"
                          >
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/10 flex items-center justify-center shrink-0">
                                  <MapPin className="w-4 h-4 text-primary" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground truncate">
                                    {destination.nameAr}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {destination.nameEn}
                                  </p>
                                </div>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-sm font-bold text-primary">
                                {formatPrice(Number(destination.deliveryFee))}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleDeliveryDestination(destination)
                                }
                                disabled={isDeliveryActionPending}
                                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-50 ${
                                  destination.isActive
                                    ? "bg-emerald-400/10 text-emerald-400 hover:bg-emerald-400/20"
                                    : "bg-white/5 text-muted-foreground hover:bg-white/10"
                                }`}
                              >
                                {destination.isActive ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    فعال
                                  </>
                                ) : (
                                  <>
                                    <X className="w-3.5 h-3.5" />
                                    متوقف
                                  </>
                                )}
                              </button>
                            </td>

                            <td className="px-5 py-4">
                              <span className="text-sm text-muted-foreground">
                                {destination.sortOrder}
                              </span>
                            </td>

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleEditDeliveryDestination(destination)
                                  }
                                  disabled={isDeliveryActionPending}
                                  className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
                                  aria-label="تعديل"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDeleteDeliveryDestination(destination)
                                  }
                                  disabled={isDeliveryActionPending}
                                  className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50"
                                  aria-label="حذف"
                                >
                                  {deleteDeliveryDestinationMutation.isPending &&
                                  deliveryDestinationPendingDelete?.id ===
                                    destination.id ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
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

      {/* Delivery destination form modal */}
      <AnimatePresence>
        {isDeliveryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                handleCloseDeliveryModal();
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
                  onClick={handleCloseDeliveryModal}
                  disabled={isSavingDeliveryDestination}
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
                      setDeliveryForm((current) => ({
                        ...current,
                        nameAr: event.target.value,
                      }))
                    }
                    placeholder="مثلاً: الحمرا"
                    className="w-full h-11 bg-background border border-white/10 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div>

                {/* <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    الاسم بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={deliveryForm.nameEn}
                    onChange={(event) =>
                      setDeliveryForm((current) => ({
                        ...current,
                        nameEn: event.target.value,
                      }))
                    }
                    placeholder="e.g. Hamra"
                    className="w-full h-11 bg-background border border-white/10 rounded-xl px-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                  />
                </div> */}

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
                          setDeliveryForm((current) => ({
                            ...current,
                            deliveryFee: event.target.value,
                          }))
                        }
                        placeholder="100000"
                        className="w-full h-11 bg-background border border-white/10 rounded-xl pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
                      />
                    </div>
                  </div>
                  {/* 
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      ترتيب العرض
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={deliveryForm.sortOrder}
                      onChange={(event) =>
                        setDeliveryForm((current) => ({
                          ...current,
                          sortOrder: event.target.value,
                        }))
                      }
                      className="w-full h-11 bg-background border border-white/10 rounded-xl px-4 text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors"
                    />
                  </div> */}
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
                      setDeliveryForm((current) => ({
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
                  onClick={handleCloseDeliveryModal}
                  disabled={isSavingDeliveryDestination}
                  className="flex-1 h-11 rounded-xl bg-white/5 text-foreground text-sm font-semibold hover:bg-white/10 transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>

                <button
                  type="button"
                  onClick={handleSaveDeliveryDestination}
                  disabled={isSavingDeliveryDestination}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingDeliveryDestination ? (
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

      {/* Delete delivery destination confirm */}
      <ConfirmDialog
        isOpen={Boolean(deliveryDestinationPendingDelete)}
        title="حذف منطقة التوصيل"
        description={
          deliveryDestinationPendingDelete
            ? `هل أنت متأكد من حذف "${deliveryDestinationPendingDelete.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف"
        isLoading={deleteDeliveryDestinationMutation.isPending}
        errorMessage={deleteErrorMessage}
        onConfirm={handleConfirmDeleteDeliveryDestination}
        onCancel={() => {
          setDeliveryDestinationPendingDelete(null);
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
