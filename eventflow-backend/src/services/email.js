const { Resend }   = require('resend')
const nodemailer   = require('nodemailer')

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Main: send QR email ──────────────────────────────────────────────────────

const sendQREmail = async ({ registration, event, qrCode }) => {
  const to = registration.attendee_email
  if (!to) {
    console.warn('No email address for registration:', registration.id)
    return
  }

  const club         = event.clubs || {}
  const attendeeName = registration.attendee_name || 'Attendee'
  const themeColor   = event.theme_color || '#6366f1'
  const eventDate    = event.event_date
    ? new Date(event.event_date).toLocaleString('en-IN', {
        dateStyle: 'full', timeStyle: 'short', timeZone: 'Asia/Kolkata',
      })
    : 'Date TBA'

  const html = buildQREmailHTML({
    attendeeName,
    eventTitle:     event.title,
    eventDate,
    venue:          event.venue || 'Venue TBA',
    clubName:       club.smtp_from_name || club.name || 'EventFlow',
    themeColor,
    qrImageUrl:     qrCode.qr_image_url,
    registrationId: registration.id,
  })

  const subject = `Your Entry Pass — ${event.title}`

  // Use club's custom SMTP if fully configured (Pro feature)
  if (club.smtp_host && club.smtp_user && club.smtp_pass) {
    console.log(`Sending via club SMTP (${club.smtp_host}) to ${to}`)
    await sendViaSMTP({
      host:      club.smtp_host,
      port:      club.smtp_port || 587,
      user:      club.smtp_user,
      pass:      club.smtp_pass,
      fromName:  club.smtp_from_name  || club.name || 'EventFlow',
      fromEmail: club.smtp_from_email || club.smtp_user,
      to, subject, html,
    })
  } else {
    // Default: send via Resend using onboarding@resend.dev
    // This works on Resend free tier without domain verification
    // To use your own domain, verify it at resend.com/domains
    console.log(`Sending via Resend to ${to}`)
    await sendViaResend({
      fromName:  club.name || 'EventFlow',
      fromEmail: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to, subject, html,
    })
  }

  // Mark email as sent
  const supabase = require('../lib/supabase')
  await supabase
    .from('qr_codes')
    .update({ email_sent: true, email_sent_at: new Date().toISOString() })
    .eq('id', qrCode.id)
    .catch(e => console.error('Failed to update email_sent flag:', e))

  console.log(`✅ QR email sent to ${to} for event "${event.title}"`)
}

// ─── Send via Resend ──────────────────────────────────────────────────────────

const sendViaResend = async ({ fromName, fromEmail, to, subject, html }) => {
  const { data, error } = await resend.emails.send({
    from:    `${fromName} <${fromEmail}>`,
    to,
    subject,
    html,
  })

  if (error) {
    console.error('Resend error:', JSON.stringify(error))
    throw new Error(`Resend failed: ${error.message || JSON.stringify(error)}`)
  }

  console.log('Resend response:', data?.id)
  return data
}

// ─── Send via SMTP (nodemailer) ───────────────────────────────────────────────

const sendViaSMTP = async ({ host, port, user, pass, fromName, fromEmail, to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host,
    port:   Number(port),
    secure: Number(port) === 465,
    auth:   { user, pass },
    tls:    { rejectUnauthorized: false },
  })

  const info = await transporter.sendMail({
    from:    `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    html,
  })

  console.log('SMTP response:', info.messageId)
  return info
}

// ─── Generic notification email ───────────────────────────────────────────────

const sendEmail = async ({ to, subject, html, club = {} }) => {
  const fromName  = club.smtp_from_name  || 'EventFlow'
  const fromEmail = club.smtp_from_email || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

  if (club.smtp_host && club.smtp_user && club.smtp_pass) {
    await sendViaSMTP({
      host: club.smtp_host, port: club.smtp_port || 587,
      user: club.smtp_user, pass: club.smtp_pass,
      fromName, fromEmail, to, subject, html,
    })
  } else {
    await sendViaResend({ fromName, fromEmail, to, subject, html })
  }
}

// ─── HTML email template ──────────────────────────────────────────────────────

const buildQREmailHTML = ({
  attendeeName, eventTitle, eventDate, venue,
  clubName, themeColor, qrImageUrl, registrationId,
}) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Entry Pass — ${eventTitle}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f4f4f8;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f8;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

        <tr><td style="background:${themeColor};border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
          <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;">${eventTitle}</h1>
          <p style="margin:8px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Organised by ${clubName}</p>
        </td></tr>

        <tr><td style="background:#fff;padding:36px 40px;">
          <p style="margin:0 0 20px;font-size:16px;color:#1a1a2e;">
            Hi <strong>${attendeeName}</strong>,
          </p>
          <p style="margin:0 0 24px;font-size:14px;color:#6b7280;line-height:1.65;">
            Your registration is <strong style="color:#16a34a;">confirmed</strong>!
            Show this QR code at the entry gate. It is valid for
            <strong>one scan only</strong> — do not share it.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#f9f9fc;border:1px solid #e5e7eb;border-radius:10px;margin:0 0 28px;">
            <tr><td style="padding:18px 22px;">
              <p style="margin:0 0 8px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Date &amp; Time</p>
              <p style="margin:0 0 14px;font-size:14px;color:#111827;font-weight:500;">${eventDate}</p>
              <p style="margin:0 0 8px;font-size:11px;color:#9ca3af;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Venue</p>
              <p style="margin:0;font-size:14px;color:#111827;font-weight:500;">${venue}</p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center" style="padding:28px;background:#f9f9fc;border:2px dashed #e5e7eb;border-radius:14px;">
              ${qrImageUrl
                ? `<img src="${qrImageUrl}" alt="QR Entry Pass" width="220" height="220"
                     style="display:block;margin:0 auto;border-radius:10px;border:4px solid #fff;box-shadow:0 4px 16px rgba(0,0,0,.1);">`
                : `<div style="padding:20px;text-align:center;">
                     <p style="color:#6b7280;font-size:14px;margin:0 0 8px;">QR image unavailable.</p>
                     <p style="color:#9ca3af;font-size:12px;margin:0;">Registration ID: <strong>${registrationId.slice(0,8).toUpperCase()}</strong></p>
                   </div>`
              }
              <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">
                Scan at entry · Valid for one use only
              </p>
            </td></tr>
          </table>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr><td style="padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;">
              <p style="margin:0;font-size:12px;color:#92400e;line-height:1.6;">
                💡 <strong>Tip:</strong> Screenshot this QR now in case you lose internet access at the venue.
                Keep your phone charged.
              </p>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:18px;">
            Registration ID:
            <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;font-family:monospace;">
              ${registrationId.slice(0,8).toUpperCase()}
            </code>
          </p>
        </td></tr>

        <tr><td style="background:#f4f4f8;border-radius:0 0 16px 16px;padding:14px 40px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#9ca3af;">
            Powered by <strong style="color:#6366f1;">EventFlow</strong>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

module.exports = { sendQREmail, sendEmail }
