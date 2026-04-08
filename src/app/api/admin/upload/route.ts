import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "images", "blog");

export async function POST(request: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo não permitido. Use: JPEG, PNG, WebP, GIF ou SVG." },
        { status: 400 }
      );
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo: 5MB." },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // Sanitize filename
    const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
    const ext = path.extname(originalName);
    const baseName = path.basename(originalName, ext);
    const timestamp = Date.now();
    const fileName = `${baseName}-${timestamp}${ext}`;
    const filePath = path.join(UPLOAD_DIR, fileName);

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/images/blog/${fileName}`;

    return NextResponse.json({
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erro no upload" }, { status: 500 });
  }
}
