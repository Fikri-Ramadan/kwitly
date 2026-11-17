import 'server-only';
import { cookies } from 'next/headers';
import { AT, RT, cookieBase } from './cookies';

export async function setSession(t: { accessToken: string; refreshToken: string; expiresIn: number; }) {
  const jar = await cookies();
  jar.set(AT, t.accessToken, { ...cookieBase, maxAge: t.expiresIn });
  jar.set(RT, t.refreshToken, { ...cookieBase, maxAge: t.expiresIn });
}