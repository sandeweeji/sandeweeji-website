import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, ExtraType } from "@prisma/client"; // 1. Added ExtraType import
import { requireAdmin } from "@/lib/auth/require-admin";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface ExtraInput {
  type?: ExtraType | "ADD" | "REMOVE"; // 2. Updated to use ExtraType
  nameAr?: string;
  nameEn?: string;
  price?: number | string;
  sortOrder?: number;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function serializeProduct<
  T extends {
    price: Prisma.Decimal;
    extras: { price: Prisma.Decimal }[];
  },
>(product: T) {
  return {
    ...product,
    price: Number(product.price),
    extras: product.extras.map((extra) => ({
      ...extra,
      price: Number(extra.price),
    })),
  };
}

function buildExtrasCreate(
  extras: ExtraInput[],
): Prisma.ExtraCreateWithoutProductInput[] {
  // 3. Added return type signature
  return extras.map((extra, index) => ({
    type: extra.type === ExtraType.REMOVE ? ExtraType.REMOVE : ExtraType.ADD,
    nameAr: extra.nameAr?.trim() || "",
    nameEn: extra.nameEn?.trim() || null,
    price:
      extra.type === ExtraType.REMOVE
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(extra.price ?? 0),
    sortOrder: extra.sortOrder === undefined ? index : Number(extra.sortOrder),
  }));
}
