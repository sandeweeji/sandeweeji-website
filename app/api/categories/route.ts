import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

/* -------------------------------------------------------------------------- */
/* GET - Get all categories                                                   */
/* -------------------------------------------------------------------------- */

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({
      status: 200,
      data: categories,
      message: "تم جلب التصنيفات بنجاح.",
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء جلب التصنيفات." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* POST - Create category                                                     */
/* -------------------------------------------------------------------------- */

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: auth.status },
    );
  }
  try {
    const body = await request.json();
    const { nameAr, nameEn, emoji, visible, sortOrder } = body;

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

    const category = await prisma.category.create({
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn?.trim() || null,
        emoji: emoji.trim(),
        visible: visible ?? true,
        sortOrder:
          sortOrder === undefined || sortOrder === null ? 0 : Number(sortOrder),
      },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return NextResponse.json(
      {
        status: 201,
        message: "تمت إضافة التصنيف بنجاح.",
        data: category,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST /api/categories error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء إضافة التصنيف." },
      { status: 500 },
    );
  }
}
