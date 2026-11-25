import { emailLayout } from './email-layout.js';

export const MAGIC_LINK_SUBJECT = 'Tautan masuk ke Kwitly';

export function magicLinkEmail(
  link: string,
  { expiresInMinutes = 15 }: { expiresInMinutes?: number; } = {},
) {
  return emailLayout({
    title: 'Tautan masuk Kwitly',
    preheader: 'Klik untuk masuk ke akun Kwitly Anda tanpa password.',
    heading: 'Masuk ke Kwitly',
    intro: 'Klik tombol di bawah untuk masuk ke akun Kwitly Anda tanpa password.',
    buttonLabel: 'Masuk ke Kwitly',
    link,
    expiryNote: `Tautan ini berlaku selama ${expiresInMinutes} menit dan hanya bisa dipakai sekali.`,
    ignoreNote:
      'Tidak merasa meminta tautan ini? Abaikan email ini, tidak ada yang berubah pada akun Anda.',
  });
}