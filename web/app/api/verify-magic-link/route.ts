import { authFetch } from "@/lib/auth/auth-fetch";
import { setSession } from "@/lib/auth/session";
import { safeNext } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const next = safeNext(searchParams.get('next'));

  if (!token) {
    return NextResponse.redirect(new URL('/sign-in?tab=magic-link&error=missing_token', request.url));
  }

  try {
    const res = await authFetch<{
      accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number;
    }>(`/auth/verify-magic-link`, { token });

    if (!res.ok) {
      return NextResponse.redirect(new URL('/sign-in?error=invalid_or_expired', request.url));
    }

    const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = res.data;

    await setSession({ accessToken, refreshToken, expiresIn, refreshExpiresIn });

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}