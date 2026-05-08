const QRCode = require('qrcode');
const jwt = require('jsonwebtoken');
const supabase = require('../lib/supabase');

/**
 * Generates a signed QR token and saves the QR code record.
 * Returns the qr_code row.
 */
const generateQRCode = async (registrationId, eventId) => {
  // Create a signed JWT as the QR payload
  // This means even without DB lookup, we can verify the token is from us
  const token = jwt.sign(
    {
      registrationId,
      eventId,
      type: 'eventflow_qr',
    },
    process.env.JWT_SECRET,
    { expiresIn: '365d' }   // QR codes are valid for 1 year
  );

  // Generate QR code as base64 PNG
  const qrDataURL = await QRCode.toDataURL(token, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 400,
    color: {
      dark:  '#000000',
      light: '#ffffff',
    },
  });

  // Upload QR image to Supabase Storage
  const buffer = Buffer.from(qrDataURL.split(',')[1], 'base64');
  const filePath = `qr-codes/${eventId}/${registrationId}.png`;

  const { error: uploadError } = await supabase.storage
    .from('eventflow-uploads')
    .upload(filePath, buffer, {
      contentType:  'image/png',
      upsert:       true,
    });

  let qr_image_url = null;
  if (!uploadError) {
    const { data: urlData } = supabase.storage
      .from('eventflow-uploads')
      .getPublicUrl(filePath);
    qr_image_url = urlData.publicUrl;
  }

  // Save QR code record
  const { data: qrCode, error } = await supabase
    .from('qr_codes')
    .insert({
      registration_id: registrationId,
      event_id:        eventId,
      token,
      qr_image_url,
    })
    .select()
    .single();

  if (error) {
    console.error('QR code DB insert error:', error);
    // Still return a usable object with the token even if DB save failed
    return { token, qr_image_url, registration_id: registrationId };
  }

  return qrCode;
};

module.exports = { generateQRCode };
