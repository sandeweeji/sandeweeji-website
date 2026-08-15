import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

/* -------------------------------------------------------------------------- */
/* NOTE: requires the `exceljs` package.                                     */
/*   npm install exceljs                                                     */
/* -------------------------------------------------------------------------- */

const BADGE_LABELS: Record<string, string> = {
  popular: "شعبي",
  new: "جديد",
  spicy: "حار 🌶",
  meal: "وجبة",
  bestseller: "الأكثر مبيعًا",
  limited: "محدود",
};

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        extras: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Sandweeji Admin";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("القائمة", {
      views: [{ rightToLeft: true, state: "frozen", ySplit: 1 }],
    });

    sheet.columns = [
      { header: "التصنيف", key: "category", width: 18 },
      { header: "اسم المنتج", key: "name", width: 26 },
      { header: "الوصف", key: "description", width: 40 },
      { header: "السعر", key: "price", width: 12 },
      { header: "السعرات الحرارية", key: "calories", width: 16 },
      { header: "الحالة", key: "available", width: 12 },
      { header: "الشارات", key: "badges", width: 24 },
      { header: "الإضافات المدفوعة", key: "addExtras", width: 32 },
      { header: "مكونات قابلة للإزالة", key: "removeExtras", width: 30 },
    ];

    /* Header row styling */
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      // TODO: swap this ARGB for your actual brand/primary color if you'd like
      // the export to match the app's accent color exactly.
      fgColor: { argb: "FFE0622B" },
    };
    headerRow.alignment = { vertical: "middle", horizontal: "right" };
    headerRow.height = 26;

    /* Rows */
    for (const product of products) {
      const addExtras = product.extras
        .filter((extra) => extra.type === "ADD")
        .map((extra) => `${extra.nameAr} (+${Number(extra.price)})`)
        .join("، ");

      const removeExtras = product.extras
        .filter((extra) => extra.type === "REMOVE")
        .map((extra) => extra.nameAr)
        .join("، ");

      const badges = product.badges
        .map((badge) => BADGE_LABELS[badge] ?? badge)
        .join("، ");

      const row = sheet.addRow({
        category: `${product.category.emoji} ${product.category.nameAr}`,
        name: product.nameAr,
        description: product.descriptionAr,
        price: Number(product.price),
        calories: product.calories ?? "",
        available: product.available ? "متاح" : "مخفي",
        badges,
        addExtras,
        removeExtras,
      });

      row.alignment = {
        horizontal: "right",
        vertical: "top",
        wrapText: true,
      };

      row.font = { size: 10.5 };

      const availableCell = row.getCell("available");
      availableCell.font = {
        size: 10.5,
        bold: true,
        color: {
          argb: product.available ? "FF1F9D55" : "FF9CA3AF",
        },
      };
    }

    sheet.getColumn("price").numFmt = "0.00";
    sheet.autoFilter = { from: "A1", to: "I1" };

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `menu-export-${new Date().toISOString().slice(0, 10)}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("GET /api/products/export error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء تصدير الملف." },
      { status: 500 },
    );
  }
}
