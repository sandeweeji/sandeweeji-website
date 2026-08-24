"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  axiosDelete,
  axiosGet,
  axiosPatch,
  axiosPost,
  axiosPut,
} from "@/lib/axios";

import type { Product, Category } from "@/lib/types";

import type { ProductFormPayload } from "@/components/admin/product-form-modal";
import type { CategoryFormPayload } from "@/components/admin/category-form-modal";

import type {
  AdminTab,
  CategoriesResponse,
  DeliveryDestination,
  DeliveryDestinationFormPayload,
  DeliveryFormState,
  ProductsResponse,
} from "@/components/admin/types";
import { groupProductsByVariant } from "@/lib/group-variants";

/**
 * All server data, local UI state and mutations for the admin panel live
 * here. The page component and tab components only consume the slices of
 * this hook's return value that they actually need.
 */
export function useAdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>("products");

  /* ---------------------------------------------------------------------- */
  /* Products query + local filter state                                    */
  /* ---------------------------------------------------------------------- */

  const [productSearch, setProductSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

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

  /* ---------------------------------------------------------------------- */
  /* Categories query                                                        */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Delivery destinations query                                             */
  /* ---------------------------------------------------------------------- */

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

  /* ---------------------------------------------------------------------- */
  /* Normalize + derive                                                      */
  /* ---------------------------------------------------------------------- */

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

  const stats = useMemo(
    () => ({
      totalProducts: products.length,
      availableProducts: products.filter((p) => p.available).length,
      hiddenProducts: products.filter((p) => !p.available).length,
      totalCategories: categories.length,
    }),
    [products, categories],
  );

  const filteredProducts = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    const filtered = products.filter((product) => {
      const matchesSearch =
        !search || product.nameAr.toLowerCase().includes(search);

      const matchesCategory =
        categoryFilter === "all" || product.categoryId === categoryFilter;

      return matchesSearch && matchesCategory;
    });

    return groupProductsByVariant(filtered);
  }, [products, productSearch, categoryFilter]);

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );

  const sortedDeliveryDestinations = useMemo(
    () => [...deliveryDestinations].sort((a, b) => a.sortOrder - b.sortOrder),
    [deliveryDestinations],
  );

  const refetchAll = () => {
    refetchProducts();
    refetchCategories();
    refetchDeliveryDestinations();
  };

  /* ---------------------------------------------------------------------- */
  /* Shared delete-error banner (used across all three delete confirms)      */
  /* ---------------------------------------------------------------------- */

  const [deleteErrorMessage, setDeleteErrorMessage] = useState<string | null>(
    null,
  );

  /* ---------------------------------------------------------------------- */
  /* Product modal + mutations                                               */
  /* ---------------------------------------------------------------------- */

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productPendingDelete, setProductPendingDelete] =
    useState<Product | null>(null);

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

  /* ---------------------------------------------------------------------- */
  /* Category modal + mutations                                              */
  /* ---------------------------------------------------------------------- */

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null,
  );
  const [categoryPendingDelete, setCategoryPendingDelete] =
    useState<Category | null>(null);

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

  /* ---------------------------------------------------------------------- */
  /* Delivery destination modal + mutations                                  */
  /* ---------------------------------------------------------------------- */

  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [selectedDeliveryDestination, setSelectedDeliveryDestination] =
    useState<DeliveryDestination | null>(null);
  const [
    deliveryDestinationPendingDelete,
    setDeliveryDestinationPendingDelete,
  ] = useState<DeliveryDestination | null>(null);
  const [deliveryForm, setDeliveryForm] = useState<DeliveryFormState>({
    nameAr: "",
    nameEn: "",
    deliveryFee: "",
    isActive: true,
    sortOrder: "0",
  });
  const [deliveryFormError, setDeliveryFormError] = useState<string | null>(
    null,
  );

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

  /* ---------------------------------------------------------------------- */
  /* Excel export                                                            */
  /* ---------------------------------------------------------------------- */

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

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

  /* ---------------------------------------------------------------------- */
  /* Combined pending flags                                                  */
  /* ---------------------------------------------------------------------- */

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

  return {
    // tabs
    activeTab,
    setActiveTab,

    // stats + errors
    stats,
    isLoading,
    isError,
    deleteErrorMessage,
    setDeleteErrorMessage,
    refetchAll,

    // products
    products,
    filteredProducts,
    productsLoading,
    productSearch,
    setProductSearch,
    categoryFilter,
    setCategoryFilter,
    isProductModalOpen,
    selectedProduct,
    handleAddProduct,
    handleEditProduct,
    handleCloseProductModal,
    handleSaveProduct,
    isSaving,
    toggleAvailability,
    toggleAvailabilityMutation,
    productPendingDelete,
    setProductPendingDelete,
    deleteProductMutation,
    handleConfirmDeleteProduct,
    isExporting,
    exportError,
    handleExportExcel,

    // categories
    categories,
    sortedCategories,
    categoriesLoading,
    categoriesError,
    isCategoryModalOpen,
    selectedCategory,
    handleAddCategory,
    handleEditCategory,
    handleCloseCategoryModal,
    handleSaveCategory,
    categoryPendingDelete,
    setCategoryPendingDelete,
    deleteCategoryMutation,
    handleConfirmDeleteCategory,

    // delivery destinations
    sortedDeliveryDestinations,
    deliveryDestinationsLoading,
    deliveryDestinationsError,
    refetchDeliveryDestinations,
    isDeliveryModalOpen,
    selectedDeliveryDestination,
    deliveryForm,
    setDeliveryForm,
    deliveryFormError,
    handleAddDeliveryDestination,
    handleEditDeliveryDestination,
    handleCloseDeliveryModal,
    handleSaveDeliveryDestination,
    handleToggleDeliveryDestination,
    handleDeleteDeliveryDestination,
    isSavingDeliveryDestination,
    isDeliveryActionPending,
    deliveryDestinationPendingDelete,
    setDeliveryDestinationPendingDelete,
    deleteDeliveryDestinationMutation,
    handleConfirmDeleteDeliveryDestination,
  };
}
