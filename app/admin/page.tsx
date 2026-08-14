"use client";

import { useState } from "react";
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

import { PRODUCTS, CATEGORIES } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import type { Product, Category } from "@/lib/types";

import ProductFormModal, {
  type ProductFormPayload,
} from "@/components/admin/product-form-modal";

export default function AdminPage() {
  const [productSearch, setProductSearch] = useState("");

  const [products, setProducts] = useState<Product[]>(PRODUCTS as Product[]);

  const [categories] = useState<Category[]>(CATEGORIES as Category[]);

  const [availabilityMap, setAvailabilityMap] = useState<
    Record<string, boolean>
  >(
    Object.fromEntries(
      products.map((product) => [product.id, product.available]),
    ),
  );

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  /* ------------------------------------------------------------------
   * Search
   * ---------------------------------------------------------------- */

  const filteredProducts = products.filter((product) => {
    const search = productSearch.toLowerCase();

    return (
      product.nameAr.toLowerCase().includes(search) ||
      // Future English support:
      // product.nameEn?.toLowerCase().includes(search) ||
      false
    );
  });

  /* ------------------------------------------------------------------
   * Open modal
   * ---------------------------------------------------------------- */

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

  /* ------------------------------------------------------------------
   * Availability
   *
   * Local only for now because you don't have API routes yet.
   * ---------------------------------------------------------------- */

  const toggleAvailability = (id: string) => {
    setAvailabilityMap((prev) => {
      const nextAvailable = !prev[id];

      return {
        ...prev,
        [id]: nextAvailable,
      };
    });

    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              available: !product.available,
            }
          : product,
      ),
    );
  };

  /* ------------------------------------------------------------------
   * Save
   *
   * No API route yet.
   *
   * This only updates the local state so you can test the complete UI.
   * Later replace this function with your server/API/database logic.
   * ---------------------------------------------------------------- */

  const handleSaveProduct = async (
    payload: ProductFormPayload,
  ): Promise<void> => {
    if (payload.id) {
      // ---------------------------------------------------------------
      // EDIT
      // ---------------------------------------------------------------

      setProducts((prev) =>
        prev.map((product) => {
          if (product.id !== payload.id) return product;

          return {
            ...product,

            categoryId: payload.categoryId,
            nameAr: payload.nameAr,

            // Future English support:
            // nameEn: payload.nameEn,

            descriptionAr: payload.descriptionAr,

            // Future English support:
            // descriptionEn: payload.descriptionEn,

            price: payload.price,
            image: payload.image,
            calories: payload.calories,
            badges: payload.badges as Product["badges"],
            available: payload.available,

            extras: payload.extras.map((extra) => ({
              id: extra.id ?? crypto.randomUUID(),
              productId: product.id,
              type: extra.type,
              nameAr: extra.nameAr,

              // Future English support:
              // nameEn: extra.nameEn,

              price: extra.price,
              sortOrder: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            })),
          };
        }),
      );

      setAvailabilityMap((prev) => ({
        ...prev,
        [payload.id!]: payload.available,
      }));

      return;
    }

    // ---------------------------------------------------------------
    // CREATE
    // ---------------------------------------------------------------

    const newProductId = crypto.randomUUID();

    const newProduct: Product = {
      id: newProductId,

      categoryId: payload.categoryId,

      nameAr: payload.nameAr,

      // Future English support:
      // nameEn: payload.nameEn,

      descriptionAr: payload.descriptionAr,

      // Future English support:
      // descriptionEn: payload.descriptionEn,

      price: payload.price,
      image: payload.image,
      calories: payload.calories,
      badges: payload.badges as Product["badges"],
      available: payload.available,

      sortOrder: products.length,

      extras: payload.extras.map((extra) => ({
        id: extra.id ?? crypto.randomUUID(),
        productId: newProductId,
        type: extra.type,
        nameAr: extra.nameAr,

        // Future English support:
        // nameEn: extra.nameEn,

        price: extra.price,
        sortOrder: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setProducts((prev) => [...prev, newProduct]);

    setAvailabilityMap((prev) => ({
      ...prev,
      [newProductId]: newProduct.available,
    }));
  };

  /* ------------------------------------------------------------------
   * Delete
   *
   * Local only for now.
   * ---------------------------------------------------------------- */

  const handleDeleteProduct = async (productId: string): Promise<void> => {
    setProducts((prev) => prev.filter((product) => product.id !== productId));

    setAvailabilityMap((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        {/* ------------------------------------------------------------
         * Header
         * ---------------------------------------------------------- */}

        <div className="flex items-center justify-between mb-8">
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
              Menu Management
            </h1>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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

        {/* ------------------------------------------------------------
         * Menu
         * ---------------------------------------------------------- */}

        <div className="space-y-5">
          {/* Search + Add */}

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />

              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full h-11 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 pl-11 pr-4 focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            <button
              type="button"
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          {/* ----------------------------------------------------------
           * Products table
           * -------------------------------------------------------- */}

          <div className="bg-card border border-white/5 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                      Product
                    </th>

                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5 hidden sm:table-cell">
                      Category
                    </th>

                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                      Price
                    </th>

                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                      Available
                    </th>

                    <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map((product) => {
                    const category = categories.find(
                      (c) => c.id === product.categoryId,
                    );

                    const available =
                      availabilityMap[product.id] ?? product.available;

                    return (
                      <tr
                        key={product.id}
                        className="hover:bg-white/2 transition-colors group"
                      >
                        {/* Product */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-surface flex-shrink-0">
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

                              {/* Future English support:
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
                            onClick={() => toggleAvailability(product.id)}
                            className="transition-colors"
                            aria-label={
                              available ? "Mark unavailable" : "Mark available"
                            }
                          >
                            {available ? (
                              <ToggleRight className="w-6 h-6 text-emerald-400" />
                            ) : (
                              <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                            )}
                          </button>
                        </td>

                        {/* Actions */}

                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="w-8 h-8 rounded-lg hover:bg-primary/10 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                              aria-label="Edit product"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleEditProduct(product)}
                              className="w-8 h-8 rounded-lg hover:bg-destructive/10 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                              aria-label="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center">
                        <p className="text-sm text-muted-foreground">
                          No products found.
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

      {/* --------------------------------------------------------------
       * Product Form Modal
       * ------------------------------------------------------------ */}

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
