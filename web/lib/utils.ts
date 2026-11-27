import z from "zod";
import { AVATAR_COLOR_PALETTE } from "./definitions";

export { cn } from "cn"

export const safeNext = (v?: string | null, fallback = '/dashboard'): string => {
  if (!v) return fallback;
  return v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/\\')
    ? v
    : fallback;
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function avatarName(name?: string | null, fallback = 'U'): string {
  if (!name) return fallback;

  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return fallback;

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  const firstInitial = parts[0][0];
  const lastInitial = parts[parts.length - 1][0];
  return `${firstInitial}${lastInitial}`.toUpperCase();
}

export function avatarColor(seed?: string | null) {
  if (!seed) return AVATAR_COLOR_PALETTE[0];

  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % AVATAR_COLOR_PALETTE.length;
  return AVATAR_COLOR_PALETTE[index];
}

export const signupFormSchema = z
  .object({
    name: z
      .string()
      .min(2, { error: 'Nama setidaknya terdiri 2 panjang karakter.' })
      .trim(),
    email: z.email({ error: 'Tolong masukan email yang valid.' }).trim(),
    password: z
      .string()
      .min(8, { error: 'Password minimal terdiri dari 8 karakter' })
      .regex(/[a-zA-Z]/, { error: 'Password memuat setidaknya satu huruf.' })
      .regex(/[0-9]/, { error: 'Password memuat setidaknya satu angka.' })
      .trim(),
    confirmPassword: z
      .string()
      .min(1, { error: 'Konfirmasi password wajib diisi.' })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Konfirmasi password tidak cocok dengan password.',
    path: ['confirmPassword'],
  });

export const signinFormSchema = z
  .object({
    email: z.email({ error: 'Tolong masukan email yang valid.' }).trim(),
  });

export const forgotPasswordSchema = z
  .object({
    email: z.email({ error: 'Tolong masukan email yang valid.' }).trim(),
  });

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { error: 'Password minimal terdiri dari 8 karakter' })
      .regex(/[a-zA-Z]/, { error: 'Password memuat setidaknya satu huruf.' })
      .regex(/[0-9]/, { error: 'Password memuat setidaknya satu angka.' })
      .trim(),
    confirmPassword: z
      .string()
      .min(1, { error: 'Konfirmasi password wajib diisi.' })
      .trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Konfirmasi password tidak cocok dengan password.',
    path: ['confirmPassword'],
  });