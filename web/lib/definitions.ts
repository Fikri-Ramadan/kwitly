import * as z from 'zod';

export type FormState =
  | {
    inputs?: {
      name?: string;
      company?: string;
      email?: string;
      password?: string;
    };
    errors?: {
      name?: string[];
      company?: string[];
      email?: string[];
      password?: string[];
      confirmPassword?: string[];
      message?: string;
    };
    message?: string;
    success?: boolean;
    seconds?: number;
  }
  | undefined;

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

export const NAV_LINKS = [
  { label: "Fitur", href: "/#fitur" },
  { label: "Cara Kerja", href: "/#cara-kerja" },
  { label: "FAQ", href: "/#faq" },
];

export enum TokenError {
  INVALID_OR_EXPIRED = 'invalid_or_expired',
  SERVER_ERROR = 'server_error',
  MISSING_TOKEN = 'missing_token'
}

export const tokenErrorMessage = {
  invalid_or_expired: 'Tautan masuk tidak valid atau sudah kedaluwarsa. Silakan kirim ulang tautan baru.',
  server_error: 'Terjadi gangguan pada server saat memverifikasi tautan. Silakan coba beberapa saat lagi.',
  missing_token: 'Tautan verifikasi tidak lengkap. Pastikan Anda membuka tautan langsung dari email Anda.',
} as const;
