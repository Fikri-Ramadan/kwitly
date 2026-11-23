import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { decryptCookie, VE } from "./lib/auth/cookies";

const protectedRoutes = ['/dashboard'];
const publicRoutes = ['/sign-up', '/sign-in', '/verify-email', '/'];

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const hasVerifyToken = req.nextUrl.searchParams.has('token');
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  const verifEmail = (await cookies()).get(VE)?.value;
  const decryptedVerifEmail = (await decryptCookie(verifEmail))?.email;

  if (path.startsWith('/verify-email') && !decryptedVerifEmail && !hasVerifyToken) {
    return NextResponse.redirect(new URL('/sign-up', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|\\.well-known|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};