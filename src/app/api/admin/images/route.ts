import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const IMAGES_DIR = path.join(process.cwd(), "public", "images", "blog");

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    if (!fs.existsSync(IMAGES_DIR)) {
      return NextResponse.json({ images: [] });
    }

    const files = fs.readdirSync(IMAGES_DIR);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"];

    const images = files
      .filter((f) => imageExtensions.includes(path.extname(f).toLowerCase()))
      .map((f) => {
        const filePath = path.join(IMAGES_DIR, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          url: `/images/blog/${f}`,
          size: stats.size,
          modified: stats.mtime.toISOString(),
        };
      })
      .sort((a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime());

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json({ error: "Erro ao listar imagens" }, { status: 500 });
  }
}
