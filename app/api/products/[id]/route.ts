import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/* -------------------------------------------------------------------------- */
/* GET - Get one product                                                      */
/* -------------------------------------------------------------------------- */

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const product = await prisma.product.findUnique({
      where: {
        id,
      },

      include: {
        extras: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          status: 404,
          message: "المنتج غير موجود.",
        },
        {
          status: 404,
        },
      );
    }

    const serializedProduct = {
      ...product,

      price: Number(product.price),

      extras: product.extras.map((extra) => ({
        ...extra,
        price: Number(extra.price),
      })),
    };

    return NextResponse.json({
      status: 200,
      data: serializedProduct,
    });
  } catch (error) {
    console.error("GET /api/products/[id] error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء جلب المنتج.",
      },
      {
        status: 500,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PUT - Update product                                                       */
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

    /* ---------------------------------------------------------------------- */
    /* Check product                                                          */
    /* ---------------------------------------------------------------------- */

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          status: 404,
          message: "المنتج غير موجود.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    if (!categoryId) {
      return NextResponse.json(
        {
          status: 400,
          message: "التصنيف مطلوب.",
        },
        {
          status: 400,
        },
      );
    }

    if (!nameAr?.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "اسم المنتج مطلوب.",
        },
        {
          status: 400,
        },
      );
    }

    if (!descriptionAr?.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "وصف المنتج مطلوب.",
        },
        {
          status: 400,
        },
      );
    }

    if (price === undefined || price === null || Number(price) < 0) {
      return NextResponse.json(
        {
          status: 400,
          message: "سعر المنتج غير صالح.",
        },
        {
          status: 400,
        },
      );
    }

    if (!image?.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "صورة المنتج مطلوبة.",
        },
        {
          status: 400,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Check category                                                         */
    /* ---------------------------------------------------------------------- */

    const category = await prisma.category.findUnique({
      where: {
        id: categoryId,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          status: 404,
          message: "التصنيف المحدد غير موجود.",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Update product                                                         */
    /* ---------------------------------------------------------------------- */

    const updatedProduct = await prisma.$transaction(async (tx) => {
      /* -------------------------------------------------------------------- */
      /* Delete old extras                                                    */
      /* -------------------------------------------------------------------- */

      await tx.extra.deleteMany({
        where: {
          productId: id,
        },
      });

      /* -------------------------------------------------------------------- */
      /* Update product                                                       */
      /* -------------------------------------------------------------------- */

      const product = await tx.product.update({
        where: {
          id,
        },

        data: {
          categoryId,

          nameAr: nameAr.trim(),

          // Future English support
          nameEn: nameEn?.trim() || null,

          descriptionAr: descriptionAr.trim(),

          // Future English support
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

          /* ---------------------------------------------------------------- */
          /* Re-create extras                                                 */
          /* ---------------------------------------------------------------- */

          extras:
            Array.isArray(extras) && extras.length > 0
              ? {
                  create: extras.map(
                    (
                      extra: {
                        type?: "ADD" | "REMOVE";
                        nameAr?: string;
                        nameEn?: string;
                        price?: number | string;
                        sortOrder?: number;
                      },
                      index: number,
                    ) => ({
                      type: extra.type === "REMOVE" ? "REMOVE" : "ADD",

                      nameAr: extra.nameAr?.trim() || "",

                      // Future English support
                      nameEn: extra.nameEn?.trim() || null,

                      price:
                        extra.type === "REMOVE"
                          ? new Prisma.Decimal(0)
                          : new Prisma.Decimal(extra.price ?? 0),

                      sortOrder:
                        extra.sortOrder === undefined
                          ? index
                          : Number(extra.sortOrder),
                    }),
                  ),
                }
              : undefined,
        },

        include: {
          extras: {
            orderBy: {
              sortOrder: "asc",
            },
          },
        },
      });

      return product;
    });

    /* ---------------------------------------------------------------------- */
    /* Serialize Decimal values                                               */
    /* ---------------------------------------------------------------------- */

    const serializedProduct = {
      ...updatedProduct,

      price: Number(updatedProduct.price),

      extras: updatedProduct.extras.map((extra) => ({
        ...extra,
        price: Number(extra.price),
      })),
    };

    return NextResponse.json({
      status: 200,
      message: "تم تعديل المنتج بنجاح.",
      data: serializedProduct,
    });
  } catch (error) {
    console.error("PUT /api/products/[id] error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء تعديل المنتج.",
      },
      {
        status: 500,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE - Delete product                                                    */
/* -------------------------------------------------------------------------- */

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingProduct = await prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          status: 404,
          message: "المنتج غير موجود.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.product.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      status: 200,
      message: "تم حذف المنتج بنجاح.",
    });
  } catch (error) {
    console.error("DELETE /api/products/[id] error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء حذف المنتج.",
      },
      {
        status: 500,
      },
    );
  }
}
