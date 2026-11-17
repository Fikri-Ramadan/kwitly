'use server';

import { authFetch } from "@/lib/auth/auth-fetch";
import { FormState } from "./types";

const TOO_MANY = 'Terlalu banyak percobaan. Coba lagi beberapa saat lagi.';
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '');

const safeNext = (v: string) => (v.startsWith('/') && !v.startsWith('//') ? v : '/dashboard');

export async function registerAction(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, 'email').trim();
  const r = await authFetch('/auth/register', {
    email,
    password: str(fd, 'password')
  });

  if (!r.ok) {
    if (r.status === 409) return { email, error: 'Email sudah terdaftar.' };
    if (r.status === 429) return { email, error: TOO_MANY };
    return { email, error: r.message };
  }
  return { success: 'Pendaftaran berhasil. Cek email kamu untuk verifikasi (berlaku 24 jam).' };
}