import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdmin } from "@/lib/auth/require-admin";

import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{
    id: string;
    subId: string;
  }>;
}

// ============================================================
// GET: Fetch a single sub-destination
// ============================================================

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id, subId } = await params;

    const subDestination = await prisma.deliverySubDestination.findFirst({
      where: {
        id: subId,
        destinationId: id,
      },
    });

    if (!subDestination) {
      return NextResponse.json(
        {
          status: 404,
          message: "Sub-destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const formattedSubDestination = {
      ...subDestination,
      deliveryFee: Number(subDestination.deliveryFee),
    };

    return NextResponse.json({
      status: 200,
      message: "Sub-destination fetched successfully",
      data: formattedSubDestination,
    });
  } catch (error) {
    console.error("GET sub-destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch sub-destination",
        data: null,
      },
      { status: 500 },
    );
  }
}

// ============================================================
// PATCH: Update a sub-destination
// ============================================================

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id, subId } = await params;

    // Make sure the sub-destination exists
    // and belongs to this parent destination.
    const existing = await prisma.deliverySubDestination.findFirst({
      where: {
        id: subId,
        destinationId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: 404,
          message: "Sub-destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const body = await request.json();

    const { nameAr, nameEn, deliveryFee, isActive, sortOrder } = body;

    const data: Prisma.DeliverySubDestinationUpdateInput = {};

    // ============================================================
    // Arabic name
    // ============================================================

    if (nameAr !== undefined) {
      if (typeof nameAr !== "string" || !nameAr.trim()) {
        return NextResponse.json(
          {
            status: 400,
            message: "Arabic name cannot be empty",
            data: null,
          },
          { status: 400 },
        );
      }

      data.nameAr = nameAr.trim();
    }

    // ============================================================
    // English name
    // ============================================================

    if (nameEn !== undefined) {
      if (nameEn !== null && typeof nameEn !== "string") {
        return NextResponse.json(
          {
            status: 400,
            message: "English name must be a string or null",
            data: null,
          },
          { status: 400 },
        );
      }

      data.nameEn = typeof nameEn === "string" ? nameEn.trim() : null;
    }

    // ============================================================
    // Delivery fee
    // ============================================================

    if (deliveryFee !== undefined) {
      const fee = Number(deliveryFee);

      if (Number.isNaN(fee) || fee < 0) {
        return NextResponse.json(
          {
            status: 400,
            message: "Delivery fee must be a valid non-negative number",
            data: null,
          },
          { status: 400 },
        );
      }

      data.deliveryFee = new Prisma.Decimal(fee.toFixed(2));
    }

    // ============================================================
    // Active status
    // ============================================================

    if (isActive !== undefined) {
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

      data.isActive = isActive;
    }

    // ============================================================
    // Sort order
    // ============================================================

    if (sortOrder !== undefined) {
      const order = Number(sortOrder);

      if (Number.isNaN(order) || order < 0) {
        return NextResponse.json(
          {
            status: 400,
            message: "Sort order must be a valid non-negative number",
            data: null,
          },
          { status: 400 },
        );
      }

      data.sortOrder = order;
    }

    // ============================================================
    // Update
    // ============================================================

    const updated = await prisma.deliverySubDestination.update({
      where: {
        id: subId,
      },
      data,
    });

    const formattedSubDestination = {
      ...updated,
      deliveryFee: Number(updated.deliveryFee),
    };

    return NextResponse.json({
      status: 200,
      message: "Sub-destination updated successfully",
      data: formattedSubDestination,
    });
  } catch (error) {
    console.error("PATCH sub-destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to update sub-destination",
        data: null,
      },
      { status: 500 },
    );
  }
}

// ============================================================
// DELETE: Delete a sub-destination
// ============================================================

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id, subId } = await params;

    // Make sure the sub-destination exists
    // and belongs to this parent destination.
    const existing = await prisma.deliverySubDestination.findFirst({
      where: {
        id: subId,
        destinationId: id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: 404,
          message: "Sub-destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    await prisma.deliverySubDestination.delete({
      where: {
        id: subId,
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Sub-destination deleted successfully",
      data: {
        success: true,
        id: subId,
      },
    });
  } catch (error) {
    console.error("DELETE sub-destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to delete sub-destination",
        data: null,
      },
      { status: 500 },
    );
  }
}
