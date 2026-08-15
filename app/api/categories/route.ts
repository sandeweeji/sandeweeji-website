import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        {
          sortOrder: "asc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return NextResponse.json({
      status: 200,
      data: categories,
      message: "تم جلب التصنيفات بنجاح.",
    });
  } catch (error) {
    console.error("GET /api/categories error:", error);

    return NextResponse.json(
      {
        status: 500,
        message: "حدث خطأ أثناء جلب التصنيفات.",
      },
      {
        status: 500,
      },
    );
  }
}
