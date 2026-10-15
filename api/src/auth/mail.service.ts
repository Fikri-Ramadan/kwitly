import { Injectable, Logger } from "@nestjs/common";

type Mail = { to: string; subject: string; html: string; };

@Injectable()
export class MailService {
  private logger = new Logger(MailService.name);

  async sendVerification(to: string, link: string) {
    await this.send({
      to,
      subject: 'verify email Kwitly',
      html: `<p>Klik tautan berikut untuk memverifikasi akun Anda (berlaku 24 jam):</p><p><a href="${link}">Verifikasi email</a></p>`,
    });
  }

  async sendMagicLink(to: string, link: string) {
    await this.send({
      to,
      subject: 'Tautan login Kwitly',
      html: `<p>Klik tautan berikut untuk masuk (berlaku 15 menit, sekali pakai):</p><p><a href="${link}">Masuk ke Kwitly</a></p><p>Abaikan email ini jika Anda tidak memintanya.</p>`
    });
  }

  async sendForgotLink(to: string, link: string) {
    await this.send({
      to,
      subject: 'Tautan forgot password Kwitly',
      html: `<p>Klik tautan berikut untuk memperbaruhi password (berlaku 60 menit, sekali pakai):</p><p><a href="${link}">Masuk ke Kwitly</a></p><p>Abaikan email ini jika Anda tidak memintanya.</p>`
    })
  }

  private async send(mail: Mail) {
    const fromEmail = process.env.MAIL_FROM_EMAIL;
    const fromName = process.env.MAIL_FROM_NAME;

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${fromName} <${fromEmail}>`,
          to: mail.to,
          subject: mail.subject,
          html: mail.html,
        })
      });
      if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
    } catch (error) {
      this.logger.error(`Failed send email to ${mail.to}: ${String(error)}`);
      return;
    }
  }
}