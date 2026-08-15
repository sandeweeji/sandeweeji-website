/* -------------------------------------------------------------------------- */
/* NOTE: This is a reference file.                                           */
/* Merge these types into your existing lib/types.ts — don't blindly         */
/* overwrite it if you already have other types/exports in there.            */
/* -------------------------------------------------------------------------- */

export type Badge =
  | "popular"
  | "new"
  | "spicy"
  | "meal"
  | "bestseller"
  | "limited";

export type ExtraType = "ADD" | "REMOVE";

export interface Category {
  id: string;
  nameEn: string | null;
  nameAr: string;
  emoji: string;
  visible: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  /** Present only when the API includes product counts (e.g. category list in admin). */
  _count?: {
    products: number;
  };
}

export interface Extra {
  id: string;
  productId: string;
  type: ExtraType;
  nameEn: string | null;
  nameAr: string;
  price: number;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  categoryId: string;
  nameEn: string | null;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string;
  price: number;
  image: string;
  calories: number | null;
  badges: Badge[];
  available: boolean;
  sortOrder: number;
  extras: Extra[];
  createdAt: string;
  updatedAt: string;
}
