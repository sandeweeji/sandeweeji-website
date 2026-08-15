import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/* -------------------------------------------------------------------------- */
/* GET - Get one category                                                     */
/* -------------------------------------------------------------------------- */

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!category) {
      return NextResponse.json(
        { status: 404, message: "التصنيف غير موجود." },
        { status: 404 },
      );
    }

    return NextResponse.json({ status: 200, data: category });
  } catch (error) {
    console.error("GET /api/categories/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء جلب التصنيف." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* PUT - Update category                                                      */
/* -------------------------------------------------------------------------- */

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { nameAr, nameEn, emoji, visible, sortOrder } = body;

    const existingCategory = await prisma.category.findUnique({ where: { id } });

    if (!existingCategory) {
      return NextResponse.json(
        { status: 404, message: "التصنيف غير موجود." },
        { status: 404 },
      );
    }

    if (!nameAr?.trim()) {
      return NextResponse.json(
        { status: 400, message: "اسم التصنيف مطلوب." },
        { status: 400 },
      );
    }

    if (!emoji?.trim()) {
      return NextResponse.json(
        { status: 400, message: "الرمز التعبيري للتصنيف مطلوب." },
        { status: 400 },
      );
    }

    const category = await prisma.category.update({
      where: { id },
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        emoji: emoji.trim(),
        visible: visible ?? existingCategory.visible,
        sortOrder:
          sortOrder === undefined || sortOrder === null
            ? existingCategory.sortOrder
            : Number(sortOrder),
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({
      status: 200,
      message: "تم تعديل التصنيف بنجاح.",
      data: category,
    });
  } catch (error) {
    console.error("PUT /api/categories/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء تعديل التصنيف." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE - Delete category                                                   */
/* -------------------------------------------------------------------------- */

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { status: 404, message: "التصنيف غير موجود." },
        { status: 404 },
      );
    }

    if (existingCategory._count.products > 0) {
      return NextResponse.json(
        {
          status: 409,
          message: `لا يمكن حذف هذا التصنيف لأنه يحتوي على ${existingCategory._count.products} منتج. احذف أو انقل المنتجات أولاً.`,
        },
        { status: 409 },
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({
      status: 200,
      message: "تم حذف التصنيف بنجاح.",
    });
  } catch (error) {
    // Extra safety net in case of a race condition (product added between
    // the count check above and the actual delete).
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          status: 409,
          message: "لا يمكن حذف هذا التصنيف لأنه يحتوي على منتجات مرتبطة به.",
        },
        { status: 409 },
      );
    }

    console.error("DELETE /api/categories/[id] error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء حذف التصنيف." },
      { status: 500 },
    );
  }
}
