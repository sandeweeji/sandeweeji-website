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

/* -------------------------------------------------------------------------- */
/* GET - Get one product                                                      */
/* -------------------------------------------------------------------------- */

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        extras: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { status: 404, message: "المنتج غير موجود." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      status: 200,
      data: serializeProduct(product),
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء جلب المنتج." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PUT - Full update (used by the product form: name, price, extras, etc.)   */
/* -------------------------------------------------------------------------- */

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const {
      categoryId,
      nameAr,
      nameEn,
      descriptionAr,
      descriptionEn,
      price,
      image,
      calories,
      badges,
      available,
      sortOrder,
      extras,
    } = body;

    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json(
        { status: 404, message: "المنتج غير موجود." },
        { status: 404 },
      );
    }

    /* ---------------------------- Validation ------------------------------ */

    if (!categoryId) {
      return NextResponse.json(
        { status: 400, message: "التصنيف مطلوب." },
        { status: 400 },
      );
    }

    if (!nameAr?.trim()) {
      return NextResponse.json(
        { status: 400, message: "اسم المنتج مطلوب." },
        { status: 400 },
      );
    }

    if (!descriptionAr?.trim()) {
      return NextResponse.json(
        { status: 400, message: "وصف المنتج مطلوب." },
        { status: 400 },
      );
    }

    if (
      price === undefined ||
      price === null ||
      Number(price) < 0 ||
      Number.isNaN(Number(price))
    ) {
      return NextResponse.json(
        { status: 400, message: "سعر المنتج غير صالح." },
        { status: 400 },
      );
    }

    if (!image?.trim()) {
      return NextResponse.json(
        { status: 400, message: "صورة المنتج مطلوبة." },
        { status: 400 },
      );
    }

    if (
      calories !== undefined &&
      calories !== null &&
      calories !== "" &&
      (Number.isNaN(Number(calories)) || Number(calories) < 0)
    ) {
      return NextResponse.json(
        { status: 400, message: "السعرات الحرارية غير صالحة." },
        { status: 400 },
      );
    }

    if (Array.isArray(extras)) {
      for (const extra of extras as ExtraInput[]) {
        if (!extra.nameAr?.trim()) {
          return NextResponse.json(
            { status: 400, message: "كل خيار إضافي يجب أن يحتوي على اسم." },
            { status: 400 },
          );
        }

        if (
          extra.type !== "REMOVE" &&
          extra.price !== undefined &&
          (Number.isNaN(Number(extra.price)) || Number(extra.price) < 0)
        ) {
          return NextResponse.json(
            { status: 400, message: "سعر أحد الإضافات غير صالح." },
            { status: 400 },
          );
        }
      }
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { status: 404, message: "التصنيف المحدد غير موجود." },
        { status: 404 },
      );
    }

    /* ------------------------------ Update --------------------------------- */

    const updatedProduct = await prisma.$transaction(async (tx) => {
      await tx.extra.deleteMany({ where: { productId: id } });

      return tx.product.update({
        where: { id },
        data: {
          categoryId,
          nameAr: nameAr.trim(),
          nameEn: nameEn?.trim() || null,
          descriptionAr: descriptionAr.trim(),
          descriptionEn: descriptionEn?.trim() || null,
          price: new Prisma.Decimal(price),
          image: image.trim(),
          calories:
            calories === undefined || calories === null || calories === ""
              ? null
              : Number(calories),
          badges: Array.isArray(badges) ? badges : [],
          available: available ?? true,
          sortOrder:
            sortOrder === undefined || sortOrder === null
              ? existingProduct.sortOrder
              : Number(sortOrder),
          extras:
            Array.isArray(extras) && extras.length > 0
              ? { create: buildExtrasCreate(extras) }
              : undefined,
        },
        include: {
          extras: { orderBy: { sortOrder: "asc" } },
        },
      });
    });

    return NextResponse.json({
      status: 200,
      message: "تم تعديل المنتج بنجاح.",
      data: serializeProduct(updatedProduct),
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء تعديل المنتج." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PATCH - Partial update (e.g. flipping `available` from the admin table    */
/* without re-submitting the whole product form).                           */
/* -------------------------------------------------------------------------- */

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json(
        { status: 404, message: "المنتج غير موجود." },
        { status: 404 },
      );
    }

    const data: Prisma.ProductUpdateInput = {};

    if (body.available !== undefined) {
      data.available = Boolean(body.available);
    }

    if (body.sortOrder !== undefined) {
      data.sortOrder = Number(body.sortOrder);
    }

    if (body.categoryId !== undefined) {
      const category = await prisma.category.findUnique({
        where: { id: body.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          { status: 404, message: "التصنيف المحدد غير موجود." },
          { status: 404 },
        );
      }

      data.category = { connect: { id: body.categoryId } };
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { status: 400, message: "لا يوجد ما يتم تعديله." },
        { status: 400 },
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data,
      include: {
        extras: { orderBy: { sortOrder: "asc" } },
      },
    });

    return NextResponse.json({
      status: 200,
      message: "تم تعديل المنتج بنجاح.",
      data: serializeProduct(updatedProduct),
    });
  } catch (error) {
    console.error("PATCH /api/products/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء تعديل المنتج." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE - Delete product                                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingProduct = await prisma.product.findUnique({ where: { id } });

    if (!existingProduct) {
      return NextResponse.json(
        { status: 404, message: "المنتج غير موجود." },
        { status: 404 },
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      status: 200,
      message: "تم حذف المنتج بنجاح.",
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء حذف المنتج." },
      { status: 500 },
    );
  }
}
