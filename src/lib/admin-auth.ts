import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "alcolab_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

type SessionPayload = {
  iat: number;
  exp: number;
};

function getSecret(): string {
  const secret = process.env.ADMIN_COOKIE_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("Missing ADMIN_PASSWORD (or ADMIN_COOKIE_SECRET).");
  }
  return secret;
}

function base64UrlEncode(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(str: string): Buffer {
  const pad = str.length % 4 === 0 ? "" : "=".repeat(4 - (str.length % 4));
  const b64 = str.replace(/-/g, "+").replace(/_/g, "/") + pad;
  return Buffer.from(b64, "base64");
}

function hmac(payloadB64: string): string {
  return base64UrlEncode(
    crypto.createHmac("sha256", getSecret()).update(payloadB64).digest()
  );
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function setAdminSessionCookie(): void {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { iat: now, exp: now + SESSION_TTL_SECONDS };
  const payloadB64 = base64UrlEncode(Buffer.from(JSON.stringify(payload)));
  const sig = hmac(payloadB64);
  const value = `${payloadB64}.${sig}`;

  const isProd = process.env.NODE_ENV === "production";
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearAdminSessionCookie(): void {
  cookies().set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function isAdminAuthenticated(): boolean {
  const v = cookies().get(COOKIE_NAME)?.value;
  if (!v) return false;
  const [payloadB64, sig] = v.split(".");
  if (!payloadB64 || !sig) return false;
  const expected = hmac(payloadB64);
  if (!timingSafeEqualStr(sig, expected)) return false;
  let payload: SessionPayload;
  try {
    payload = JSON.parse(
      base64UrlDecode(payloadB64).toString("utf-8")
    ) as SessionPayload;
  } catch {
    return false;
  }
  const now = Math.floor(Date.now() / 1000);
  return typeof payload.exp === "number" && payload.exp > now;
}

export function verifyPassword(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  return timingSafeEqualStr(password, expected);
}
