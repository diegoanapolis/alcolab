import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  setAdminSessionCookie,
  clearAdminSessionCookie,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Senha é obrigatória." },
        { status: 400 }
      );
    }

    if (!verifyPassword(password)) {
      return NextResponse.json(
        { error: "Senha incorreta." },
        { status: 401 }
      );
    }

    setAdminSessionCookie();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
