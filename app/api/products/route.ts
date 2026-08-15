import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface ExtraInput {
  type?: "ADD" | "REMOVE";
  nameAr?: string;
  nameEn?: string;
  price?: number | string;
  sortOrder?: number;
}

function buildExtrasCreate(extras: ExtraInput[]) {
  return extras.map((extra, index) => ({
    type: extra.type === "REMOVE" ? "REMOVE" : "ADD",
    nameAr: extra.nameAr?.trim() || "",
    nameEn: extra.nameEn?.trim() || null,
    price:
      extra.type === "REMOVE"
        ? new Prisma.Decimal(0)
        : new Prisma.Decimal(extra.price ?? 0),
    sortOrder: extra.sortOrder === undefined ? index : Number(extra.sortOrder),
  }));
}

/* -------------------------------------------------------------------------- */
/* GET - Get all products (optionally filtered)                               */
/* -------------------------------------------------------------------------- */

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryId = searchParams.get("categoryId");
    const search = searchParams.get("search")?.trim();
    const availableParam = searchParams.get("available");

    const where: Prisma.ProductWhereInput = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (availableParam === "true" || availableParam === "false") {
      where.available = availableParam === "true";
    }

    if (search) {
      where.OR = [
        { nameAr: { contains: search, mode: "insensitive" } },
        { nameEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        extras: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
      extras: product.extras.map((extra) => ({
        ...extra,
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
      { status: 500, message: "حدث خطأ أثناء جلب المنتجات." },
      { status: 500 },
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

    if (price === undefined || price === null || Number(price) < 0 || Number.isNaN(Number(price))) {
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

    /* ---------------------------- Check category --------------------------- */

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        { status: 404, message: "التصنيف المحدد غير موجود." },
        { status: 404 },
      );
    }

    /* ---------------------------- Create product --------------------------- */

    const product = await prisma.product.create({
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
          sortOrder === undefined || sortOrder === null ? 0 : Number(sortOrder),
        extras:
          Array.isArray(extras) && extras.length > 0
            ? { create: buildExtrasCreate(extras) }
            : undefined,
      },
      include: {
        extras: { orderBy: { sortOrder: "asc" } },
      },
    });

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
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/products error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء إضافة المنتج." },
      { status: 500 },
    );
  }
}
