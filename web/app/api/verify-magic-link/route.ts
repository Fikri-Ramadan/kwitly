import { authFetch } from "@/lib/auth/auth-fetch";
import { setSession } from "@/lib/auth/session";
import { TokenError } from "@/lib/definitions";
import { safeNext } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const next = safeNext(searchParams.get('next'));

  if (!token) {
    return NextResponse.redirect(new URL(`/sign-in?tab=magiclink&error=${TokenError.MISSING_TOKEN}`, request.url));
  }

  try {
    const res = await authFetch<{
      accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number;
    }>(`/auth/verify-magic-link`, { token });

    if (!res.ok && res.status === 0) {
      return NextResponse.redirect(new URL(`/sign-in?tab=magiclink&error=${TokenError.SERVER_ERROR}`, request.url));
    }
    if (!res.ok) {
      return NextResponse.redirect(new URL(`/sign-in?tab=magiclink&error=${TokenError.INVALID_OR_EXPIRED}`, request.url));
    }

    const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = res.data;

    await setSession({ accessToken, refreshToken, expiresIn, refreshExpiresIn });

    return NextResponse.redirect(new URL(next, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL(`/sign-in?tab=magiclink&error=${TokenError.SERVER_ERROR}`, request.url));
  }
}