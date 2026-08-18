"use client";
import { useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  ShoppingBag,
  ShoppingCart,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocaleStore } from "@/lib/locale-store";
import { useCartStore } from "@/lib/cart-store";
import { t } from "@/lib/i18n";
import { axiosGet } from "@/lib/axios";
import { cn } from "@/lib/utils";
import ProductCard from "@/components/menu/product-card";
import ProductModal from "@/components/menu/product-modal";
import type { Product, Category } from "@/lib/types";

const SORT_OPTIONS = [
  { value: "default", labelEn: "Default", labelAr: "الافتراضي" },
  {
    value: "price-asc",
    labelEn: "Price: Low–High",
    labelAr: "السعر: الأقل أولاً",
  },
  {
    value: "price-desc",
    labelEn: "Price: High–Low",
    labelAr: "السعر: الأعلى أولاً",
  },
  { value: "popular", labelEn: "Popular First", labelAr: "الأكثر شعبية" },
];

interface ProductsResponse {
  products?: Product[];
}
interface CategoriesResponse {
  categories?: Category[];
}

export default function MenuPage() {
  const { locale } = useLocaleStore();
  const isRtl = locale === "ar";
  const totalItems = useCartStore((s) => s.totalItems());
  const toggleCart = useCartStore((s) => s.toggleCart);

  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const categoryRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  /* ---- Live data ---- */
  const {
    data: productsResponse,
    isLoading: productsLoading,
    isError: productsError,
    refetch: refetchProducts,
  } = useQuery({
    queryKey: ["menu-products"],
    queryFn: async () => {
      const response = await axiosGet<Product[] | ProductsResponse>("products");
      if (!response.data)
        throw new Error(response.message || "Failed to fetch products");
      return response.data;
    },
  });

  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useQuery({
    queryKey: ["menu-categories"],
    queryFn: async () => {
      const response = await axiosGet<Category[] | CategoriesResponse>(
        "categories",
      );
      if (!response.data)
        throw new Error(response.message || "Failed to fetch categories");
      return response.data;
    },
  });

  const products: Product[] = Array.isArray(productsResponse)
    ? productsResponse
    : (productsResponse?.products ?? []);

  const categories: Category[] = useMemo(() => {
    const list: Category[] = Array.isArray(categoriesResponse)
      ? categoriesResponse
      : (categoriesResponse?.categories ?? []);
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categoriesResponse]);

  const isLoading = productsLoading || categoriesLoading;
  const isError = productsError || categoriesError;

  /* ---- Filtered & sorted products ---- */
  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") {
      list = list.filter((p) => p.categoryId === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.nameEn?.toLowerCase().includes(q) ||
          p.nameAr.includes(q) ||
          p.descriptionEn?.toLowerCase().includes(q) ||
          p.descriptionAr.includes(q),
      );
    }
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (sort === "popular")
      list.sort(
        (a, b) =>
          (b.badges.includes("popular") ? 1 : 0) -
          (a.badges.includes("popular") ? 1 : 0),
      );
    return list;
  }, [products, activeCategory, search, sort]);

  /* ---- Category click: scroll to section ---- */
  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    if (catId !== "all") {
      const el = categoryRefs.current[catId];
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const groupedByCategory = useMemo(() => {
    if (activeCategory !== "all" || search || sort !== "default") return null;
    return categories
      .filter((c) => c.visible)
      .map((cat) => ({
        category: cat,
        products: products.filter(
          (p) => p.categoryId === cat.id && p.available,
        ),
      }))
      .filter((g) => g.products.length > 0);
  }, [categories, products, activeCategory, search, sort]);

  return (
    <main className="min-h-screen bg-background" dir={isRtl ? "rtl" : "ltr"}>
      {/* Page Header */}
      <div className="relative pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-5xl sm:text-6xl font-extrabold text-foreground mb-3">
            {isRtl ? "القائمة" : "Our Menu"}
          </h1>
          <p className="text-muted-foreground text-lg">
            {isRtl
              ? "كل ما تحتاجه في مكان واحد"
              : "Everything you need, in one place"}
          </p>
        </motion.div>

        {/* Search + Sort bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRtl ? "right-4" : "left-4"}`}
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("search", locale)}
              className={`w-full h-12 bg-card border border-white/10 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors ${isRtl ? "pr-11 pl-10" : "pl-11 pr-10"}`}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className={`absolute top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors ${isRtl ? "left-3" : "right-3"}`}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sort */}
          <div className="relative sm:w-52">
            <SlidersHorizontal
              className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none ${isRtl ? "right-4" : "left-4"}`}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={`w-full h-12 bg-card border border-white/10 rounded-xl text-sm text-foreground focus:outline-none focus:border-primary/50 transition-colors appearance-none ${isRtl ? "pr-11" : "pl-11"} pr-4`}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-card">
                  {isRtl ? o.labelAr : o.labelEn}
                </option>
              ))}
            </select>
          </div>
        </motion.div>
      </div>

      {/* Sticky Category Nav */}
      <div className="sticky top-16  z-30 bg-background/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            ref={navRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-3"
          >
            {/* All */}
            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={() => handleCategoryClick("all")}
              className={cn(
                "flex-shrink-0 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                activeCategory === "all"
                  ? "bg-primary text-primary-foreground glow-brand-sm"
                  : "bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30",
              )}
            >
              {isRtl ? "الكل" : "All"}
            </motion.button>
            {categories
              .filter((c) => c.visible)
              .map((cat) => {
                const catName =
                  locale === "ar" ? cat.nameAr : (cat.nameEn ?? cat.nameAr);
                return (
                  <motion.button
                    key={cat.id}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={cn(
                      "flex-shrink-0 flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                      activeCategory === cat.id
                        ? "bg-primary text-primary-foreground glow-brand-sm"
                        : "bg-card border border-white/10 text-muted-foreground hover:text-foreground hover:border-primary/30",
                    )}
                  >
                    <span>{cat.emoji}</span>
                    {catName}
                  </motion.button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-8">
        {/* Error */}
        {isError && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3 mb-8">
            <p className="text-sm text-destructive">
              {isRtl
                ? "حدث خطأ أثناء تحميل القائمة."
                : "Something went wrong loading the menu."}
            </p>
            <button
              onClick={() => {
                refetchProducts();
                refetchCategories();
              }}
              className="mt-2 text-sm font-semibold text-destructive underline"
            >
              {isRtl ? "إعادة المحاولة" : "Try again"}
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !isError && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="bg-card border border-white/10 rounded-2xl overflow-hidden"
              >
                <div className="h-44 bg-surface animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-surface rounded animate-pulse w-2/3" />
                  <div className="h-3 bg-surface rounded animate-pulse w-full" />
                  <div className="h-8 bg-surface rounded animate-pulse w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* Search / filtered flat list */}
            {(search || activeCategory !== "all" || sort !== "default") && (
              <div>
                {filtered.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24 gap-4"
                  >
                    <span className="text-6xl">🔍</span>
                    <p className="text-lg font-semibold text-foreground">
                      {t("noItems", locale)}
                    </p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setActiveCategory("all");
                        setSort("default");
                      }}
                      className="text-sm text-primary hover:underline"
                    >
                      {t("clearSearch", locale)}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                  >
                    <AnimatePresence mode="popLayout">
                      {filtered.map((product) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          onOpenModal={setModalProduct}
                        />
                      ))}
                    </AnimatePresence>
                  </motion.div>
                )}
              </div>
            )}

            {/* Grouped by category (default view) */}
            {groupedByCategory && (
              <div className="space-y-16">
                {groupedByCategory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <span className="text-6xl">🍽️</span>
                    <p className="text-lg font-semibold text-foreground">
                      {isRtl
                        ? "لا توجد منتجات متاحة حاليًا."
                        : "No items available right now."}
                    </p>
                  </div>
                ) : (
                  groupedByCategory.map(
                    ({ category, products: catProducts }) => {
                      const catName =
                        locale === "ar"
                          ? category.nameAr
                          : (category.nameEn ?? category.nameAr);
                      return (
                        <section
                          key={category.id}
                          ref={(el) => {
                            categoryRefs.current[category.id] = el;
                          }}
                        >
                          <div className="flex items-center gap-3 mb-6">
                            <span className="text-3xl">{category.emoji}</span>
                            <h2 className="text-2xl font-extrabold text-foreground">
                              {catName}
                            </h2>
                            <span className="text-sm text-muted-foreground">
                              ({catProducts.length})
                            </span>
                          </div>
                          <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                          >
                            {catProducts.map((product) => (
                              <ProductCard
                                key={product.id}
                                product={product}
                                onOpenModal={setModalProduct}
                              />
                            ))}
                          </motion.div>
                        </section>
                      );
                    },
                  )
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Floating Cart FAB */}
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.button
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={toggleCart}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground font-bold shadow-2xl glow-brand"
          >
            <ShoppingCart className="relative z-10 w-5 h-5" />
            {isRtl
              ? `${totalItems} أصناف في السلة`
              : `${totalItems} item${totalItems > 1 ? "s" : ""} in cart`}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Product Modal */}
      <ProductModal
        product={modalProduct}
        onClose={() => setModalProduct(null)}
      />
    </main>
  );
}
