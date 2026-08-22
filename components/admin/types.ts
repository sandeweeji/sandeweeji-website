import type { Product, Category } from "@/lib/types";

/* -------------------------------------------------------------------------- */
/* API response shapes                                                        */
/* -------------------------------------------------------------------------- */

export interface ProductsResponse {
  products?: Product[];
}

export interface CategoriesResponse {
  categories?: Category[];
}

export interface DeliverySubDestination {
  id: string;
  destinationId: string;
  nameAr: string;
  nameEn: string | null;
  deliveryFee: number;
  isActive: boolean;
  sortOrder: number;
}

export interface DeliveryDestination {
  id: string;
  nameAr: string;
  nameEn: string;
  deliveryFee: string | number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  subDestinations: DeliverySubDestination[];
}

export interface DeliveryDestinationFormPayload {
  id?: string;
  nameAr: string;
  nameEn: string;
  deliveryFee: number;
  isActive: boolean;
  sortOrder: number;
}

export interface DeliveryFormState {
  nameAr: string;
  nameEn: string;
  deliveryFee: string;
  isActive: boolean;
  sortOrder: string;
}

export type AdminTab = "products" | "categories" | "delivery";
