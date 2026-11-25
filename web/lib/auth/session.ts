import 'server-only';
import { cookies, headers } from 'next/headers';
import { AT, RT, cookieBase, decryptCookie, encryptCookie } from './cookies';
import { clientHeaders } from './client-headers';
import { cache } from 'react';
import { authFetch } from './auth-fetch';

export async function setSession(t: { accessToken: string; refreshToken: string; expiresIn: number; refreshExpiresIn: number; }) {
  const jar = await cookies();
  const encryptedAT = await encryptCookie({ accessToken: t.accessToken }, t.expiresIn);
  const encryptedRT = await encryptCookie({ refreshToken: t.refreshToken }, t.refreshExpiresIn);
  jar.set(AT, encryptedAT, { ...cookieBase, maxAge: t.expiresIn });
  jar.set(RT, encryptedRT, { ...cookieBase, maxAge: t.refreshExpiresIn });
}

export async function removeSession() {
  const jar = await cookies();
  const rt = (await decryptCookie(jar.get(RT)?.value))?.refreshToken;
  if (rt) {
    await authFetch('/auth/logout', { token: rt });
  }
  jar.delete(AT);
  jar.delete(RT);
}

export async function getSession() {
  const jar = await cookies();
  const at = (await decryptCookie(jar.get(AT)?.value))?.accessToken;
  const rt = (await decryptCookie(jar.get(RT)?.value))?.refreshToken;
  if (!at && !rt) return { isAuth: false };
  const res = await fetch(`${process.env.API_URL}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${at}`,
    },
  });

  if (res.status === 401 && rt) return { isAuth: true };
  const data = await res.json();
  return { isAuth: true, userId: data.userId, fullName: data.fullName };
};

export const hasSession = cache(async () => {
  const jar = await cookies();
  const [at, rt] = await Promise.all([
    decryptCookie(jar.get(AT)?.value),
    decryptCookie(jar.get(RT)?.value),
  ]);
  return Boolean(at?.accessToken || rt?.refreshToken);
});