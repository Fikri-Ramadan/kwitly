export const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FONT =
  "'Plus Jakarta Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

export type EmailLayoutOptions = {
  title: string;
  preheader: string;
  heading: string;
  intro: string;
  buttonLabel: string;
  link: string;
  expiryNote: string;
  ignoreNote: string;
};

export function emailLayout({
  title,
  preheader,
  heading,
  intro,
  buttonLabel,
  link,
  expiryNote,
  ignoreNote,
}: EmailLayoutOptions) {
  const href = escapeHtml(link);
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(title)}</title>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 0; background: #F4F6F8; }
  @media (max-width: 600px) {
    .px { padding-left: 24px !important; padding-right: 24px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#F4F6F8;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
    ${escapeHtml(preheader)}
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#F4F6F8">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">

          <!-- Header -->
          <tr>
            <td class="px" bgcolor="#0B1424" style="background:#0B1424;border-radius:16px 16px 0 0;padding:24px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="32" height="32" align="center" valign="middle" bgcolor="#2DD4BF"
                      style="width:32px;height:32px;border-radius:8px;background:#2DD4BF;color:#0B1424;font-family:${FONT};font-size:18px;font-weight:700;line-height:32px;">K</td>
                  <td style="padding-left:10px;font-family:${FONT};font-size:22px;font-weight:700;letter-spacing:-0.01em;color:#FFFFFF;">Kwitly</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td class="px" bgcolor="#FFFFFF" style="background:#FFFFFF;border:1px solid #E3E8EE;border-top:0;border-radius:0 0 16px 16px;padding:40px;font-family:${FONT};">

              <h1 style="margin:0 0 12px;font-family:${FONT};font-size:26px;line-height:1.25;font-weight:700;letter-spacing:-0.02em;color:#0F1B2D;">
                ${escapeHtml(heading)}
              </h1>
              <p style="margin:0 0 28px;font-family:${FONT};font-size:15px;line-height:1.6;color:#475569;">
                ${escapeHtml(intro)}
              </p>

              <!-- Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" height="48" bgcolor="#0F766E" style="border-radius:10px;background:#0F766E;">
                    <a href="${href}" target="_blank"
                       style="display:block;height:48px;line-height:48px;font-family:${FONT};font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;">
                      ${escapeHtml(buttonLabel)}
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:14px 0 0;font-family:${FONT};font-size:13px;line-height:1.5;color:#475569;text-align:center;">
                ${escapeHtml(expiryNote)}
              </p>

              <!-- Divider -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td style="padding:28px 0 0;border-bottom:1px solid #E3E8EE;font-size:0;line-height:0;">&nbsp;</td></tr>
              </table>

              <!-- Fallback link -->
              <p style="margin:24px 0 6px;font-family:${FONT};font-size:13px;line-height:1.5;color:#475569;">
                Tombol tidak berfungsi? Salin tautan ini ke browser Anda:
              </p>
              <p style="margin:0 0 24px;font-family:${FONT};font-size:13px;line-height:1.5;word-break:break-all;">
                <a href="${href}" target="_blank" style="color:#0F766E;text-decoration:underline;">${href}</a>
              </p>

              <p style="margin:0;font-family:${FONT};font-size:13px;line-height:1.5;color:#475569;">
                ${escapeHtml(ignoreNote)}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px 0;font-family:${FONT};font-size:12px;line-height:1.6;color:#475569;">
              &copy; ${year} Kwitly. Email ini dikirim otomatis, mohon tidak membalas.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}