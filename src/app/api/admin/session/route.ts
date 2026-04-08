import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const authenticated = isAdminAuthenticated();
  return NextResponse.json({ authenticated });
}
