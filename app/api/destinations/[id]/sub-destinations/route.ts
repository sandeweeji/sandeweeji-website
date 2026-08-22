import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const subDestinations = await prisma.deliverySubDestination.findMany({
      where: { destinationId: id },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const formatted = subDestinations.map((sub) => ({
      ...sub,
      deliveryFee: Number(sub.deliveryFee),
    }));

    return NextResponse.json({
      status: 200,
      message: "Sub-destinations fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("GET sub-destinations error:", error);
    if (error instanceof Response) return error;

    return NextResponse.json(
      { status: 500, message: "Failed to fetch sub-destinations", data: null },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;

    const destination = await prisma.deliveryDestination.findUnique({
      where: { id },
    });

    if (!destination) {
      return NextResponse.json(
        { status: 404, message: "Delivery destination not found", data: null },
        { status: 404 },
      );
    }

    const body = await request.json();
    const {
      nameAr,
      nameEn,
      deliveryFee,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (typeof nameAr !== "string" || !nameAr.trim()) {
      return NextResponse.json(
        { status: 400, message: "Arabic name is required", data: null },
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

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { status: 400, message: "isActive must be a boolean", data: null },
        { status: 400 },
      );
    }

    const sub = await prisma.deliverySubDestination.create({
      data: {
        destinationId: id,
        nameAr: nameAr.trim(),
        nameEn: typeof nameEn === "string" ? nameEn.trim() : null,
        deliveryFee: new Prisma.Decimal(Number(deliveryFee).toFixed(2)),
        isActive,
        sortOrder: Number.isNaN(Number(sortOrder)) ? 0 : Number(sortOrder),
      },
    });

    return NextResponse.json(
      {
        status: 201,
        message: "Sub-destination created successfully",
        data: { ...sub, deliveryFee: Number(sub.deliveryFee) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST sub-destination error:", error);
    if (error instanceof Response) return error;

    return NextResponse.json(
      { status: 500, message: "Failed to create sub-destination", data: null },
      { status: 500 },
    );
  }
}
