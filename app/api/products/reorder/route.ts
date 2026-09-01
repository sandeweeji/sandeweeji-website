// app/api/products/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";

interface ReorderItem {
  id: string;
  sortOrder: number;
}

/* -------------------------------------------------------------------------- */
/* PATCH - Bulk update sortOrder for a set of products                        */
/* -------------------------------------------------------------------------- */

export async function PATCH(request: Request) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: auth.status },
    );
  }

  try {
    const body = await request.json();
    const items = body?.items as ReorderItem[] | undefined;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { status: 400, message: "لا توجد عناصر لإعادة الترتيب." },
        { status: 400 },
      );
    }

    for (const item of items) {
      if (
        !item?.id ||
        typeof item.sortOrder !== "number" ||
        Number.isNaN(item.sortOrder)
      ) {
        return NextResponse.json(
          { status: 400, message: "بيانات إعادة الترتيب غير صالحة." },
          { status: 400 },
        );
      }
    }

    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );

    return NextResponse.json({
      status: 200,
      message: "تم تحديث ترتيب المنتجات بنجاح.",
    });
  } catch (error) {
    console.error("PATCH /api/products/reorder error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء إعادة ترتيب المنتجات." },
      { status: 500 },
    );
  }
}
