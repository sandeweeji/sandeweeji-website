import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const destination = await prisma.deliveryDestination.findUnique({
      where: {
        id,
      },
    });

    if (!destination) {
      return NextResponse.json(
        {
          status: 404,
          message: "Delivery destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const formattedDestination = {
      ...destination,
      deliveryFee: Number(destination.deliveryFee),
    };

    return NextResponse.json({
      status: 200,
      message: "Delivery destination fetched successfully",
      data: formattedDestination,
    });
  } catch (error) {
    console.error("GET delivery destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to fetch delivery destination",
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.deliveryDestination.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: 404,
          message: "Delivery destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    const { nameAr, nameEn, deliveryFee, isActive, sortOrder } = body;

    const data: Prisma.DeliveryDestinationUpdateInput = {};

    /* ---------------------------------------------------------------------- */
    /* Arabic name                                                            */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* English name                                                           */
    /* ---------------------------------------------------------------------- */

    // if (nameEn !== undefined) {
    //   if (typeof nameEn !== "string" || !nameEn.trim()) {
    //     return NextResponse.json(
    //       {
    //         status: 400,
    //         message: "English name cannot be empty",
    //         data: null,
    //       },
    //       { status: 400 },
    //     );
    //   }

    //   data.nameEn = nameEn.trim();
    // }

    /* ---------------------------------------------------------------------- */
    /* Delivery fee                                                           */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Active status                                                          */
    /* ---------------------------------------------------------------------- */

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

    /* ---------------------------------------------------------------------- */
    /* Sort order                                                             */
    /* ---------------------------------------------------------------------- */

    if (sortOrder !== undefined) {
      const order = Number(sortOrder);

      if (Number.isNaN(order) || order < 0) {
        return NextResponse.json(
          {
            status: 400,
            message: "Sort order must be a non-negative number",
            data: null,
          },
          { status: 400 },
        );
      }

      data.sortOrder = order;
    }

    /* ---------------------------------------------------------------------- */
    /* Update                                                                 */
    /* ---------------------------------------------------------------------- */

    const destination = await prisma.deliveryDestination.update({
      where: {
        id,
      },
      data,
    });

    const formattedDestination = {
      ...destination,
      deliveryFee: Number(destination.deliveryFee),
    };

    return NextResponse.json({
      status: 200,
      message: "Delivery destination updated successfully",
      data: formattedDestination,
    });
  } catch (error) {
    console.error("PATCH delivery destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to update delivery destination",
        data: null,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin();

    const { id } = await params;

    const existing = await prisma.deliveryDestination.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          status: 404,
          message: "Delivery destination not found",
          data: null,
        },
        { status: 404 },
      );
    }

    await prisma.deliveryDestination.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      status: 200,
      message: "Delivery destination deleted successfully",
      data: {
        success: true,
        id,
      },
    });
  } catch (error) {
    console.error("DELETE delivery destination error:", error);

    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        status: 500,
        message: "Failed to delete delivery destination",
        data: null,
      },
      { status: 500 },
    );
  }
}
