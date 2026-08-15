import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

/* -------------------------------------------------------------------------- */
/* GET - Get all products                                                     */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        extras: {
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    const serializedProducts = products.map((product) => ({
      ...product,

      // Prisma Decimal -> number
      price: Number(product.price),

      extras: product.extras.map((extra) => ({
        ...extra,

        // Prisma Decimal -> number
        price: Number(extra.price),
      })),
    }));

    return NextResponse.json({
      status: 200,
      data: serializedProducts,
      message: "تم جلب المنتجات بنجاح.",
    });
  } catch (error) {
    console.error("GET /api/products error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء جلب المنتجات.",
      },
      {
        status: 500,
      },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* POST - Create product                                                      */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  try {
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
    /* Basic validation                                                       */
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
    /* Create product                                                         */
    /* ---------------------------------------------------------------------- */

    const product = await prisma.product.create({
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
          sortOrder === undefined || sortOrder === null ? 0 : Number(sortOrder),

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

                    // REMOVE extras should normally be free
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

    /* ---------------------------------------------------------------------- */
    /* Serialize Decimal values                                               */
    /* ---------------------------------------------------------------------- */

    const serializedProduct = {
      ...product,

      price: Number(product.price),

      extras: product.extras.map((extra) => ({
        ...extra,
        price: Number(extra.price),
      })),
    };

    return NextResponse.json(
      {
        status: 201,
        message: "تمت إضافة المنتج بنجاح.",
        data: serializedProduct,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء إضافة المنتج.",
      },
      {
        status: 500,
      },
    );
  }
}
