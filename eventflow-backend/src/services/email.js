const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the QR code email to the attendee.
 * Uses club SMTP if configured (Pro plan), otherwise falls back to Resend.
 */
const sendQREmail = async ({ registration, event, qrCode }) => {
  const to = registration.attendee_email;
  if (!to) {
    console.warn('No email address for registration:', registration.id);
    return;
  }

  const attendeeName = registration.attendee_name || 'Attendee';
  const eventDate = event.event_date
    ? new Date(event.event_date).toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone:  'Asia/Kolkata',
      })
    : 'Date TBA';

  const themeColor = event.theme_color || '#6366f1';

  const html = buildEmailHTML({
    attendeeName,
    eventTitle:   event.title,
    eventDate,
    venue:        event.venue || 'Venue TBA',
    clubName:     event.clubs?.name || 'Event Team',
    themeColor,
    qrImageUrl:   qrCode.qr_image_url,
    registrationId: registration.id,
  });

  const fromName  = event.clubs?.smtp_from_name  || 'EventFlow';
  const fromEmail = event.clubs?.smtp_from_email || 'noreply@eventflow.app';

  try {
    await resend.emails.send({
      from:    `${fromName} <${fromEmail}>`,
      to,
      subject: `Your Entry Pass — ${event.title}`,
      html,
    });

    // Update email_sent flag
    await require('../lib/supabase')
      .from('qr_codes')
      .update({ email_sent: true, email_sent_at: new Date().toISOString() })
      .eq('id', qrCode.id);

    console.log(`QR email sent to ${to} for event ${event.id}`);
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

// ─── HTML Email Template ──────────────────────────────────────────────────────

const buildEmailHTML = ({
  attendeeName,
  eventTitle,
  eventDate,
  venue,
  clubName,
  themeColor,
  qrImageUrl,
  registrationId,
}) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Entry Pass — ${eventTitle}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f5;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:${themeColor};border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">
                ${eventTitle}
              </h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:14px;">
                Organised by ${clubName}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:#ffffff;padding:40px;">

              <p style="margin:0 0 24px;font-size:16px;color:#374151;">
                Hi <strong>${attendeeName}</strong>,
              </p>

              <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
                Your registration is confirmed! Show this QR code at the entry gate.
                It is valid for <strong>one scan only</strong> — please do not share it.
              </p>

              <!-- Event Details -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;margin:0 0 32px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%">
                      <tr>
                        <td style="padding:6px 0;">
                          <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Date &amp; Time</span><br>
                          <span style="font-size:14px;color:#111827;font-weight:500;">${eventDate}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;border-top:1px solid #e5e7eb;">
                          <span style="font-size:12px;color:#9ca3af;text-transform:uppercase;letter-spacing:0.5px;">Venue</span><br>
                          <span style="font-size:14px;color:#111827;font-weight:500;">${venue}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- QR Code -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px;background:#f9fafb;border:2px dashed #e5e7eb;border-radius:12px;">
                    ${qrImageUrl
                      ? `<img src="${qrImageUrl}" alt="Your QR Entry Pass" width="220" height="220"
                           style="display:block;margin:0 auto;border-radius:8px;">`
                      : `<p style="color:#6b7280;font-size:14px;">QR code image unavailable.<br>
                           Your registration ID: <strong>${registrationId}</strong></p>`
                    }
                    <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
                      Scan at the entry gate • Valid for one entry only
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:32px 0 0;font-size:13px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:24px;">
                Registration ID: <code style="font-family:monospace;background:#f3f4f6;padding:2px 6px;border-radius:4px;">${registrationId.slice(0, 8).toUpperCase()}</code>
                &nbsp;•&nbsp; If you have any issues, contact ${clubName} directly.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f4f4f5;border-radius:0 0 12px 12px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                Powered by <strong style="color:#6366f1;">EventFlow</strong>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

module.exports = { sendQREmail };
