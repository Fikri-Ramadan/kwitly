import { Injectable, Logger } from "@nestjs/common";

type Mail = { to: string; subject: string; html: string; };
type Invoice = {
  number: string;
  clientName: string;
  total: string;
  dueDate: string;
  currency: string;
  paymentLink?: string;
};

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
    });
  }

  async sendInvoice(to: string, companyOrUsername: string, invoice: Invoice) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; }
        .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #f4f4f4; }
        .invoice-details { margin: 20px 0; background: #f9f9f9; padding: 15px; border-radius: 5px; }
        .total { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .button { display: inline-block; padding: 12px 25px; background-color: #007bff; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
        .footer { margin-top: 30px; font-size: 12px; color: #777; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>New Invoice Received</h2>
          <p>Invoice <strong>#${invoice.number}</strong></p>
        </div>
        
        <p>Dear ${invoice.clientName},</p>
        <p>We hope this email finds you well. This is a notification that a new invoice has been generated for your account.</p>
        
        <div class="invoice-details">
          <table width="100%">
            <tr>
              <td><strong>Amount Due:</strong></td>
              <td align="right" class="total">${invoice.currency} ${invoice.total}</td>
            </tr>
            <tr>
              <td><strong>Due Date:</strong></td>
              <td align="right">${invoice.dueDate}</td>
            </tr>
          </table>
        </div>

        <p>You can view the details of your invoice or download the PDF version by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${invoice.paymentLink || '#'}" class="button">View & Pay Invoice</a>
        </div>

        <p>If you have any questions, please don't hesitate to contact us.</p>
        
        <div class="footer">
          <p>This is an automated message, please do not reply directly to this email.</p>
          <p>&copy; ${new Date().getFullYear()} YourCompany. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await this.send({
      to,
      subject: `Invoice #${invoice.number} from ${companyOrUsername}`,
      html
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