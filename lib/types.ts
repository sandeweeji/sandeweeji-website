import type {
  Badge as PrismaBadge,
  ExtraType as PrismaExtraType,
} from "@prisma/client";

export type Badge = PrismaBadge;
export type ExtraType = PrismaExtraType;

export interface Category {
  id: string;
  nameEn?: string | null;
  nameAr: string;
  emoji: string;
  visible: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Extra {
  id: string;
  productId: string;
  type: ExtraType;

  // Kept for future English support.
  // Currently the admin UI only uses Arabic.
  nameEn?: string | null;

  nameAr: string;

  price: number;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;

  categoryId: string;

  nameEn?: string | null;
  nameAr: string;

  descriptionEn?: string | null;
  descriptionAr: string;

  price: number;

  image: string;

  calories?: number | null;

  badges: Badge[];

  available: boolean;

  sortOrder: number;

  extras: Extra[];

  createdAt: Date;
  updatedAt: Date;
}
