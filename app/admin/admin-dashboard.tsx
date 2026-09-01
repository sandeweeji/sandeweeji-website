"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ChefHat,
  Eye,
  EyeOff,
  LayoutGrid,
  LogOut,
  MapPin,
  Package,
  Tag,
} from "lucide-react";

import ProductFormModal from "@/components/admin/product-form-modal";
import CategoryFormModal from "@/components/admin/category-form-modal";
import ConfirmDialog from "@/components/admin/confirm-dialog";

import { StatCard } from "@/components/admin/stat-card";
import { TabButton } from "@/components/admin/tab-button";
import { ProductsTab } from "@/components/admin/products-tab";
import { CategoriesTab } from "@/components/admin/categories-tab";
import { DeliveryTab } from "@/components/admin/delivery-tab";
import { DeliveryDestinationModal } from "@/components/admin/delivery-destination-modal";

import { useAdminPanel } from "@/hooks/use-admin-panel";

export default function AdminPage() {
  const admin = useAdminPanel();

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
            value={admin.stats.totalProducts}
          />
          <StatCard
            icon={<Eye className="w-4 h-4" />}
            label="متاح"
            value={admin.stats.availableProducts}
            tone="positive"
          />
          <StatCard
            icon={<EyeOff className="w-4 h-4" />}
            label="مخفي"
            value={admin.stats.hiddenProducts}
            tone="muted"
          />
          <StatCard
            icon={<LayoutGrid className="w-4 h-4" />}
            label="التصنيفات"
            value={admin.stats.totalCategories}
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-5 border-b border-white/10">
          <TabButton
            active={admin.activeTab === "products"}
            onClick={() => admin.setActiveTab("products")}
            icon={<Package className="w-4 h-4" />}
            label="المنتجات"
          />
          <TabButton
            active={admin.activeTab === "categories"}
            onClick={() => admin.setActiveTab("categories")}
            icon={<Tag className="w-4 h-4" />}
            label="التصنيفات"
          />
          <TabButton
            active={admin.activeTab === "delivery"}
            onClick={() => admin.setActiveTab("delivery")}
            icon={<MapPin className="w-4 h-4" />}
            label="التوصيل"
          />
        </div>

        {admin.isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-5">
            <p className="text-sm text-destructive">
              حدث خطأ أثناء تحميل البيانات.
            </p>
            <button
              type="button"
              onClick={admin.refetchAll}
              className="mt-2 text-sm font-semibold text-destructive underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          {admin.activeTab === "products" ? (
            <ProductsTab
              key="products-tab"
              isLoading={admin.isLoading}
              isError={Boolean(admin.isError)}
              products={admin.products}
              filteredProducts={admin.filteredProducts}
              categories={admin.categories}
              sortedCategories={admin.sortedCategories}
              productSearch={admin.productSearch}
              onSearchChange={admin.setProductSearch}
              categoryFilter={admin.categoryFilter}
              onCategoryFilterChange={admin.setCategoryFilter}
              isExporting={admin.isExporting}
              exportError={admin.exportError}
              onExport={admin.handleExportExcel}
              isSaving={admin.isSaving}
              isTogglingAvailability={
                admin.toggleAvailabilityMutation.isPending
              }
              isReordering={admin.isReordering}
              onAddProduct={admin.handleAddProduct}
              onEditProduct={admin.handleEditProduct}
              onRequestDelete={(product) => {
                admin.setDeleteErrorMessage(null);
                admin.setProductPendingDelete(product);
              }}
              onToggleAvailability={admin.toggleAvailability}
              onReorderProducts={admin.handleReorderProducts}
            />
          ) : admin.activeTab === "categories" ? (
            <CategoriesTab
              key="categories-tab"
              categoriesLoading={admin.categoriesLoading}
              categoriesError={admin.categoriesError}
              sortedCategories={admin.sortedCategories}
              isSaving={admin.isSaving}
              onAddCategory={admin.handleAddCategory}
              onEditCategory={admin.handleEditCategory}
              onRequestDelete={(category) => {
                admin.setDeleteErrorMessage(null);
                admin.setCategoryPendingDelete(category);
              }}
            />
          ) : (
            <DeliveryTab
              key="delivery-tab"
              deliveryDestinationsLoading={admin.deliveryDestinationsLoading}
              deliveryDestinationsError={Boolean(
                admin.deliveryDestinationsError,
              )}
              sortedDeliveryDestinations={admin.sortedDeliveryDestinations}
              isDeliveryActionPending={admin.isDeliveryActionPending}
              deliveryDestinationPendingDeleteId={
                admin.deliveryDestinationPendingDelete?.id ?? null
              }
              isDeletingDestination={
                admin.deleteDeliveryDestinationMutation.isPending
              }
              onAdd={admin.handleAddDeliveryDestination}
              onEdit={admin.handleEditDeliveryDestination}
              onToggle={admin.handleToggleDeliveryDestination}
              onRequestDelete={admin.handleDeleteDeliveryDestination}
              onRetry={admin.refetchDeliveryDestinations}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Product form modal */}
      <ProductFormModal
        isOpen={admin.isProductModalOpen}
        onClose={admin.handleCloseProductModal}
        product={admin.selectedProduct}
        categories={admin.sortedCategories}
        onSave={admin.handleSaveProduct}
      />

      {/* Category form modal */}
      <CategoryFormModal
        isOpen={admin.isCategoryModalOpen}
        onClose={admin.handleCloseCategoryModal}
        category={admin.selectedCategory}
        onSave={admin.handleSaveCategory}
      />

      {/* Delivery destination form modal */}
      <DeliveryDestinationModal
        isOpen={admin.isDeliveryModalOpen}
        selectedDeliveryDestination={admin.selectedDeliveryDestination}
        deliveryForm={admin.deliveryForm}
        onFormChange={admin.setDeliveryForm}
        deliveryFormError={admin.deliveryFormError}
        isSaving={admin.isSavingDeliveryDestination}
        onClose={admin.handleCloseDeliveryModal}
        onSave={admin.handleSaveDeliveryDestination}
      />

      {/* Delete product confirm */}
      <ConfirmDialog
        isOpen={Boolean(admin.productPendingDelete)}
        title="حذف المنتج"
        description={
          admin.productPendingDelete
            ? `هل أنت متأكد من حذف "${admin.productPendingDelete.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف"
        isLoading={admin.deleteProductMutation.isPending}
        errorMessage={admin.deleteErrorMessage}
        onConfirm={admin.handleConfirmDeleteProduct}
        onCancel={() => {
          admin.setProductPendingDelete(null);
          admin.setDeleteErrorMessage(null);
        }}
      />

      {/* Delete category confirm */}
      <ConfirmDialog
        isOpen={Boolean(admin.categoryPendingDelete)}
        title="حذف التصنيف"
        description={
          admin.categoryPendingDelete
            ? `هل أنت متأكد من حذف "${admin.categoryPendingDelete.nameAr}"؟${
                (admin.categoryPendingDelete._count?.products ?? 0) > 0
                  ? " يحتوي هذا التصنيف على منتجات مرتبطة به."
                  : ""
              }`
            : ""
        }
        confirmLabel="حذف"
        isLoading={admin.deleteCategoryMutation.isPending}
        errorMessage={admin.deleteErrorMessage}
        onConfirm={admin.handleConfirmDeleteCategory}
        onCancel={() => {
          admin.setCategoryPendingDelete(null);
          admin.setDeleteErrorMessage(null);
        }}
      />

      {/* Delete delivery destination confirm */}
      <ConfirmDialog
        isOpen={Boolean(admin.deliveryDestinationPendingDelete)}
        title="حذف منطقة التوصيل"
        description={
          admin.deliveryDestinationPendingDelete
            ? `هل أنت متأكد من حذف "${admin.deliveryDestinationPendingDelete.nameAr}"؟ لا يمكن التراجع عن هذا الإجراء.`
            : ""
        }
        confirmLabel="حذف"
        isLoading={admin.deleteDeliveryDestinationMutation.isPending}
        errorMessage={admin.deleteErrorMessage}
        onConfirm={admin.handleConfirmDeleteDeliveryDestination}
        onCancel={() => {
          admin.setDeliveryDestinationPendingDelete(null);
          admin.setDeleteErrorMessage(null);
        }}
      />
    </main>
  );
}
