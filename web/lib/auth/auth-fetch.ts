import 'server-only';
import { clientHeaders } from './client-headers';
import { headers } from 'next/headers';

export type ApiResult<T> =
  | { ok: true; data: T; }
  | { ok: false; status: number; message: string; seconds?: number; };

export async function authFetch<T>(path: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...clientHeaders(await headers()) },
      body: JSON.stringify(body),
      cache: 'no-store'
    });

    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const m = json?.message;
      return { ok: false, status: res.status, seconds: json?.seconds, message: Array.isArray(m) ? m[0] : (m ?? `Something wen't wrong.`) };
    }
    return { ok: true, data: json as T };
  } catch (error) {
    return { ok: false, status: 0, message: 'Server sedang mengalami gangguan. Silakan coba lagi sebentar lagi.' };
  }
}