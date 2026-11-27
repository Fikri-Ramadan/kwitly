import { Box, LayoutDashboard, RefreshCw, SquareText, UsersRound } from 'lucide-react';
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

export const NAV_LINKS = [
  { label: 'Fitur', href: '/#fitur' },
  { label: 'Cara Kerja', href: '/#cara-kerja' },
  { label: 'FAQ', href: '/#faq' },
];

export const SIDE_LINKS = [
  { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
  { label: 'Invoice', href: '/dashboard/invoices', Icon: SquareText },
  { label: 'Klien', href: '/dashboard/clients', Icon: UsersRound },
  { label: 'Produk & Kategori', href: '/dashboard/products', Icon: Box },
  { label: 'Recurring', href: '/dashboard/recurring', Icon: RefreshCw },
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

export const AVATAR_COLOR_PALETTE = [
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-sky-100', text: 'text-sky-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-violet-100', text: 'text-violet-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800' },
] as const;
