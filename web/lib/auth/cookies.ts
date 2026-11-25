import 'server-only';
import { jwtVerify, SignJWT } from "jose";

export const AT = 'at';
export const RT = 'rt';
export const VE = 'pending_verification_email';
export const RT_MAX_AGE = 7 * 24 * 60 * 60;
export const VE_MAX_AGE = 24 * 60 * 60;

export const cookieBase = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameStie: 'lax' as const,
  path: '/'
};

const secretKey = process.env.COOKIE_SECRET;
const encodedKey = new TextEncoder().encode(secretKey);

export async function encryptCookie(payload: Record<string, unknown>, maxAgeSeconds = 7 * 24 * 60 * 60) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(encodedKey);
}

export async function decryptCookie<T = Record<string, unknown>>(token: string | undefined = ''): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as T;
  } catch (error) {
    console.log('Failed to verify cookie');
    return null;
  }
}