import { emailLayout } from './email-layout.js';

export const VERIFICATION_SUBJECT = 'Verifikasi email Anda di Kwitly';

export function verificationEmail(
  link: string,
  { expiresInHours = 24 }: { expiresInHours?: number; } = {},
) {
  return emailLayout({
    title: 'Verifikasi email Kwitly',
    preheader: 'Satu langkah lagi: verifikasi email untuk mengaktifkan akun Kwitly Anda.',
    heading: 'Verifikasi email Anda',
    intro:
      'Terima kasih sudah mendaftar di Kwitly. Klik tombol di bawah untuk memverifikasi alamat email dan mengaktifkan akun Anda.',
    buttonLabel: 'Verifikasi email',
    link,
    expiryNote: `Tautan ini berlaku selama ${expiresInHours} jam.`,
    ignoreNote: 'Bukan Anda yang mendaftar? Abaikan email ini, akun tidak akan diaktifkan.',
  });
}