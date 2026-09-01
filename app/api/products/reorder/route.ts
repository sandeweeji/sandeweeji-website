import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import type { IResponse } from "@/interfaces/interfaces";

interface ReorderItem {
  id: string;
  sortOrder: number;
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    const items = body?.items as ReorderItem[] | undefined;

    if (!Array.isArray(items) || items.length === 0) {
      const response: IResponse = {
        message: "بيانات إعادة الترتيب غير صالحة.",
        status: 400,
      };

      return NextResponse.json(response, {
        status: 400,
      });
    }

    /*
     * Validate every item.
     */
    for (const item of items) {
      if (
        typeof item.id !== "string" ||
        !item.id ||
        typeof item.sortOrder !== "number" ||
        !Number.isInteger(item.sortOrder) ||
        item.sortOrder < 0
      ) {
        const response: IResponse = {
          message: "بيانات إعادة الترتيب غير صالحة.",
          status: 400,
        };

        return NextResponse.json(response, {
          status: 400,
        });
      }
    }

    /*
     * Make sure there are no duplicate product IDs.
     */
    const uniqueIds = new Set(items.map((item) => item.id));

    if (uniqueIds.size !== items.length) {
      const response: IResponse = {
        message: "لا يمكن تكرار المنتجات.",
        status: 400,
      };

      return NextResponse.json(response, {
        status: 400,
      });
    }

    /*
     * Update all products inside one transaction.
     *
     * maxWait:
     * Maximum time Prisma waits to acquire a DB connection.
     *
     * timeout:
     * Maximum time allowed for the transaction.
     */
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: {
            id: item.id,
          },
          data: {
            sortOrder: item.sortOrder,
          },
        }),
      ),
      {
        maxWait: 10000,
        timeout: 20000,
      },
    );

    const response: IResponse<undefined> = {
      message: "تم حفظ ترتيب المنتجات بنجاح.",
      status: 200,
    };

    return NextResponse.json(response, {
      status: 200,
    });
  } catch (error) {
    console.error("PATCH /api/products/reorder error:", error);

    const response: IResponse = {
      message: "حدث خطأ أثناء حفظ ترتيب المنتجات.",
      status: 500,
    };

    return NextResponse.json(response, {
      status: 500,
    });
  }
}
