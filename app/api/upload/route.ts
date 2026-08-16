import { NextResponse } from "next/server";
import { supabaseServer, PRODUCT_IMAGES_BUCKET } from "@/lib/supabase-server";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(request: Request) {
  const auth = await requireAdmin();

  if (!auth.authorized) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: auth.status },
    );
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { status: 400, message: "لم يتم اختيار صورة." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          status: 400,
          message: "صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WEBP أو GIF.",
        },
        { status: 400 },
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        {
          status: 400,
          message: "حجم الصورة كبير جدًا. الحد الأقصى 5 ميغابايت.",
        },
        { status: 400 },
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name.includes(".")
      ? file.name.split(".").pop()
      : file.type.split("/")[1] || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const path = `products/${fileName}`;

    const { error: uploadError } = await supabaseServer.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);

      return NextResponse.json(
        { status: 500, message: "تعذر رفع الصورة إلى التخزين." },
        { status: 500 },
      );
    }

    const { data: publicUrlData } = supabaseServer.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .getPublicUrl(path);

    return NextResponse.json({
      status: 200,
      message: "تم رفع الصورة بنجاح.",
      data: {
        url: publicUrlData.publicUrl,
        path,
      },
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء رفع الصورة." },
      { status: 500 },
    );
  }
}

/* -------------------------------------------------------------------------- */
/* DELETE - remove an image from storage (optional cleanup, called with      */
/* ?path=products/xxxx.jpg when a product's image is replaced or deleted)    */
/* -------------------------------------------------------------------------- */

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");

    if (!path) {
      return NextResponse.json(
        { status: 400, message: "مسار الصورة مطلوب." },
        { status: 400 },
      );
    }

    const { error } = await supabaseServer.storage
      .from(PRODUCT_IMAGES_BUCKET)
      .remove([path]);

    if (error) {
      console.error("Supabase delete error:", error);
      return NextResponse.json(
        { status: 500, message: "تعذر حذف الصورة." },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: 200, message: "تم حذف الصورة." });
  } catch (error) {
    console.error("DELETE /api/upload error:", error);

    return NextResponse.json(
      { status: 500, message: "حدث خطأ أثناء حذف الصورة." },
      { status: 500 },
    );
  }
}
