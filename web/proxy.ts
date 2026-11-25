import { NextRequest, NextResponse } from "next/server";
import { AT, cookieBase, decryptCookie, encryptCookie, RT, VE } from "./lib/auth/cookies";
import { clientHeaders } from "./lib/auth/client-headers";

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/sign-up', '/sign-in'];
const publicRoutes = ['/'];

function toLogin(req: NextRequest) {
  const url = new URL('/sign-in', req.url);
  url.searchParams.set('next', req.nextUrl.pathname + req.nextUrl.search);
  const res = NextResponse.redirect(url);
  res.cookies.delete(AT);
  res.cookies.delete(RT);
  return res;
}

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((p) => path.startsWith(p));
  const isAuthRoute = authRoutes.some((p) => path.startsWith(p));

  if (path.startsWith('/verify-email')) {
    const hasVerifyToken = req.nextUrl.searchParams.has('token');
    const emailNeedToVerify = (await decryptCookie(req.cookies.get(VE)?.value))?.email;
    if (!emailNeedToVerify && !hasVerifyToken) {
      return NextResponse.redirect(new URL('/sign-up', req.nextUrl));
    }
  }

  if (!isProtectedRoute && !isAuthRoute) return NextResponse.next();

  const at = (await decryptCookie(req.cookies.get(AT)?.value))?.accessToken;
  const rt = (await decryptCookie(req.cookies.get(RT)?.value))?.refreshToken;
  const isAuth = Boolean(at || rt);

  if (isAuthRoute) {
    return isAuth
      ? NextResponse.redirect(new URL('/dashboard', req.url))
      : NextResponse.next();
  }

  if (at) return NextResponse.next();
  if (!rt) return toLogin(req);

  let resApi: Response;
  try {
    resApi = await fetch(`${process.env.API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...clientHeaders(req.headers) },
      body: JSON.stringify({ token: rt }),
    });
  } catch {
    return new NextResponse('Service temporarily unavailable', { status: 503, headers: { 'Retry-After': '5' } });
  }

  if (resApi.status === 429 || resApi.status >= 500) {
    return new NextResponse('Service temporarily unavailable', {
      status: 503,
      headers: { 'Retry-After': resApi.headers.get('Retry-After') ?? '5' },
    });
  }
  if (!resApi.ok) return toLogin(req);

  const { accessToken, refreshToken, expiresIn, refreshExpiresIn } = await resApi.json();
  const refreshTtl = refreshExpiresIn ?? 7 * 24 * 60 * 60;

  const encryptedAT = await encryptCookie({ accessToken }, expiresIn);
  const encryptedRT = await encryptCookie({ refreshToken }, refreshTtl);

  req.cookies.set(AT, encryptedAT);
  req.cookies.set(RT, encryptedRT);
  const res = NextResponse.next({ request: req });
  res.cookies.set(AT, encryptedAT, { ...cookieBase, maxAge: expiresIn });
  res.cookies.set(RT, encryptedRT, { ...cookieBase, maxAge: refreshTtl });
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|\\.well-known|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json)$).*)',
  ],
};