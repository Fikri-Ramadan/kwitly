import { emailLayout } from './email-layout.js';

export const FORGOT_PASSWORD_SUBJECT = 'Atur ulang password Kwitly';

export function forgotPasswordEmail(
  link: string,
  { expiresInMinutes = 60 }: { expiresInMinutes?: number; } = {},
) {
  return emailLayout({
    title: 'Atur ulang password Kwitly',
    preheader: 'Buat password baru untuk akun Kwitly Anda.',
    heading: 'Atur ulang password Anda',
    intro:
      'Kami menerima permintaan untuk mengatur ulang password akun Kwitly Anda. Klik tombol di bawah untuk membuat password baru.',
    buttonLabel: 'Buat password baru',
    link,
    expiryNote: `Tautan ini berlaku selama ${expiresInMinutes} menit dan hanya bisa dipakai sekali.`,
    ignoreNote:
      'Tidak meminta pengaturan ulang? Abaikan email ini, password Anda tidak akan berubah.',
  });
}