import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const destinations = await prisma.deliveryDestination.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        subDestinations: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    const formattedDestinations = destinations.map((destination) => ({
      ...destination,
      deliveryFee: Number(destination.deliveryFee),
      subDestinations: destination.subDestinations.map((sub) => ({
        ...sub,
        deliveryFee: Number(sub.deliveryFee),
      })),
    }));

    return NextResponse.json({
      status: 200,
      message: "Delivery destinations fetched successfully",
      data: formattedDestinations,
    });
  } catch (error) {
    console.error("GET delivery destinations error:", error);
    if (error instanceof Response) return error;

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch delivery destinations",
        data: null,
      },
      { status: 500 },
    );
  }
}

// POST stays exactly as you have it — creating a destination doesn't touch subs.

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();

    const {
      nameAr,
      nameEn,
      deliveryFee,
      isActive = true,
      sortOrder = 0,
    } = body;

    /* ---------------------------------------------------------------------- */
    /* Validation                                                             */
    /* ---------------------------------------------------------------------- */

    if (typeof nameAr !== "string" || !nameAr.trim()) {
      return NextResponse.json(
        {
          status: 400,
          message: "name are required",
          data: null,
        },
        { status: 400 },
      );
    }

    if (
      deliveryFee === undefined ||
      deliveryFee === null ||
      Number.isNaN(Number(deliveryFee)) ||
      Number(deliveryFee) < 0
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Delivery fee must be a valid non-negative number",
          data: null,
        },
        { status: 400 },
      );
    }

    if (
      sortOrder !== undefined &&
      (Number.isNaN(Number(sortOrder)) || Number(sortOrder) < 0)
    ) {
      return NextResponse.json(
        {
          status: 400,
          message: "Sort order must be a non-negative number",
          data: null,
        },
        { status: 400 },
      );
    }

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        {
          status: 400,
          message: "isActive must be a boolean",
          data: null,
        },
        { status: 400 },
      );
    }

    /* ---------------------------------------------------------------------- */
    /* Create                                                                 */
    /* ---------------------------------------------------------------------- */

    const destination = await prisma.deliveryDestination.create({
      data: {
        nameAr: nameAr.trim(),
        nameEn: nameEn.trim(),
        deliveryFee: new Prisma.Decimal(Number(deliveryFee).toFixed(2)),
        isActive,
        sortOrder: Number(sortOrder),
      },
    });

    const formattedDestination = {
      ...destination,
      deliveryFee: Number(destination.deliveryFee),
    };

    return NextResponse.json(
      {
        status: 201,
        message: "Delivery destination created successfully",
        data: formattedDestination,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST delivery destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to create delivery destination",
        data: null,
      },
      { status: 500 },
    );
  }
}
